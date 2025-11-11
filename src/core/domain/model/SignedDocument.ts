/**
 * SignedDocument - Domain Entity
 *
 * Represents a document signing transaction via EUDI Wallet.
 * Contains business rules for document signing lifecycle and status transitions.
 */

import { DocumentSigned } from '@/core/domain/events';
import {
	ApplicationId,
	CreatedAt,
	DocumentHash,
	DocumentLabel,
	DocumentType,
	EntityId,
	ErrorCode,
	Nonce,
	SignatureObject,
	SignatureQualifier,
	SignedAt,
	SignerCertificate,
	State,
} from '@/core/domain/value-objects';

import type { DomainEvent } from '@/core/domain/events';

export enum SigningStatus {
	PENDING = 'PENDING',
	SIGNED = 'SIGNED',
	FAILED = 'FAILED',
}

export class SignedDocument {
	private domainEvents: DomainEvent[] = [];

	private constructor(
		private readonly id: EntityId,
		private readonly applicationId: ApplicationId,
		private readonly documentHash: DocumentHash,
		private readonly documentType: DocumentType,
		private readonly documentLabel: DocumentLabel,
		private readonly documentContent: Buffer | null,
		private readonly state: State,
		private readonly nonce: Nonce,
		private documentWithSignature: Buffer | null,
		private signatureObject: SignatureObject | null,
		private signatureQualifier: SignatureQualifier | null,
		private signerCertificate: SignerCertificate | null,
		private status: SigningStatus,
		private errorCode: ErrorCode | null,
		private signedAt: SignedAt | null,
		private readonly createdAt: CreatedAt,
	) {}

	// Factory method for creating new signed documents
	static create(data: {
		id: string;
		applicationId: string;
		documentHash: string;
		documentType: string;
		documentLabel: string;
		documentContent: Buffer | null;
		state: string;
		nonce: string;
	}): SignedDocument {
		return new SignedDocument(
			EntityId.create(data.id),
			ApplicationId.create(data.applicationId),
			DocumentHash.create(data.documentHash),
			DocumentType.create(data.documentType),
			DocumentLabel.create(data.documentLabel),
			data.documentContent,
			State.create(data.state),
			Nonce.create(data.nonce),
			null, // documentWithSignature
			null, // signatureObject
			null, // signatureQualifier
			null, // signerCertificate
			SigningStatus.PENDING,
			null, // errorCode
			null, // signedAt
			CreatedAt.now(),
		);
	}

	// Factory method for reconstituting from database
	static reconstitute(data: {
		id: string;
		applicationId: string;
		documentHash: string;
		documentType: string;
		documentLabel: string;
		documentContent: Buffer | null;
		state: string;
		nonce: string;
		documentWithSignature: Buffer | null;
		signatureObject: string | null;
		signatureQualifier: string | null;
		signerCertificate: string | null;
		status: SigningStatus;
		errorCode: string | null;
		signedAt: Date | null;
		createdAt: Date;
	}): SignedDocument {
		return new SignedDocument(
			EntityId.create(data.id),
			ApplicationId.create(data.applicationId),
			DocumentHash.create(data.documentHash),
			DocumentType.create(data.documentType),
			DocumentLabel.create(data.documentLabel),
			data.documentContent,
			State.create(data.state),
			Nonce.create(data.nonce),
			data.documentWithSignature,
			data.signatureObject ? SignatureObject.create(data.signatureObject) : null,
			data.signatureQualifier ? SignatureQualifier.create(data.signatureQualifier) : null,
			data.signerCertificate ? SignerCertificate.create(data.signerCertificate) : null,
			data.status,
			data.errorCode ? ErrorCode.create(data.errorCode) : null,
			data.signedAt ? SignedAt.create(data.signedAt) : null,
			CreatedAt.create(data.createdAt),
		);
	}

	// Business Rules

	/**
	 * Business Rule: Document can only be signed if currently pending
	 */
	canBeSigned(): boolean {
		return this.status === SigningStatus.PENDING;
	}

