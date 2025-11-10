import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { CheckQualificationsVerificationStatusUseCase } from '@/core/application/usecases/CheckQualificationsVerificationStatusUseCase';

import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/applications/verify-qualifications-status/[id]
 *
 * Called by: QualificationsVerificationPoller client component (polling every 2 seconds)
 * When: User is on /applications/[id]/qualifications or /applications/[id]/tax-residency waiting for verification
 *
 * Purpose: Polls supplementary credentials verification status from Verifier service
 *
 * Note: This single endpoint handles polling for BOTH:
 * - Professional qualifications (Diploma, Seafarer) - redirects to /finalise when verified
 * - Tax residency attestation - redirects to /employee when verified
 *
 * Flow:
 * 1. Checks if wallet has submitted the requested supplementary credentials
 * 2. If verified, updates credential records (status: VERIFIED)
 * 3. Updates application status (QUALIFYING → QUALIFIED for qualifications)
 * 4. Returns boolean status to client
 *
 * Query params:
 * - response_code (optional): OAuth response code from same-device flow redirect
 *
 * Returns: { status: boolean } - true when supplementary credentials are verified
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	const checkQualificationsVerificationStatusUseCase = Container.get(
		CheckQualificationsVerificationStatusUseCase,
	);
	const { id } = await ctx.params;
	const responseCode = req.nextUrl.searchParams.get('response_code') ?? undefined;

	const ok = await checkQualificationsVerificationStatusUseCase.execute({
		applicationId: id,
		responseCode,
	});

	return NextResponse.json(
		{ status: ok },
		{
			headers: {
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				Pragma: 'no-cache',
			},
		},
	);
}
