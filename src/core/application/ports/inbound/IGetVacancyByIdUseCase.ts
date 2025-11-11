import type { VacancyDTO } from '@/core/application/usecases/GetVacancyByIdUseCase';

/**
 * Inbound Port: Get Vacancy By ID Use Case
 * Defines the contract for retrieving a single vacancy by its unique identifier
 * Returns DTO (plain data) instead of domain entity
 */
export interface IGetVacancyByIdUseCase {
	execute(id: string): Promise<VacancyDTO>;
}
