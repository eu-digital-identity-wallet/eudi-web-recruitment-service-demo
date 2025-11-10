/**
 * Next.js Route: /applications/[id]/qualifications (Professional Qualifications Verification)
 *
 * Responsibilities:
 * - Server-side data fetching via use case
 * - Handle routing (redirects, notFound)
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Call use case to get qualifications page data (includes access control logic)
 * 2. Handle access control results (redirect/notFound)
 * 3. Render QualificationsVerificationPage with fetched data
 *
 * Application Status: VERIFIED, QUALIFYING
 * Previous Step: /applications/[id]/finalise
 * Next Step: /applications/[id]/finalise (after verification)
 *
 * Note: Handles ONLY professional qualifications (Diploma, Seafarer), NOT tax residency
 */
import 'server-only';
import { notFound } from 'next/navigation';

import QualificationsVerificationPage from '@/components/pages/QualificationsVerificationPage';
import { Container } from '@/core';
import { GetQualificationsPageDataUseCase } from '@/core/application/usecases/GetQualificationsPageDataUseCase';

export const dynamic = 'force-dynamic';

export default async function ApplicationQualificationsRoute({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const useCase = Container.get(GetQualificationsPageDataUseCase);
	const { id } = await params;

	const data = await useCase.execute(id);
	if (!data) return notFound();

	// Handle page access control results
	if (!data.pageAccessResult.allowed) {
		return notFound();
	}

	return (
		<QualificationsVerificationPage
			application={data.application}
			credentialTypeLabel={data.credentialTypeLabel}
		/>
	);
}
