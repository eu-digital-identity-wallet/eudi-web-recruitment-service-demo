/**
 * Next.js Route: /vacancies/[id] (Vacancy Details & Application)
 *
 * Responsibilities:
 * - Server-side data fetching
 * - Pass vacancy data to presentation component
 *
 * Flow:
 * 1. Fetch vacancy details by ID
 * 2. Render VacancyDetailPage with fetched data
 *
 * Note: This is where the recruitment flow begins - clicking apply creates the application
 */
import 'server-only';
import { notFound } from 'next/navigation';

import VacancyDetailPage from '@/components/pages/VacancyDetailPage';
import { Container } from '@/core';
import { GetVacancyByIdUseCase } from '@/core/application/usecases/GetVacancyByIdUseCase';

export const dynamic = 'force-dynamic';

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const getVacancyByIdUseCase = Container.get(GetVacancyByIdUseCase);
	const { id } = await params;
	const vacancy = await getVacancyByIdUseCase.execute(id);
	if (!vacancy) notFound();

	// Use case already returns DTO (plain data)
	return <VacancyDetailPage vacancy={vacancy} />;
}
