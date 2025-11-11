import type { VerifiedCredentialDTO } from '@/core/application/usecases/GetVerifiedCredentialsUseCase';

/**
 * Inbound Port: Get Verified Credentials
 * Returns DTOs (plain data) instead of domain entities
 */
export interface IGetVerifiedCredentialsUseCase {
	execute(applicationId: string): Promise<VerifiedCredentialDTO[]>;
}
