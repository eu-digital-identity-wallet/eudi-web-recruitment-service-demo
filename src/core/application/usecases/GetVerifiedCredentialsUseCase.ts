import 'server-only';

import { Inject, Service } from '@/core/infrastructure/config/container';
import { IVerifiedCredentialRepositoryToken } from '@/core/infrastructure/config/container';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetVerifiedCredentialsUseCase } from '@/core/application/ports/inbound';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';

/**
 * DTO for Verified Credential - plain data structure for presentation layer
 */
export type VerifiedCredentialDTO = {
	id: string;
	credentialType: string;
	credentialData: Record<string, unknown>;
	status: string;
	verifiedAt: Date | null;
	createdAt: Date;
};

/**
 * Use Case: Get Verified Credentials
 * Retrieves all verified credentials for an application
 * Returns DTOs (plain objects) to avoid exposing domain layer to presentation layer
 */
@Service()
export class GetVerifiedCredentialsUseCase implements IGetVerifiedCredentialsUseCase {
	constructor(
		@Inject(IVerifiedCredentialRepositoryToken)
		private readonly verifiedCredentialRepo: IVerifiedCredentialRepository,
	) {}

	@ValidateInput(applicationIdSchema)
	public async execute(applicationId: string): Promise<VerifiedCredentialDTO[]> {
		const domainCredentials = await this.verifiedCredentialRepo.findByApplicationId(applicationId);

		// Map domain objects to DTOs (plain data)
		return domainCredentials.map((cred) => ({
			id: cred.getId(),
			credentialType: cred.getCredentialType(),
			credentialData: cred.getCredentialData(),
			status: cred.getStatus(),
			verifiedAt: cred.getVerifiedAt(),
			createdAt: cred.getCreatedAt(),
		}));
	}
}
