/**
 * Next.js Route: /applications/[id]/finalise (Application Review & Finalization)
 *
 * Responsibilities:
 * - Server-side data fetching via use case
 * - Handle routing (redirects, notFound)
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Call use case to get finalization data (includes access control logic)
 * 2. Handle access control results (redirect/notFound)
 * 3. Render ApplicationFinalizationPage with fetched data
 *
 * Application Status: VERIFIED, QUALIFYING, QUALIFIED, FINALIZED
 * Previous Step: /applications/[id] (PID verification)
 * Next Step: /applications/[id]/qualifications (optional) or /applications/[id]/sign-contract
 */
import 'server-only';
import { notFound, redirect } from 'next/navigation';

import ApplicationFinalizationPage from '@/components/pages/ApplicationFinalizationPage';
import { Container } from '@/core';
import { GetApplicationFinalizationDataUseCase } from '@/core/application/usecases/GetApplicationFinalizationDataUseCase';

export const dynamic = 'force-dynamic';

export default async function ApplicationConfirmationPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const useCase = Container.get(GetApplicationFinalizationDataUseCase);
	const { id } = await params;
	if (!id) return notFound();

	const data = await useCase.execute(id);
	if (!data) return notFound();

	// Handle page access control results
	if (!data.pageAccessResult.allowed) {
		if ('redirect' in data.pageAccessResult && data.pageAccessResult.redirect) {
			redirect(data.pageAccessResult.redirect);
		}
		return notFound();
	}

	return (
		<ApplicationFinalizationPage
			application={data.application}
			verifiedCredentials={data.verifiedCredentials}
			professionalQualifications={data.professionalQualifications}
			allQualificationsVerified={data.allQualificationsVerified}
			requiredCredentials={data.requiredCredentials}
		/>
	);
}
