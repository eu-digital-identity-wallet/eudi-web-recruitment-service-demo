import type { CredentialType } from '@/core/domain/value-objects';
import type { VerificationResponse } from '@/core/shared/types/types/eudi';

/**
 * Port interface for credential verification
 * Abstracts the external EUDI Verifier API
 */
export interface IVerifierPort {
	/**
	 * Initialize a verification request
	 * @param applicationId - Unique identifier for the application
	 * @param sameDeviceFlow - Whether to use same-device or cross-device flow
	 * @param credentialType - Types of credentials to verify (PID, DIPLOMA, etc.)
	 * @returns Deep link URL and transaction ID for tracking
	 */
	initVerification(
		applicationId: string,
		sameDeviceFlow: boolean,
		credentialType: CredentialType[],
	): Promise<InitVerificationResult>;

	/**
	 * Check the status of an ongoing verification
	 * @param transactionId - Transaction ID from initVerification
	 * @param responseCode - Optional response code for same-device flow
	 * @returns Verification status and extracted personal information
	 */
	checkVerification(transactionId: string, responseCode?: string): Promise<VerificationResponse>;
}

/**
 * Domain model for verification initialization result
 */
export interface InitVerificationResult {
	requestUri: string;
	TransactionId: string;
}
