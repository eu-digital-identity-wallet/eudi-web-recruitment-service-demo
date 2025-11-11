import 'server-only';

import { Inject, Service } from '@/core/infrastructure/config/container';
import { IApplicationRepositoryToken } from '@/core/infrastructure/config/container';

import type { IGetPIDVerificationPageDataUseCase } from '@/core/application/ports/inbound/IGetPIDVerificationPageDataUseCase';
import type { PIDVerificationPageDTO } from '@/core/application/ports/inbound/IGetPIDVerificationPageDataUseCase';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { Application, Vacancy } from '@prisma/client';

/**
 * Use Case: Get PID Verification Page Data
 *
 * Retrieves all data needed for the PID verification waiting room page and performs business logic:
 * - Access control (redirect logic)
 * - Status validation (CREATED, VERIFYING only)
 */
@Service()
export class GetPIDVerificationPageDataUseCase implements IGetPIDVerificationPageDataUseCase {
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
	) {}

	async execute(applicationId: string): Promise<PIDVerificationPageDTO | null> {
		// Fetch application with vacancy
		const app = await this.applicationRepo.findByIdWithVacancy(applicationId);
		if (!app) return null;

		// Page access control: PID verification page is only accessible during CREATED/VERIFYING status
		const allowedStatuses = ['CREATED', 'VERIFYING'];
		if (!allowedStatuses.includes(app.status)) {
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
