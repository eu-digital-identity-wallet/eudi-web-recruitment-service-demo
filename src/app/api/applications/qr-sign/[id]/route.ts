// src/app/api/applications/qr-sign/[id]/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { Container } from '@/server';
import { SignedDocumentRepository } from '@/server/repositories/SignedDocumentRepository';
import { env } from 'env';

/**
 * GET /api/applications/qr-sign/[id]
 *
 * Generates QR code for document signing
 * The QR code contains the URL with request_uri and client_id parameters
 *
 * Format: https://<domain>?request_uri=<jwt_endpoint>&client_id=<client_id>
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const signedDocumentRepo = Container.get(SignedDocumentRepository);

		// Get the most recent signed document for this application
		const signedDocument = await signedDocumentRepo.findLatestByApplicationId(id);

		if (!signedDocument) {
			return NextResponse.json({ error: 'No pending document signing found' }, { status: 404 });
		}

		// Construct the request_uri (wallet will access this to get the signed JWT)
		const requestUri = `${env.NEXT_PUBLIC_APP_URI}/api/request.jwt/${signedDocument.state}`;

		// Get client_id from the app URI hostname
		const clientId = new URL(env.NEXT_PUBLIC_APP_URI).hostname;

		// Construct the URL per EUDI spec
		const signingUrl = `${env.NEXT_PUBLIC_APP_URI}?request_uri=${encodeURIComponent(requestUri)}&client_id=${encodeURIComponent(clientId)}`;

		console.log('[QR Sign] Signing URL:', signingUrl);

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
		console.error('[QR Sign] Error:', error);
		return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
	}
}
