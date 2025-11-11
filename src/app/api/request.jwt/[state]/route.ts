// src/app/api/request.jwt/[state]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { GenerateDocumentJWTUseCase } from '@/core/application/usecases/GenerateDocumentJWTUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('RequestJWTRoute');

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
		const generateDocumentJWTUseCase = Container.get(GenerateDocumentJWTUseCase);

		// Generate signed JWT via use case
		const signedJwt = await generateDocumentJWTUseCase.execute(state);

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
		logger.error('Error generating JWT', error as Error);
		return NextResponse.json({ error: 'Failed to generate JWT' }, { status: 500 });
	}
}
