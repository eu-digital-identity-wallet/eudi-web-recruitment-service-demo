import type { Application } from '@/core/domain/model/Application';
import type { IssuedCredential } from '@/core/domain/model/IssuedCredential';
import type { Vacancy } from '@/core/domain/model/Vacancy';

/**
 * Port for Credential Issuance Operations
 *
 * Business capability: Issue verifiable credentials to applicants after successful application
 * This port abstracts the credential issuance process using OpenID4VCI protocol
 */
export interface ICredentialIssuancePort {
	/**
	 * Issue an application receipt credential to the applicant
	 *
	 * @param application - The application for which to issue a receipt
	 * @param vacancy - The vacancy associated with the application
	 * @returns Credential offer details including URL and optional OTP
	 */
	issueApplicationReceipt(
		application: Application,
		vacancy: Vacancy,
	): Promise<CredentialOfferResult>;

	/**
	 * Retrieve an issued credential by application
	 *
	 * @param applicationId - Application identifier
	 * @param credentialType - Type of credential to retrieve
	 * @returns The issued credential if found
	 */
	getIssuedCredential(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredential | null>;
}

/**
 * Result of a credential issuance operation
 */
export interface CredentialOfferResult {
	/** OpenID4VCI credential offer URL */
	offerUrl: string;
	/** Optional OTP for additional security */
	otp?: string;
}
