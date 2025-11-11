import 'server-only';
import { Application, ApplicationStatus, Vacancy, Prisma } from '@prisma/client';

import { ApplicationMapper } from '@/core/domain/mappers/ApplicationMapper';
import { Service } from '@/core/infrastructure/config/container';
import { prisma } from '@/core/prisma';

import type {
	IApplicationRepository,
	UpdateApplicationData,
} from '@/core/application/ports/outbound/IApplicationRepository';
import type { Application as DomainApplication } from '@/core/domain/model/Application';

/**
 * Prisma adapter implementing IApplicationRepository port
 * Translates domain operations to Prisma-specific calls
 */
@Service()
export class PrismaApplicationRepositoryAdapter implements IApplicationRepository {
	async findById(id: string): Promise<Application | null> {
		return prisma.application.findUnique({
			where: { id },
		});
	}

	async findByIdWithVacancy(
		id: string,
	): Promise<(Application & { vacancy: Vacancy | null }) | null> {
		return prisma.application.findUnique({
			where: { id },
			include: { vacancy: true },
		});
	}

	async save(application: DomainApplication): Promise<Application> {
		// Convert domain entity to Prisma data using mapper
		const persistence = ApplicationMapper.toPersistence(application);

		// Create new application in database
		return prisma.application.create({
			data: {
				id: persistence.id,
				vacancy: { connect: { id: persistence.vacancyId } },
				status: persistence.status as ApplicationStatus,
				candidateFamilyName: persistence.candidateFamilyName ?? null,
				candidateGivenName: persistence.candidateGivenName ?? null,
				candidateEmail: persistence.candidateEmail ?? null,
				candidateMobilePhone: persistence.candidateMobilePhone ?? null,
				candidateNationality: persistence.candidateNationality ?? null,
				candidateDateOfBirth: persistence.candidateDateOfBirth ?? null,
			},
		});
	}

	async update(id: string, data: UpdateApplicationData): Promise<Application> {
		// Translate domain DTO to Prisma input - only include defined fields
		const prismaData: Prisma.ApplicationUpdateInput = {};

		if (data.status !== undefined) prismaData.status = data.status as ApplicationStatus;
		if (data.candidateFamilyName !== undefined)
			prismaData.candidateFamilyName = data.candidateFamilyName;
		if (data.candidateGivenName !== undefined)
			prismaData.candidateGivenName = data.candidateGivenName;
		if (data.candidateDateOfBirth !== undefined)
			prismaData.candidateDateOfBirth = data.candidateDateOfBirth;
		if (data.candidateNationality !== undefined)
			prismaData.candidateNationality = data.candidateNationality;
		if (data.candidateEmail !== undefined) prismaData.candidateEmail = data.candidateEmail;
		if (data.candidateMobilePhone !== undefined)
			prismaData.candidateMobilePhone = data.candidateMobilePhone;

		return prisma.application.update({
			where: { id },
			data: prismaData,
		});
	}

	async delete(id: string): Promise<Application> {
		return prisma.application.delete({
			where: { id },
		});
	}
}
