import 'server-only';
import { CredentialType, Vacancy, Prisma } from '@prisma/client';

import { VacancyMapper } from '@/core/domain/mappers/VacancyMapper';
import { Service } from '@/core/infrastructure/config/container';
import { prisma } from '@/core/prisma';

import type {
	IVacancyRepository,
	UpdateVacancyData,
} from '@/core/application/ports/outbound/IVacancyRepository';
import type { Vacancy as DomainVacancy } from '@/core/domain/model/Vacancy';

/**
 * Prisma adapter implementing IVacancyRepository port
 * Translates domain operations to Prisma-specific calls
 */
@Service()
export class PrismaVacancyRepositoryAdapter implements IVacancyRepository {
	async findAll(): Promise<Vacancy[]> {
		return prisma.vacancy.findMany({
			orderBy: { createdAt: 'desc' },
		});
	}

	async findById(id: string): Promise<Vacancy | null> {
		return prisma.vacancy.findUnique({
			where: { id },
		});
	}

	/**
	 * Save domain Vacancy entity (create new)
	 */
	async save(vacancy: DomainVacancy): Promise<Vacancy> {
		// Convert domain entity to Prisma data using mapper
		const persistence = VacancyMapper.toPersistence(vacancy);

		// Create new vacancy in database
		return prisma.vacancy.create({
			data: {
				id: persistence.id!,
				title: persistence.title!,
				description: persistence.description!,
				requiredCredentials: persistence.requiredCredentials as CredentialType,
			},
		});
	}

	async update(id: string, data: UpdateVacancyData): Promise<Vacancy> {
		// Translate domain DTO to Prisma input
		const prismaData: Prisma.VacancyUpdateInput = {};

		if (data.title !== undefined) prismaData.title = data.title;
		if (data.description !== undefined) prismaData.description = data.description;
		if (data.requiredCredentials !== undefined)
			prismaData.requiredCredentials = data.requiredCredentials as CredentialType;

		return prisma.vacancy.update({
			where: { id },
			data: prismaData,
		});
	}

	async delete(id: string): Promise<Vacancy> {
		return prisma.vacancy.delete({
			where: { id },
		});
	}
}
