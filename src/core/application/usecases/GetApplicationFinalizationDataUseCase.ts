import 'server-only';

import { Inject, Service } from '@/core/infrastructure/config/container';
import { IApplicationRepositoryToken } from '@/core/infrastructure/config/container';

import { GetVerifiedCredentialsUseCase } from './GetVerifiedCredentialsUseCase';

import type { IGetApplicationFinalizationDataUseCase } from '@/core/application/ports/inbound/IGetApplicationFinalizationDataUseCase';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { Application, Vacancy } from '@prisma/client';

export type ApplicationFinalizationDTO = {
	application: {
		id: string;
		status: string;
		candidateFamilyName?: string | null;
		candidateGivenName?: string | null;
		candidateDateOfBirth?: string | null;
		candidateNationality?: string | null;
		candidateEmail?: string | null;
		candidateMobilePhone?: string | null;
		updatedAt: Date;
		createdAt: Date;
		vacancy?: {
			title: string;
			requiredCredentials: string[];
		} | null;
	};
	verifiedCredentials: Array<{
		id: string;
		credentialType: string;
		credentialData: Record<string, unknown>;
		status: string;
		verifiedAt: Date | null;
	}>;
	professionalQualifications: Array<{
		id: string;
		credentialType: string;
		credentialData: Record<string, unknown>;
		status: string;
		verifiedAt: Date | null;
	}>;
	requiredCredentials: string[];
	allQualificationsVerified: boolean;
	pageAccessResult:
		| { allowed: true }
		| { allowed: false; redirect?: string }
		| { allowed: false; notFound: true };
};

/**
 * Use Case: Get Application Finalization Data
 *
 * Retrieves all data needed for the finalization page and performs business logic:
 * - Access control (redirect logic)
 * - Professional qualifications filtering
 * - Qualification verification status
 */
@Service()
export class GetApplicationFinalizationDataUseCase
	implements IGetApplicationFinalizationDataUseCase
{
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		private readonly getCredentialsUseCase: GetVerifiedCredentialsUseCase,
	) {}

	async execute(applicationId: string): Promise<ApplicationFinalizationDTO | null> {
		// Fetch application with vacancy
		const app = await this.applicationRepo.findByIdWithVacancy(applicationId);
		if (!app) return null;

		// Page access control: Redirect if contract already signed
		const employeePageStatuses = ['SIGNED', 'ISSUING', 'ISSUED'];
		if (employeePageStatuses.includes(app.status)) {
			return {
				application: this.mapApplicationToDTO(app),
				verifiedCredentials: [],
				professionalQualifications: [],
				requiredCredentials: [],
				allQualificationsVerified: false,
				pageAccessResult: { allowed: false, redirect: `/applications/${applicationId}/employee` },
			};
		}

		// Page access control: Finalize page is accessible during these statuses
		const allowedStatuses = ['VERIFIED', 'QUALIFIED', 'FINALIZED', 'SIGNING'];
		if (!allowedStatuses.includes(app.status)) {
			return {
				application: this.mapApplicationToDTO(app),
				verifiedCredentials: [],
				professionalQualifications: [],
				requiredCredentials: [],
				allQualificationsVerified: false,
				pageAccessResult: { allowed: false, notFound: true },
			};
		}

		// Fetch verified credentials - returns DTOs (plain data)
		const verifiedCredentials = await this.getCredentialsUseCase.execute(applicationId);

		// Filter professional qualifications (Diploma, Seafarer) - using plain strings
		const professionalQualifications = verifiedCredentials.filter(
			(cred) =>
				cred.status === 'VERIFIED' &&
				(cred.credentialType === 'DIPLOMA' || cred.credentialType === 'SEAFARER'),
		);

		// Extract required credentials from vacancy
		const requiredCreds = app.vacancy?.requiredCredentials;
		const requiredCredentialsArray = requiredCreds
			? typeof requiredCreds === 'string'
				? [requiredCreds]
				: Array.isArray(requiredCreds)
					? requiredCreds
					: []
			: [];

		// Check if user has verified both optional qualifications (DIPLOMA and SEAFARER)
		// These are always available to submit regardless of vacancy requirements
		const hasDiploma = professionalQualifications.some((cred) => cred.credentialType === 'DIPLOMA');
		const hasSeafarer = professionalQualifications.some(
			(cred) => cred.credentialType === 'SEAFARER',
		);
		const allQualificationsVerified = hasDiploma && hasSeafarer;

		return {
			application: this.mapApplicationToDTO(app),
			verifiedCredentials,
			professionalQualifications,
			requiredCredentials: requiredCredentialsArray,
			allQualificationsVerified,
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
