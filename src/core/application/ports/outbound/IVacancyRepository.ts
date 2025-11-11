import type { Vacancy } from '@/core/domain/model/Vacancy';
import type { Vacancy as PrismaVacancy } from '@prisma/client';

/**
 * Port interface for Vacancy persistence (Outbound Port)
 * Application layer defines the contract, infrastructure layer implements it
 * Implemented by: PrismaVacancyRepositoryAdapter
 */
export interface IVacancyRepository {
	/**
	 * Find all vacancies, ordered by creation date
	 */
	findAll(): Promise<PrismaVacancy[]>;

	/**
	 * Find vacancy by ID
	 */
	findById(id: string): Promise<PrismaVacancy | null>;

	/**
	 * Save domain Vacancy entity (create new)
	 */
	save(vacancy: Vacancy): Promise<PrismaVacancy>;

	/**
	 * Update vacancy
	 */
	update(id: string, data: UpdateVacancyData): Promise<PrismaVacancy>;

	/**
	 * Delete vacancy
	 */
	delete(id: string): Promise<PrismaVacancy>;
}

/**
 * Domain-specific data transfer object for updates
 */
export interface UpdateVacancyData {
	title?: string;
	description?: string;
	requiredCredentials?: string[];
}
