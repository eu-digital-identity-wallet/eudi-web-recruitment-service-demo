import type { IssuedCredential } from '@/core/domain/model/IssuedCredential';
import type { Application, Vacancy } from '@prisma/client';

/**
 * Port interface for credential issuance
 * Abstracts the external EUDI Issuer API
 */
export interface IIssuerPort {
	/**
	 * Issue an employee ID credential
	 * @param application - Application with vacancy information
	 * @returns OpenID4VCI credential offer URL and optional OTP
	 */
	issueEmployeeId(
		application: Application & { vacancy: Vacancy },
	): Promise<IssueEmployeeIdResponse>;

	/**
	 * Get issued credential by application ID and type
	 * @param applicationId - Application identifier
	 * @param credentialType - Type of credential
	 * @returns Credential data if found
	 */
	getCredentialByApplicationId(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredential | null>;
}

/**
 * Response for employee ID credential issuance
 */
export interface IssueEmployeeIdResponse {
	offerUrl: string;
	otp?: string;
}
