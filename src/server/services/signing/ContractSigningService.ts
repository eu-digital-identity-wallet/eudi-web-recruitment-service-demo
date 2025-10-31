import crypto from 'crypto';

import { Service } from 'typedi';

import { ApplicationRepository } from '@/server/repositories/ApplicationRepository';
import { SignedDocumentRepository } from '@/server/repositories/SignedDocumentRepository';
import { DocumentRetrievalAuthRequest } from '@/server/types/eudi';
import { env } from 'env';

import { DocumentHashService } from './DocumentHashService';

/**
 * Service responsible for document signing workflows
 * Handles preparation of document retrieval requests for qualified electronic signatures (QES)
 * Domain: Document Signing (matching CredentialVerificationService pattern)
 */
@Service()
export class DocumentSigningService {
	private readonly DEFAULT_RESPONSE_TYPE = 'vp_token';
	private readonly DEFAULT_CLIENT_ID_SCHEME = 'x509_san_dns';
	private readonly DEFAULT_RESPONSE_MODE = 'direct_post';
	private readonly DEFAULT_SIGNATURE_QUALIFIER = 'eu_eidas_qes';
	private readonly DEFAULT_HASH_ALGORITHM_OID = '2.16.840.1.101.3.4.2.1'; // SHA-256

	constructor(
		private readonly signedDocumentRepo: SignedDocumentRepository,
		private readonly applicationRepo: ApplicationRepository,
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

		// Create signed document record
		const signedDocument = await this.signedDocumentRepo.create({
			application: {
				connect: { id: applicationId },
			},
			documentHash,
			documentType,
			documentLabel,
			documentContent,
			state,
			nonce,
			status: 'PENDING',
		});

		return signedDocument;
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
			nonce: signedDocument.nonce,
			state: state,
			signatureQualifier: this.DEFAULT_SIGNATURE_QUALIFIER,
			documentDigests: [
				{
					hash: signedDocument.documentHash,
					label: signedDocument.documentLabel,
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
		if (!signedDocument || !signedDocument.documentContent) {
			return null;
		}

		try {
			// Prisma returns Uint8Array, convert to Buffer
			// Handle potential detached ArrayBuffer errors
			const content = signedDocument.documentContent;

			// Check if the buffer is detached
			if (content instanceof Uint8Array && content.buffer.byteLength === 0) {
				console.error('[DocumentSigningService] Detached ArrayBuffer detected for state:', state);
				return null;
			}

			return Buffer.from(content);
		} catch (error) {
			console.error('[DocumentSigningService] Error converting document content:', error);
			return null;
		}
	}

	/**
	 * Process signed document callback from wallet
	 * Handles both success and failure responses
	 */
	async processSignedDocument(
		state: string,
		payload: {
			documentWithSignature?: string[];
			signatureObject?: string[];
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
				status: 'FAILED',
				errorCode: payload.error,
			});
			return { success: false, error: payload.error };
		}

		// Handle successful signing
		const documentWithSignature = payload.documentWithSignature?.[0];
		const signatureObject = payload.signatureObject?.[0];

		if (!documentWithSignature && !signatureObject) {
			await this.signedDocumentRepo.updateByState(state, {
				status: 'FAILED',
				errorCode: 'missing_signature',
			});
			return { success: false, error: 'No signature data received' };
		}

		// Store the signed document
		await this.signedDocumentRepo.updateByState(state, {
			status: 'SIGNED',
			documentWithSignature: documentWithSignature
				? Buffer.from(documentWithSignature, 'base64')
				: undefined,
			signatureObject: signatureObject,
			signedAt: new Date(),
		});

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
			status: signedDocument.status,
			signedAt: signedDocument.signedAt,
			errorCode: signedDocument.errorCode,
		};
	}

	/**
	 * Get human-readable description of signature qualifier
	 */
	public getSignatureQualifierDescription(): string {
		return 'Qualified electronic signature (eIDAS QES)';
	}
}
