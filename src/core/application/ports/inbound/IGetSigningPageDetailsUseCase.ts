import type { SigningPageDetailsDTO } from '@/core/application/usecases/GetSigningPageDetailsUseCase';

/**
 * Inbound Port: Get Signing Page Details Use Case
 * Defines the contract for retrieving application and signed document for the signing page
 * Returns DTO (plain data) instead of domain entity
 */
export interface IGetSigningPageDetailsUseCase {
	execute(applicationId: string): Promise<SigningPageDetailsDTO>;
}
