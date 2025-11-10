/**
 * Next.js Route: /applications/[id] (PID Verification Waiting Room)
 *
 * Responsibilities:
 * - Server-side data fetching via use case
 * - Handle routing (redirects, notFound)
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Call use case to get PID verification page data (includes access control logic)
 * 2. Handle access control results (redirect/notFound)
 * 3. Render ApplicationPage with fetched data
 *
 * Application Status: CREATED, VERIFYING
 * Next Step: /applications/[id]/finalise (after PID verification)
 *
 * Note: This is the PID verification step - user scans QR with EUDI Wallet to prove identity
 */
import 'server-only';
import { notFound } from 'next/navigation';

import ApplicationPage from '@/components/pages/ApplicationPage';
import { Container } from '@/core';
import { GetPIDVerificationPageDataUseCase } from '@/core/application/usecases/GetPIDVerificationPageDataUseCase';

export const dynamic = 'force-dynamic';

export default async function ApplicationRoute({ params }: { params: Promise<{ id: string }> }) {
	const useCase = Container.get(GetPIDVerificationPageDataUseCase);
	const { id } = await params;

	const data = await useCase.execute(id);
	if (!data) return notFound();

	// Handle page access control results
	if (!data.pageAccessResult.allowed) {
		return notFound();
	}

	return <ApplicationPage application={data.application} />;
}
