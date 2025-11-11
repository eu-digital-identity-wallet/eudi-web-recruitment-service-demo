import type { CandidateInfo } from '@/core/domain/model/CandidateInfo';
import type { CredentialType } from '@/core/domain/value-objects';

/**
 * Port for Credential Verification Operations
 *
 * Business capability: Verify credentials presented by applicants during the application process
 * This port abstracts the credential verification process using OpenID4VP protocol
 */
export interface ICredentialVerificationPort {
	/**
	 * Initiate a credential verification request
	 *
	 * @param applicationId - Unique identifier for the application
	 * @param credentialTypes - Types of credentials to request (PID, DIPLOMA, SEAFARER, etc.)
	 * @param sameDeviceFlow - Whether to use same-device or cross-device flow
	 * @returns Verification request details including deep link and transaction ID
	 */
	initiateVerification(
		applicationId: string,
		credentialTypes: CredentialType[],
		sameDeviceFlow: boolean,
	): Promise<VerificationRequestResult>;

	/**
	 * Check the status of an ongoing verification and retrieve verified data
	 *
	 * @param transactionId - Transaction ID from initiateVerification
	 * @param responseCode - Optional response code for same-device flow
	 * @returns Verification result with extracted candidate information
	 */
	checkVerificationStatus(
		transactionId: string,
		responseCode?: string,
	): Promise<VerificationResult>;
}

/**
 * Result of initiating a verification request
 */
export interface VerificationRequestResult {
	/** Deep link URL for the wallet to process */
	requestUri: string;
	/** Transaction ID for tracking this verification */
	transactionId: string;
}

/**
 * Result of a verification check
 */
export interface VerificationResult {
	/** Current status of the verification */
	status: 'PENDING' | 'VERIFIED' | 'FAILED';
	/** Extracted candidate information (only when status is VERIFIED) */
	candidateInfo?: CandidateInfo;
	/** Error message (only when status is FAILED) */
	error?: string;
}
