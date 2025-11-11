import crypto from 'crypto';

import { Inject, Service } from 'typedi';

import { ApplicationMapper } from '@/core/domain';
import { ApplicationStatus } from '@/core/domain/model/Application';
import { SignedDocument, SigningStatus } from '@/core/domain/model/SignedDocument';
import {
	IApplicationRepositoryToken,
	ISignedDocumentRepositoryToken,
} from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { generateId } from '@/core/shared/utils/id-generator';
import { env } from 'env';

import { DocumentHashService } from './DocumentHashService';

import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IEventDispatcher } from '@/core/application/ports/outbound/IEventDispatcher';
import type { ISignedDocumentRepository } from '@/core/application/ports/outbound/ISignedDocumentRepository';
import type { DocumentRetrievalAuthRequest } from '@/core/shared/types/types/eudi';

/**
 * Service responsible for document signing workflows
 * Handles preparation of document retrieval requests for qualified electronic signatures (QES)
 * Domain: Document Signing (matching CredentialVerificationService pattern)
 */
@Service()
export class DocumentSigningService {
	private readonly logger = createLogger('DocumentSigningService');
	private readonly DEFAULT_RESPONSE_TYPE = 'vp_token';
	private readonly DEFAULT_CLIENT_ID_SCHEME = 'x509_san_dns';
	private readonly DEFAULT_RESPONSE_MODE = 'direct_post';
	private readonly DEFAULT_SIGNATURE_QUALIFIER = 'eu_eidas_qes';
	private readonly DEFAULT_HASH_ALGORITHM_OID = '2.16.840.1.101.3.4.2.1'; // SHA-256

	constructor(
		@Inject(ISignedDocumentRepositoryToken)
		private readonly signedDocumentRepo: ISignedDocumentRepository,
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		@Inject('IEventDispatcher') private readonly eventDispatcher: IEventDispatcher,
		private readonly documentHashService: DocumentHashService,
	) {}

	/**
	 * Initiate document signing for an application
	 * Creates a signing transaction and stores document for signing
	 *
	 * @param applicationId - The application ID
	 * @param documentContent - The PDF/document bytes to be signed
	 * @param documentType - Type of document (e.g., "employment_contract")
	 * @param documentLabel - Display label (e.g., "Contract.pdf")
	 * @returns The created SignedDocument record with state UUID
	 */
	async initDocumentSigning(
		applicationId: string,
		documentContent: Buffer,
		documentType: string,
		documentLabel: string,
	) {
		// Verify application exists
		const application = await this.applicationRepo.findById(applicationId);
		if (!application) {
			throw new Error(`Application ${applicationId} not found`);
		}

		// Generate unique state and nonce for this transaction
		const state = crypto.randomUUID();
		const nonce = crypto.randomUUID();

		// Calculate document hash
		const documentHash = this.documentHashService.calculateDocumentHash(documentContent);

		//Create SignedDocument domain entity
		const signedDocument = SignedDocument.create({
			id: generateId(),
			applicationId,
			documentHash,
			documentType,
			documentLabel,
			documentContent,
			state,
			nonce,
		});

		//Persist domain entity through repository
		const savedDocument = await this.signedDocumentRepo.save(signedDocument);

		return savedDocument;
	}

	/**
	 * Prepare document retrieval request for signing
	 * Called when wallet accesses the request_uri endpoint
	 *
	 * @param state - State parameter for request tracking
	 * @returns Document retrieval authentication request payload
	 */
	async prepareDocumentRetrievalRequest(state: string): Promise<DocumentRetrievalAuthRequest> {
		// Fetch the signed document record to get the hash and nonce
		const signedDocument = await this.signedDocumentRepo.findByState(state);
		if (!signedDocument) {
			throw new Error(`Signed document with state ${state} not found`);
		}

		// Get client_id from environment
		const clientId = new URL(env.NEXT_PUBLIC_APP_URI).hostname;

		return {
			response_type: this.DEFAULT_RESPONSE_TYPE,
			client_id: clientId,
			client_id_scheme: this.DEFAULT_CLIENT_ID_SCHEME,
			response_mode: this.DEFAULT_RESPONSE_MODE,
			response_uri: `${env.NEXT_PUBLIC_APP_URI}/api/signed-document/${state}`,
			nonce: signedDocument.getNonce(),
			state: state,
			signatureQualifier: this.DEFAULT_SIGNATURE_QUALIFIER,
			documentDigests: [
				{
					hash: signedDocument.getDocumentHash(),
					label: signedDocument.getDocumentLabel(),
				},
			],
			documentLocations: [
				{
					uri: `${env.NEXT_PUBLIC_APP_URI}/api/documents/${state}`,
					method: {
						type: 'public',
					},
				},
			],
			hashAlgorithmOID: this.DEFAULT_HASH_ALGORITHM_OID,
			clientData: '',
		};
	}

	/**
	 * Get document content for wallet to sign
	 * Uses findByStateWithContent to fetch the actual document bytes
	 */
	async getDocumentForSigning(state: string): Promise<Buffer | null> {
		// Use special method that includes documentContent
		const signedDocument = await this.signedDocumentRepo.findByStateWithContent(state);
		if (!signedDocument || !signedDocument.getDocumentContent()) {
			return null;
		}

		try {
			// Prisma returns Uint8Array, convert to Buffer
			// Handle potential detached ArrayBuffer errors
			const content = signedDocument.getDocumentContent();

			if (!content) {
				return null;
			}

			// Check if the buffer is detached
			if (content instanceof Uint8Array && content.buffer.byteLength === 0) {
				this.logger.error('Detached ArrayBuffer detected', new Error(`State: ${state}`));
				return null;
			}

			return Buffer.from(content);
		} catch (error) {
			this.logger.error('Error converting document content', error as Error);
			return null;
		}
	}

