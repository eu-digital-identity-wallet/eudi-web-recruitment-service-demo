// src/app/api/applications/verify-pid-status/[id]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { CheckVerificationStatusUseCase } from '@/core/application/usecases/CheckVerificationStatusUseCase';

import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/applications/verify-pid-status/[id]
 *
 * Called by: VerificationPoller client component (polling every 2 seconds)
 * When: User is on /applications/[id] page waiting for PID credentials verification
 *
 * Purpose: Polls the PID (Personal Identification Data) credentials verification status from the Verifier service
 *
 * Flow:
 * 1. Checks if wallet has submitted the PID credential
 * 2. If verified, extracts candidate information and updates application (status: VERIFIED)
 * 3. Returns boolean status to client
 *
 * Query params:
 * - response_code (optional): OAuth response code from same-device flow redirect
 *
 * Returns: { status: boolean } - true when PID credentials are verified
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	const checkVerificationStatusUseCase = Container.get(CheckVerificationStatusUseCase);
	const { id } = await ctx.params;
	const responseCode = req.nextUrl.searchParams.get('response_code') ?? undefined;

	const ok = await checkVerificationStatusUseCase.execute({
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
