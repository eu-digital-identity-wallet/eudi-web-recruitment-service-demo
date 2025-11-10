// src/app/api/applications/[id]/qr-contract-signing/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { Container } from '@/core';
import { GetSigningUrlUseCase } from '@/core/application/usecases/GetSigningUrlUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('QRContractSigningRoute');

/**
 * GET /api/applications/[id]/qr-contract-signing
 *
 * Generates QR code for document signing
 * The QR code contains the URL with request_uri and client_id parameters
 *
 * Format: https://<domain>?request_uri=<jwt_endpoint>&client_id=<client_id>
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const getSigningUrlUseCase = Container.get(GetSigningUrlUseCase);

		// Get the signing URL through the use case
		const { signingUrl } = await getSigningUrlUseCase.execute(id);

		logger.info('Signing URL generated', { signingUrl: signingUrl.substring(0, 50) + '...' });

		// Generate QR code as SVG
		const svg = await QRCode.toString(signingUrl, {
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
		return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
	}
}
