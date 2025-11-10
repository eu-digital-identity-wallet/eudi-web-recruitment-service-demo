import 'server-only';

import { Inject, Service } from '@/core/infrastructure/config/container';
import { IApplicationRepositoryToken } from '@/core/infrastructure/config/container';

import { GetVerifiedCredentialsUseCase } from './GetVerifiedCredentialsUseCase';

import type { IGetTaxResidencyPageDataUseCase } from '@/core/application/ports/inbound/IGetTaxResidencyPageDataUseCase';
import type { TaxResidencyPageDTO } from '@/core/application/ports/inbound/IGetTaxResidencyPageDataUseCase';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { Application, Vacancy } from '@prisma/client';

/**
 * Use Case: Get Tax Residency Page Data
 *
 * Retrieves all data needed for the tax residency verification page and performs business logic:
 * - Access control (status must be SIGNED)
 * - Validates pending TAXRESIDENCY credential exists
 */
@Service()
export class GetTaxResidencyPageDataUseCase implements IGetTaxResidencyPageDataUseCase {
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		private readonly getCredentialsUseCase: GetVerifiedCredentialsUseCase,
	) {}

	async execute(applicationId: string): Promise<TaxResidencyPageDTO | null> {
		// Fetch application with vacancy
		const app = await this.applicationRepo.findByIdWithVacancy(applicationId);
		if (!app) return null;

		// Page access control: Tax residency page is accessible when contract is signed
		if (app.status !== 'SIGNED') {
			return {
				application: this.mapApplicationToDTO(app),
				pageAccessResult: { allowed: false, notFound: true },
			};
		}

		// Get pending tax residency credential
		// Use case returns DTOs (plain data)
		const allCredentials = await this.getCredentialsUseCase.execute(applicationId);
		const taxResidencyCredential = allCredentials.find(
			(cred) => cred.status === 'PENDING' && cred.credentialType === 'TAXRESIDENCY',
		);

		if (!taxResidencyCredential) {
			return {
				application: this.mapApplicationToDTO(app),
				pageAccessResult: { allowed: false, notFound: true },
			};
		}

		return {
			application: this.mapApplicationToDTO(app),
			pageAccessResult: { allowed: true },
		};
	}

	private mapApplicationToDTO(app: Application & { vacancy: Vacancy | null }) {
		return {
			id: app.id,
			status: app.status,
			candidateFamilyName: app.candidateFamilyName,
			candidateGivenName: app.candidateGivenName,
			candidateDateOfBirth: app.candidateDateOfBirth,
			candidateNationality: app.candidateNationality,
			candidateEmail: app.candidateEmail,
			candidateMobilePhone: app.candidateMobilePhone,
			updatedAt: app.updatedAt,
			createdAt: app.createdAt,
			vacancy: app.vacancy
				? {
						title: app.vacancy.title,
						requiredCredentials: Array.isArray(app.vacancy.requiredCredentials)
							? app.vacancy.requiredCredentials
							: [],
					}
				: null,
		};
	}
}