	/**
	 * Business Rule: Check if document has been successfully signed
	 */
	isSigned(): boolean {
		return this.status === SigningStatus.SIGNED;
	}

	/**
	 * Business Rule: Check if signing has failed
	 */
	hasFailed(): boolean {
		return this.status === SigningStatus.FAILED;
	}

	/**
	 * Business Rule: Check if document is still pending signature
	 */
	isPending(): boolean {
		return this.status === SigningStatus.PENDING;
	}

	/**
	 * Business Rule: Check if document has signature data
	 */
	hasSignature(): boolean {
		return this.documentWithSignature !== null;
	}

	// Commands (state changes)

	/**
	 * Command: Mark document as successfully signed
	 */
	markAsSigned(signatureData: {
		documentWithSignature: Buffer;
		signatureObject?: string;
		signatureQualifier?: string;
		signerCertificate?: string;
	}): void {
		if (!this.canBeSigned()) {
			throw new Error('Document cannot be signed: not in pending status');
		}
		this.status = SigningStatus.SIGNED;
		this.documentWithSignature = signatureData.documentWithSignature;
		this.signatureObject = signatureData.signatureObject
			? SignatureObject.create(signatureData.signatureObject)
			: null;
		this.signatureQualifier = signatureData.signatureQualifier
			? SignatureQualifier.create(signatureData.signatureQualifier)
			: null;
		this.signerCertificate = signatureData.signerCertificate
			? SignerCertificate.create(signatureData.signerCertificate)
			: null;
		this.signedAt = SignedAt.now();

		// Raise domain event
		this.addDomainEvent(
			new DocumentSigned(
				this.id.getValue(),
				this.applicationId.getValue(),
				this.documentType.getValue(),
				this.signatureQualifier ? this.signatureQualifier.getValue() : 'unknown',
			),
		);
	}

	/**
	 * Command: Mark document signing as failed
	 */
	markAsFailed(errorCode: string): void {
		if (!this.canBeSigned()) {
			throw new Error('Document cannot be marked as failed: not in pending status');
		}
		if (!errorCode || errorCode.trim().length === 0) {
			throw new Error('Error code must be provided');
		}
		this.status = SigningStatus.FAILED;
		this.errorCode = ErrorCode.create(errorCode);
	}

	// Queries (getters)

	getId(): string {
		return this.id.getValue();
	}

	getApplicationId(): string {
		return this.applicationId.getValue();
	}

	getDocumentHash(): string {
		return this.documentHash.getValue();
	}

	getDocumentType(): string {
		return this.documentType.getValue();
	}

	getDocumentLabel(): string {
		return this.documentLabel.getValue();
	}

	getDocumentContent(): Buffer | null {
		return this.documentContent;
	}

	getState(): string {
		return this.state.getValue();
	}

	getNonce(): string {
		return this.nonce.getValue();
	}

	getDocumentWithSignature(): Buffer | null {
		return this.documentWithSignature;
	}

	getSignatureObject(): string | null {
		return this.signatureObject ? this.signatureObject.getValue() : null;
	}

	getSignatureQualifier(): string | null {
		return this.signatureQualifier ? this.signatureQualifier.getValue() : null;
	}

	getSignerCertificate(): string | null {
		return this.signerCertificate ? this.signerCertificate.getValue() : null;
	}

	getStatus(): SigningStatus {
		return this.status;
	}

	getErrorCode(): string | null {
		return this.errorCode ? this.errorCode.getValue() : null;
	}

	getSignedAt(): Date | null {
		return this.signedAt ? this.signedAt.getValue() : null;
	}

	getCreatedAt(): Date {
		return this.createdAt.getValue();
	}

	// Domain Events

	/**
	 * Add a domain event to be published later
	 */
	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	/**
	 * Get all domain events raised by this aggregate
	 */
	getDomainEvents(): readonly DomainEvent[] {
		return [...this.domainEvents];
	}

	/**
	 * Clear domain events after they've been published
	 */
	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}
