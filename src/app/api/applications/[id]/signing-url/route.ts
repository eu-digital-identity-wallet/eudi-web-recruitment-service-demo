// src/app/api/applications/[id]/signing-url/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { SignedDocumentRepository } from '@/server/repositories/SignedDocumentRepository';
import { env } from 'env';

/**
 * GET /api/applications/[id]/signing-url
 *
 * Returns the raw signing URL (for testing/debugging)
 * This shows what's encoded in the QR code
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

		return NextResponse.json(
			{
				signingUrl,
				components: {
					baseUrl: env.NEXT_PUBLIC_APP_URI,
					requestUri,
					clientId,
					state: signedDocument.state,
				},
				decoded: {
					fullUrl: signingUrl,
					queryParams: {
						request_uri: requestUri,
						client_id: clientId,
					},
				},
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
	} catch (error) {
		console.error('[signing-url] Error:', error);
		return NextResponse.json({ error: 'Failed to generate signing URL' }, { status: 500 });
	}
}