	/**
	 * Extract and validate nonce from VP token
	 * The VP token is a JWT that should contain the nonce in its payload
	 *
	 * @param vpToken - The VP token JWT from the wallet callback
	 * @returns The extracted nonce, or null if invalid
	 */
	private extractNonceFromVpToken(vpToken: string): string | null {
		try {
			// VP token is a JWT - decode the payload (second part)
			const parts = vpToken.split('.');
			if (parts.length !== 3) {
				this.logger.error('Invalid VP token format', new Error('Expected 3 parts'));
				return null;
			}

			// Decode the payload (base64url)
			const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));

			// Extract nonce from payload
			if (payload.nonce && typeof payload.nonce === 'string') {
				return payload.nonce;
			}

			this.logger.error('No nonce found in VP token payload', new Error(JSON.stringify(payload)));
			return null;
		} catch (error) {
			this.logger.error('Failed to extract nonce from VP token', error as Error);
			return null;
		}
	}

	/**
	 * Process signed document callback from wallet
	 * Handles both success and failure responses
	 *
	 * SECURITY: Validates nonce to prevent replay attacks
	 */
	async processSignedDocument(
		state: string,
		payload: {
			documentWithSignature?: string[];
			signatureObject?: string[];
			vpToken?: string;
			error?: string;
		},
	) {
		const signedDocument = await this.signedDocumentRepo.findByState(state);
		if (!signedDocument) {
			throw new Error(`Signed document with state ${state} not found`);
		}

		// Handle error response from wallet
		if (payload.error) {
			await this.signedDocumentRepo.updateByState(state, {
				status: SigningStatus.FAILED,
				errorCode: payload.error,
			});
			return { success: false, error: payload.error };
		}

		// SECURITY: Validate nonce from VP token to prevent replay attacks
		if (payload.vpToken) {
			const receivedNonce = this.extractNonceFromVpToken(payload.vpToken);
			const expectedNonce = signedDocument.getNonce();

			if (!receivedNonce) {
				this.logger.error('Failed to extract nonce from VP token', new Error(`State: ${state}`));
				await this.signedDocumentRepo.updateByState(state, {
					status: SigningStatus.FAILED,
					errorCode: 'invalid_vp_token',
				});
				return { success: false, error: 'Invalid VP token: could not extract nonce' };
			}

			if (receivedNonce !== expectedNonce) {
				this.logger.error(
					'Nonce mismatch - possible replay attack',
					new Error(`State: ${state}, Expected: ${expectedNonce}, Received: ${receivedNonce}`),
				);
				await this.signedDocumentRepo.updateByState(state, {
					status: SigningStatus.FAILED,
					errorCode: 'nonce_mismatch',
				});
				return { success: false, error: 'Nonce validation failed' };
			}

			this.logger.info('Nonce validated successfully', { state, nonce: receivedNonce });
		} else {
			// VP token is optional in some flows, but we log a warning
			this.logger.warn('No VP token provided in callback - nonce not validated', { state });
		}

		// Handle successful signing
		const documentWithSignature = payload.documentWithSignature?.[0];
		const signatureObject = payload.signatureObject?.[0];

		if (!documentWithSignature && !signatureObject) {
			await this.signedDocumentRepo.updateByState(state, {
				status: SigningStatus.FAILED,
				errorCode: 'missing_signature',
			});
			return { success: false, error: 'No signature data received' };
		}

		// Apply domain command: mark as signed (this raises DocumentSigned event)
		signedDocument.markAsSigned({
			documentWithSignature: Buffer.from(documentWithSignature || '', 'base64'),
			signatureObject: signatureObject || undefined,
		});

		// Store the signed document
		await this.signedDocumentRepo.updateByState(state, {
			status: SigningStatus.SIGNED,
			documentWithSignature: documentWithSignature
				? Buffer.from(documentWithSignature, 'base64')
				: undefined,
			signatureObject: signatureObject,
			signedAt: new Date(),
		});

		// Publish domain events from SignedDocument
		const docEvents = signedDocument.getDomainEvents();
		if (docEvents.length > 0) {
			await this.eventDispatcher.publishAll(docEvents);
			signedDocument.clearDomainEvents();
		}

		// Update application status to SIGNED
		const applicationId = signedDocument.getApplicationId();
		const prismaApp = await this.applicationRepo.findById(applicationId);
		if (prismaApp) {
			const app = ApplicationMapper.toDomain(prismaApp);
			if (app.getStatus() === ApplicationStatus.SIGNING) {
				app.markAsSigned();
				await this.applicationRepo.update(applicationId, {
					status: app.getStatus(),
				});
			}
		}

		return { success: true };
	}

	/**
	 * Check signing status for an application
	 */
	async checkSigningStatus(applicationId: string) {
		const signedDocument = await this.signedDocumentRepo.findLatestByApplicationId(applicationId);

		if (!signedDocument) {
			return { status: 'NOT_INITIATED' };
		}

		return {
			status: signedDocument.getStatus(),
			signedAt: signedDocument.getSignedAt(),
			errorCode: signedDocument.getErrorCode(),
		};
	}

	/**
	 * Get human-readable description of signature qualifier
	 */
	public getSignatureQualifierDescription(): string {
		return 'Qualified electronic signature (eIDAS QES)';
	}
}
