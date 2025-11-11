import type { SignedDocument } from '@/core/domain/model/SignedDocument';

/**
 * Port for Document Signing Operations
 *
 * Business capability: Enable applicants to sign documents using Qualified Electronic Signatures (QES)
 * This port abstracts the electronic signature process using EUDI Wallet signing capabilities
 */
export interface IDocumentSigningPort {
	/**
	 * Initiate a document signing request
	 *
	 * @param applicationId - The application for which to sign a document
	 * @param documentContent - The document content to be signed (PDF bytes)
	 * @param documentType - Type of document (e.g., 'APPLICATION_FORM', 'CONTRACT')
	 * @param documentLabel - Human-readable label for the document
	 * @returns Signing request details including state and nonce
	 */
	initiateDocumentSigning(
		applicationId: string,
		documentContent: Buffer,
		documentType: string,
		documentLabel: string,
	): Promise<SigningRequestResult>;

	/**
	 * Check the status of an ongoing document signing process
	 *
	 * @param state - State identifier from initiateDocumentSigning
	 * @returns Current signing status and signed document if complete
	 */
	checkSigningStatus(state: string): Promise<SigningStatusResult>;

	/**
	 * Retrieve a signed document
	 *
	 * @param state - State identifier
	 * @returns The signed document with signature data
	 */
	getSignedDocument(state: string): Promise<SignedDocument | null>;
}

/**
 * Result of initiating a document signing request
 */
export interface SigningRequestResult {
	/** State identifier for tracking this signing request */
	state: string;
	/** Nonce for security */
	nonce: string;
	/** Document hash for verification */
	documentHash: string;
	/** Signing URL for the wallet */
	signingUrl: string;
}

/**
 * Result of checking signing status
 */
export interface SigningStatusResult {
	/** Current status of the signing process */
	status: 'PENDING' | 'SIGNED' | 'FAILED';
	/** Signed document (only when status is SIGNED) */
	signedDocument?: SignedDocument;
	/** Error code (only when status is FAILED) */
	errorCode?: string;
}
