import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { RequestAdditionalCredentialsUseCase } from '@/core/application/usecases/RequestAdditionalCredentialsUseCase';

import type { NextRequest } from 'next/server';

/**
 * POST /api/applications/[id]/verify-qualifications
 *
 * Called by: AdditionalInfoActions component on finalise page
 * When: User clicks "Request Additional Credentials" button (VERIFIED/QUALIFIED status)
 *
 * Purpose: Initiates verification request for professional qualifications (Diploma, Seafarer)
 *
 * Note: This endpoint is ONLY for professional qualifications.
 * Tax residency attestation uses a separate endpoint (/verify-tax-residency)
 * because it requires different application status (SIGNED vs VERIFIED)
 *
 * Flow:
 * 1. Creates pending credential records (status: PENDING)
 * 2. Initiates OpenID4VP transaction with Verifier
 * 3. Returns verification URL for QR code or same-device redirect
 * 4. Updates application status to QUALIFYING
 *
 * Body params:
 * - diploma: boolean (request diploma credential)
 * - seafarer: boolean (request seafarer certificate)
 * - sameDeviceFlow: boolean (cross-device QR vs same-device redirect)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const requestAdditionalCredentialsUseCase = Container.get(RequestAdditionalCredentialsUseCase);
		const { id: applicationId } = await params;
		const json = await req.json().catch(() => ({}));

		// This endpoint is only for professional qualifications (Diploma, Seafarer)
		const credentialType: string[] = [];
		if (json.diploma) credentialType.push('DIPLOMA');
		if (json.seafarer) credentialType.push('SEAFARER');

		const result = await requestAdditionalCredentialsUseCase.execute({
			applicationId,
			credentialType,
			sameDeviceFlow: json.sameDeviceFlow ?? false,
		});

		return NextResponse.json(result);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Invalid request';
		const code = /not found/i.test(msg) ? 404 : 400;
		return NextResponse.json({ error: msg }, { status: code });
	}
}
