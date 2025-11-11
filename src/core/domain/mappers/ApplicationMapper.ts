import { Application } from '@/core/domain/model/Application';
import { CandidateInfo } from '@/core/domain/model/CandidateInfo';

import type { ApplicationStatus } from '@/core/domain/model/Application';
import type { Application as PrismaApplication } from '@prisma/client';

export class ApplicationMapper {
	/**
	 * Convert Prisma model to Domain entity
	 */
	static toDomain(prismaApp: PrismaApplication): Application {
		let candidateInfo: CandidateInfo | undefined = undefined;

		if (prismaApp.candidateFamilyName && prismaApp.candidateGivenName) {
			candidateInfo = CandidateInfo.create({
				familyName: prismaApp.candidateFamilyName,
				givenName: prismaApp.candidateGivenName,
				email: prismaApp.candidateEmail || undefined,
				mobilePhone: prismaApp.candidateMobilePhone || undefined,
				nationality: prismaApp.candidateNationality || undefined,
				dateOfBirth: prismaApp.candidateDateOfBirth || undefined,
			});
		}

		return Application.reconstitute({
			id: prismaApp.id,
			vacancyId: prismaApp.vacancyId,
			status: prismaApp.status as ApplicationStatus,
			candidateInfo,
			createdAt: prismaApp.createdAt,
		});
	}

	/**
	 * Convert Domain entity to Prisma update data
	 */
	static toPersistence(domain: Application): Partial<PrismaApplication> {
		const candidateInfo = domain.getCandidateInfo();

		return {
			id: domain.getId(),
			vacancyId: domain.getVacancyId(),
			status: domain.getStatus(),
			candidateFamilyName: candidateInfo?.familyName.getValue() || null,
			candidateGivenName: candidateInfo?.givenName.getValue() || null,
			candidateEmail: candidateInfo?.email?.getValue() || null,
			candidateMobilePhone: candidateInfo?.mobilePhone?.getValue() || null,
			candidateNationality: candidateInfo?.nationality?.getValue() || null,
			candidateDateOfBirth: candidateInfo?.dateOfBirth?.toString() || null,
		};
	}
}
