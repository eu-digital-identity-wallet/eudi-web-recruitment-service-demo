import type { VacancyDTO } from '@/core/application/usecases/ListVacanciesUseCase';

/**
 * Inbound Port: List Vacancies Use Case
 * Defines the contract for listing all available vacancies
 * Returns DTOs (plain data) instead of domain entities
 */
export interface IListVacanciesUseCase {
	execute(): Promise<VacancyDTO[]>;
}
