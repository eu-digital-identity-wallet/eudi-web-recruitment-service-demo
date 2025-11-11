// src/app/api/applications/[id]/qr-verify-qualifications/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { Container } from '@/core';
import { GetSupplementaryCredentialsDeepLinkUseCase } from '@/core/application/usecases/GetSupplementaryCredentialsDeepLinkUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('QRVerifyQualificationsRoute');

/**
 * GET /api/applications/[id]/qr-verify-qualifications
 *
 * Called by: Qualifications page and Tax Residency page (cross-device flow)
 * When: <Image> component loads QR code on /applications/[id]/qualifications or /applications/[id]/tax-residency
 *
 * Purpose: Generates QR code for supplementary credentials verification
 *
 * Note: This single endpoint handles QR codes for BOTH:
 * - Professional qualifications (Diploma, Seafarer) on qualifications page
 * - Tax residency attestation on tax-residency page
 *
 * Returns: SVG QR code containing OpenID4VP deep link for EUDI Wallet
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	const getSupplementaryCredentialsDeepLinkUseCase = Container.get(
		GetSupplementaryCredentialsDeepLinkUseCase,
	);
	const { id } = await ctx.params;

	try {
		const link = await getSupplementaryCredentialsDeepLinkUseCase.execute(id);

		const svg = await QRCode.toString(link, {
			type: 'svg',
			errorCorrectionLevel: 'M',
			margin: 1,
			width: 256,
		});

		return new NextResponse(svg, {
			status: 200,
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				Pragma: 'no-cache',
			},
		});
	} catch (error) {
		logger.error('Error generating QR code', error as Error);
		return new NextResponse('Error generating QR code', { status: 500 });
	}
}
