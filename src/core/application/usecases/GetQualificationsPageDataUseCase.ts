import 'server-only';

import { Inject, Service } from '@/core/infrastructure/config/container';
import { IApplicationRepositoryToken } from '@/core/infrastructure/config/container';

import { GetVerifiedCredentialsUseCase } from './GetVerifiedCredentialsUseCase';

import type { IGetQualificationsPageDataUseCase } from '@/core/application/ports/inbound/IGetQualificationsPageDataUseCase';
import type { QualificationsPageDTO } from '@/core/application/ports/inbound/IGetQualificationsPageDataUseCase';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { Application, Vacancy } from '@prisma/client';

/**
 * Use Case: Get Qualifications Page Data
 *
 * Retrieves all data needed for the qualifications verification page and performs business logic:
 * - Access control (redirect logic)
 * - Professional qualifications filtering (DIPLOMA, SEAFARER only - not TAXRESIDENCY)
 * - Credential type label generation
 */
@Service()
export class GetQualificationsPageDataUseCase implements IGetQualificationsPageDataUseCase {
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		private readonly getCredentialsUseCase: GetVerifiedCredentialsUseCase,
	) {}

	async execute(applicationId: string): Promise<QualificationsPageDTO | null> {
		// Fetch application with vacancy
		const app = await this.applicationRepo.findByIdWithVacancy(applicationId);
		if (!app) return null;

		// Page access control: Qualifications page is accessible during verification/qualifying
		const allowedStatuses = ['VERIFIED', 'QUALIFYING'];
		if (!allowedStatuses.includes(app.status)) {
			return {
				application: this.mapApplicationToDTO(app),
				credentialTypeLabel: '',
				pageAccessResult: { allowed: false, notFound: true },
			};
		}

		// Get professional qualifications (DIPLOMA, SEAFARER only - not TAXRESIDENCY)
		// Use case returns DTOs (plain data)
		const allCredentials = await this.getCredentialsUseCase.execute(applicationId);

		// Check which credentials are already verified
		const hasVerifiedDiploma = allCredentials.some(
			(cred) => cred.status === 'VERIFIED' && cred.credentialType === 'DIPLOMA',
		);
		const hasVerifiedSeafarer = allCredentials.some(
			(cred) => cred.status === 'VERIFIED' && cred.credentialType === 'SEAFARER',
		);

		// Get ONLY THE LATEST pending credential for each type (DIPLOMA, SEAFARER)
		// This ensures we only show credentials from the most recent verification request
		const pendingByType = new Map<string, (typeof allCredentials)[0]>();

		allCredentials
			.filter((cred) => cred.status === 'PENDING')
			.sort((a, b) => {
				// Sort by createdAt descending (newest first)
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			})
			.forEach((cred) => {
				// Only keep the first (newest) credential of each type
				if (!pendingByType.has(cred.credentialType)) {
					pendingByType.set(cred.credentialType, cred);
				}
			});

		// Filter to only show types that aren't already verified
		const extrasCredentials = Array.from(pendingByType.values()).filter((cred) => {
			if (cred.credentialType === 'DIPLOMA' && !hasVerifiedDiploma) return true;
			if (cred.credentialType === 'SEAFARER' && !hasVerifiedSeafarer) return true;
			return false;
		});

		// If no pending qualifications, page should not be accessible
		if (extrasCredentials.length === 0) {
			return {
				application: this.mapApplicationToDTO(app),
				credentialTypeLabel: '',
				pageAccessResult: { allowed: false, notFound: true },
			};
		}

		// Determine what was requested based on pending credentials
		const hasDiploma = extrasCredentials.some((c) => c.credentialType === 'DIPLOMA');
		const hasSeafarer = extrasCredentials.some((c) => c.credentialType === 'SEAFARER');

		const certificates: string[] = [];
		if (hasDiploma) {
			certificates.push('Diploma');
		}
		if (hasSeafarer) {
			certificates.push('Seafarer');
		}
		const credentialTypeLabel = certificates.join(' & ') + ' Certificate';

		return {
			application: this.mapApplicationToDTO(app),
			credentialTypeLabel,
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
