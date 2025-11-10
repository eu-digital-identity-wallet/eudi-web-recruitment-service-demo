import { Vacancy } from '@/core/domain/model/Vacancy';
import { CredentialType as DomainCredentialType } from '@/core/domain/value-objects';

import type {
	Vacancy as PrismaVacancy,
	CredentialType as PrismaCredentialType,
} from '@prisma/client';

export class VacancyMapper {
	/**
	 * Convert Prisma model to Domain entity
	 */
	static toDomain(prismaVacancy: PrismaVacancy): Vacancy {
		return Vacancy.reconstitute({
			id: prismaVacancy.id,
			title: prismaVacancy.title,
			description: prismaVacancy.description,
			requiredCredentials: prismaVacancy.requiredCredentials.map((cred) =>
				DomainCredentialType.fromString(cred),
			),
			createdAt: prismaVacancy.createdAt,
		});
	}

	/**
	 * Convert Domain entity to Prisma update data
	 */
	static toPersistence(domain: Vacancy): Partial<PrismaVacancy> {
		return {
			id: domain.getId(),
			title: domain.getTitle(),
			description: domain.getDescription(),
			requiredCredentials: domain
				.getRequiredCredentials()
				.map((cred) => cred.getValue() as PrismaCredentialType),
			createdAt: domain.getCreatedAt(),
		};
	}

	/**
	 * Convert multiple Prisma models to Domain entities
	 */
	static toDomainList(prismaVacancies: PrismaVacancy[]): Vacancy[] {
		return prismaVacancies.map((vacancy) => VacancyMapper.toDomain(vacancy));
	}
}
