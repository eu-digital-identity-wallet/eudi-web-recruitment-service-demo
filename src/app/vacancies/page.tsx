/**
 * Next.js Route: /vacancies (Vacancy Board Listing)
 *
 * Responsibilities:
 * - Server-side data fetching
 * - Data transformation from domain model to view model
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Fetch all vacancies from repository
 * 2. Transform domain models to plain objects for client components
 * 3. Render VacancyListPage with vacancies data
 *
 * Note: This is the entry point for browsing available positions
 */
import 'server-only';

import VacancyListPage from '@/components/pages/VacancyListPage';
import { Container } from '@/core';
import { ListVacanciesUseCase } from '@/core/application/usecases/ListVacanciesUseCase';

export const dynamic = 'force-dynamic';

export default async function VacancyBoardRoute() {
	const listVacanciesUseCase = Container.get(ListVacanciesUseCase);
	const vacancies = await listVacanciesUseCase.execute();

	// Use case already returns DTOs (plain data objects)
	return <VacancyListPage vacancies={vacancies} />;
}
