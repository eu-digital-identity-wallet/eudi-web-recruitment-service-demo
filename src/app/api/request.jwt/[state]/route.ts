// src/app/api/request.jwt/[state]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { JWTService } from '@/server/services/JWTService';
import { DocumentSigningService } from '@/server/services/signing/ContractSigningService';

/**
 * GET /api/request.jwt/[state]
 *
 * Wallet accesses this endpoint to retrieve the signed JWT containing
 * the document retrieval request payload
 *
 * Per EUDI spec:
 * - JWT must have typ: "JWT" in header
 * - JWT must be signed with ES256
 * - JWT must include x5c certificate chain
 */
export async function GET(_req: Request, ctx: { params: Promise<{ state: string }> }) {
	try {
		const { state } = await ctx.params;

		const documentSigningService = Container.get(DocumentSigningService);
		const jwtService = Container.get(JWTService);

		// Prepare the document retrieval request payload
		const payload = await documentSigningService.prepareDocumentRetrievalRequest(state);

		// Sign the JWT with x5c certificate
		const signedJwt = await jwtService.sign(payload);

		// Return JWT as plain text (application/jwt is not standard, so use text/plain)
		return new NextResponse(signedJwt, {
			status: 200,
			headers: {
				'Content-Type': 'application/jwt',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				Pragma: 'no-cache',
			},
		});
	} catch (error) {
		console.error('[request.jwt] Error:', error);
		return NextResponse.json({ error: 'Failed to generate JWT' }, { status: 500 });
	}
}
