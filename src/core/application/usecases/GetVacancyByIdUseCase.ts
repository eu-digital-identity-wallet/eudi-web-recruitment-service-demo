import 'server-only';
import { VacancyMapper } from '@/core/domain';
import { Inject, Service } from '@/core/infrastructure/config/container';
import { IVacancyRepositoryToken } from '@/core/infrastructure/config/container';
import { vacancyIdSchema } from '@/core/shared/types/schemas/vacancy';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetVacancyByIdUseCase } from '@/core/application/ports/inbound';
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
} | null;

/**
 * Use Case: Get Vacancy By ID
 * Retrieves a single vacancy by its unique identifier
 * Returns DTO (plain object) to avoid exposing domain layer to presentation layer
 */
@Service()
export class GetVacancyByIdUseCase implements IGetVacancyByIdUseCase {
	constructor(@Inject(IVacancyRepositoryToken) private readonly vacancyRepo: IVacancyRepository) {}

	@ValidateInput(vacancyIdSchema)
	public async execute(id: string): Promise<VacancyDTO> {
		try {
			const prismaVacancy = await this.vacancyRepo.findById(id);
			if (!prismaVacancy) return null;

			const domainVacancy = VacancyMapper.toDomain(prismaVacancy);

			// Map domain object to DTO (plain data)
			const requiredCredentials: string[] = domainVacancy
				.getRequiredCredentials()
				.map((cred) => cred.getValue());

			return {
				id: domainVacancy.getId(),
				title: domainVacancy.getTitle(),
				description: domainVacancy.getDescription(),
				createdAt: new Date(domainVacancy.getCreatedAt()),
				requiredCredentials,
			};
		} catch {
			throw new Error(
				`Database connection failed. Please ensure PostgreSQL is running at localhost:5432 and the database is set up. Run: npx prisma db push`,
			);
		}
	}
}
