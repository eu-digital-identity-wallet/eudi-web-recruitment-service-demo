import 'server-only';
import { Inject, Service } from 'typedi';

import {
	IApplicationRepositoryToken,
	ISignedDocumentRepositoryToken,
} from '@/core/infrastructure/config/container';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetSigningPageDetailsUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { ISignedDocumentRepository } from '@/core/application/ports/outbound/ISignedDocumentRepository';
import type { Application } from '@prisma/client';

/**
 * DTO for Signed Document - plain data structure for presentation layer
 */
export type SignedDocumentDTO = {
	id: string;
	applicationId: string;
	state: string;
	documentLabel: string;
	signedAt: Date | null;
	createdAt: Date;
};

/**
 * DTO for Signing Page Details - plain data structure for presentation layer
 */
export type SigningPageDetailsDTO = {
	application: Application & { vacancy: { title: string; description: string } | null };
	signedDocument: SignedDocumentDTO;
} | null;

/**
 * Use Case: Get Signing Page Details
 * Retrieves application and pending signed document for the signing page
 * Returns DTO (plain object) to avoid exposing domain layer to presentation layer
 */
@Service()
export class GetSigningPageDetailsUseCase implements IGetSigningPageDetailsUseCase {
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		@Inject(ISignedDocumentRepositoryToken)
		private readonly signedDocumentRepo: ISignedDocumentRepository,
	) {}

	@ValidateInput(applicationIdSchema)
	public async execute(applicationId: string): Promise<SigningPageDetailsDTO> {
		try {
			const application = await this.applicationRepo.findByIdWithVacancy(applicationId);
			if (!application) return null;

			const domainSignedDocument =
				await this.signedDocumentRepo.findLatestByApplicationId(applicationId);
			if (!domainSignedDocument || !domainSignedDocument.canBeSigned()) {
				return null;
			}

			// Map domain object to DTO (plain data)
			const signedDocumentDTO: SignedDocumentDTO = {
				id: domainSignedDocument.getId(),
				applicationId: domainSignedDocument.getApplicationId(),
				state: domainSignedDocument.getState(),
				documentLabel: domainSignedDocument.getDocumentLabel(),
				signedAt: domainSignedDocument.getSignedAt(),
				createdAt: domainSignedDocument.getCreatedAt(),
			};

			return {
				application,
				signedDocument: signedDocumentDTO,
			};
		} catch {
			throw new Error(
				`Database connection failed. Please ensure PostgreSQL is running at localhost:5432 and the database is set up. Run: npx prisma db push`,
			);
		}
	}
}
