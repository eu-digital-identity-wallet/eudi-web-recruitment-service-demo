// src/app/api/applications/[id]/qr-verify-pid/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { Container } from '@/core';
import { GetApplicationDeepLinkUseCase } from '@/core/application/usecases/GetApplicationDeepLinkUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('QRVerifyPIDRoute');

/**
 * GET /api/applications/[id]/qr-verify-pid
 *
 * Called by: Application verification page (cross-device flow)
 * When: <Image> component loads QR code on /applications/[id] page
 *
 * Purpose: Generates QR code for PID (Person Identification) verification
 *
 * Returns: SVG QR code containing OpenID4VP deep link for EUDI Wallet
 * The wallet scans this to verify user's PID credential
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	const getApplicationDeepLinkUseCase = Container.get(GetApplicationDeepLinkUseCase);
	const { id } = await ctx.params;
	const link = await getApplicationDeepLinkUseCase.execute(id);
	logger.info('Deep link generated', { linkPreview: link.substring(0, 50) + '...' });
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
}
