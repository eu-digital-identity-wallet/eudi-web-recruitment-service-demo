// src/app/api/applications/qr-issue/[id]/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const { prisma } = await import('@/server/prisma');

		// Get credential from DB
		const credential = await prisma.issuedCredential.findFirst({
			where: { applicationId: id, credentialType: 'eu.europa.ec.eudi.employee_mdoc' },
		});

		if (!credential?.credentialOfferUrl) {
			return NextResponse.json({ error: 'Credential offer not found' }, { status: 404 });
		}

		// Generate QR code SVG from stored URL
		const svg = await QRCode.toString(credential.credentialOfferUrl, {
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
		console.error('[qr-issue] Error:', {
			message: msg,
			error: err,
			stack: err instanceof Error ? err.stack : undefined,
		});

		return NextResponse.json({ error: msg }, { status: code });
	}
}
