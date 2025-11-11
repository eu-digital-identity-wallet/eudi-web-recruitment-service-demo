import type { IssuedCredentialDTO } from '@/core/application/usecases/GetIssuedCredentialUseCase';

/**
 * Inbound Port: Get Issued Credential Use Case
 * Defines the contract for retrieving an issued credential by application ID and type
 * Returns DTO (plain data) instead of domain entity
 */
export interface IGetIssuedCredentialUseCase {
	execute(applicationId: string, credentialType: string): Promise<IssuedCredentialDTO>;
}
