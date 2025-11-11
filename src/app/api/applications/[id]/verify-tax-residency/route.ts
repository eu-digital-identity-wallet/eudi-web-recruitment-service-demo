import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { RequestAdditionalCredentialsUseCase } from '@/core/application/usecases/RequestAdditionalCredentialsUseCase';

import type { NextRequest } from 'next/server';

/**
 * POST /api/applications/[id]/verify-tax-residency
 *
 * Called by: TaxResidencyActions component on employee page
 * When: User clicks "Request Tax Residency" button (SIGNED status required)
 *
 * Purpose: Initiates request for tax residency attestation credential
 *
 * Note: This endpoint is ONLY for tax residency attestation, which happens AFTER
 * contract signing. Professional qualifications (Diploma, Seafarer) use /qualifications
 * endpoint and happen BEFORE signing.
 *
 * Flow:
 * 1. Creates pending TAXRESIDENCY credential record (status: PENDING)
 * 2. Initiates OpenID4VP transaction with Verifier
 * 3. Returns verification URL for QR code or same-device redirect
 *
 * Body params:
 * - taxResidency: boolean
 * - sameDeviceFlow: boolean (cross-device QR vs same-device redirect)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const requestAdditionalCredentialsUseCase = Container.get(RequestAdditionalCredentialsUseCase);
		const { id: applicationId } = await params;
		const json = await req.json().catch(() => ({}));

		// This endpoint is only for tax residency attestation (SIGNED status required)
		const credentialType: string[] = [];
		if (json.taxResidency) credentialType.push('TAXRESIDENCY');

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
