import 'server-only';
import { Inject, Service } from 'typedi';

import { ICredentialRepositoryToken } from '@/core/infrastructure/config/container';

import type { IGetIssuedCredentialUseCase } from '@/core/application/ports/inbound';
import type { IIssuedCredentialRepository } from '@/core/application/ports/outbound/IIssuedCredentialRepository';

/**
 * DTO for Issued Credential - plain data structure for presentation layer
 */
export type IssuedCredentialDTO = {
	id: string;
	applicationId: string;
	credentialType: string;
	offerUrl: string | null;
	otp: string | null;
	issuedAt: Date | null;
} | null;

/**
 * Use Case: Get Issued Credential
 * Retrieves an issued credential by application ID and credential type
 * Returns DTO (plain object) to avoid exposing domain layer to presentation layer
 */
@Service()
export class GetIssuedCredentialUseCase implements IGetIssuedCredentialUseCase {
	constructor(
		@Inject(ICredentialRepositoryToken)
		private readonly credentialRepo: IIssuedCredentialRepository,
	) {}

	public async execute(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredentialDTO> {
		try {
			const domainCredential = await this.credentialRepo.findByApplicationIdAndType(
				applicationId,
				credentialType,
			);

			if (!domainCredential) {
				return null;
			}

			// Map domain object to DTO (plain data)
			return {
				id: domainCredential.getId(),
				applicationId: domainCredential.getApplicationId(),
				credentialType: domainCredential.getCredentialType(),
				offerUrl: domainCredential.getCredentialOfferUrl(),
				otp: domainCredential.getOtp(),
				issuedAt: domainCredential.getClaimedAt(),
			};
		} catch {
			throw new Error(
				`Database connection failed. Please ensure PostgreSQL is running at localhost:5432 and the database is set up. Run: npx prisma db push`,
			);
		}
	}
}
