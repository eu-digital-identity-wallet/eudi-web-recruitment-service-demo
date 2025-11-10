/**
 * Inbound Port: Get Supplementary Credentials Deep Link Use Case
 * Defines the contract for retrieving verification deep link for additional credentials
 * (DIPLOMA, SEAFARER, TAXRESIDENCY, etc.)
 */
export interface IGetSupplementaryCredentialsDeepLinkUseCase {
	execute(applicationId: string): Promise<string>;
}
