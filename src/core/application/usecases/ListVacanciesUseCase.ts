import 'server-only';
import { VacancyMapper } from '@/core/domain';
import { Inject, Service } from '@/core/infrastructure/config/container';
import { IVacancyRepositoryToken } from '@/core/infrastructure/config/container';

import type { IListVacanciesUseCase } from '@/core/application/ports/inbound';
import type { IVacancyRepository } from '@/core/application/ports/outbound/IVacancyRepository';

/**
 * DTO for Vacancy - plain data structure for presentation layer
 */
export type VacancyDTO = {
	id: string;
	title: string;
	description: string;
	createdAt: Date;
	requiredCredentials: string[];
};

/**
 * Use Case: List Vacancies
 * Lists all available vacancies for the job board
 * Returns DTOs (plain objects) to avoid exposing domain layer to presentation layer
 */
@Service()
export class ListVacanciesUseCase implements IListVacanciesUseCase {
	constructor(@Inject(IVacancyRepositoryToken) private readonly vacancyRepo: IVacancyRepository) {}

	public async execute(): Promise<VacancyDTO[]> {
		try {
			const prismaVacancies = await this.vacancyRepo.findAll();
			const domainVacancies = VacancyMapper.toDomainList(prismaVacancies);

			// Map domain objects to DTOs (plain data)
			return domainVacancies.map((vacancy) => ({
				id: vacancy.getId(),
				title: vacancy.getTitle(),
				description: vacancy.getDescription(),
				createdAt: new Date(vacancy.getCreatedAt()),
				requiredCredentials: vacancy.getRequiredCredentials().map((cred) => cred.getValue()),
			}));
		} catch {
			throw new Error(
				`Database connection failed. Please ensure PostgreSQL is running at localhost:5432 and the database is set up. Run: npx prisma db push`,
			);
		}
	}
}
