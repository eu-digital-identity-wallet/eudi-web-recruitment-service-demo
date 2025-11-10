// src/app/api/applications/[id]/qr-issue-employee-id/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { Container } from '@/core';
import { GetCredentialQRCodeUseCase } from '@/core/application/usecases/GetCredentialQRCodeUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('QRIssueEmployeeIdRoute');

/**
 * GET /api/applications/[id]/qr-issue-employee-id
 *
 * Called by: Employee issuance dialog component on employee page
 * When: <Image> component loads QR code after /issue-employee-id is called
 *
 * Purpose: Generates QR code for employee ID credential issuance (final step)
 *
 * Flow:
 * 1. Retrieves stored credential offer URL from application
 * 2. Generates SVG QR code from the OpenID4VCI offer URL
 * 3. Returns QR code for user to scan with EUDI Wallet
 *
 * Returns: SVG QR code containing OpenID4VCI credential offer URL
 * User scans this to receive their employee ID credential in their wallet
 *
 * Note: This is the final step in the recruitment flow - issuing the employee credential
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const getCredentialQRCodeUseCase = Container.get(GetCredentialQRCodeUseCase);

		// Get credential offer URL via use case
		const credentialOfferUrl = await getCredentialQRCodeUseCase.execute(id);

		if (!credentialOfferUrl) {
			return NextResponse.json({ error: 'Credential offer not found' }, { status: 404 });
		}

		// Generate QR code SVG from stored URL
		const svg = await QRCode.toString(credentialOfferUrl, {
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
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Failed to generate credential offer';
		const code = /not found/i.test(msg) ? 404 : 400;

		// Log the full error for debugging
		logger.error('Error generating credential offer QR code', err as Error);

		return NextResponse.json({ error: msg }, { status: code });
	}
}
