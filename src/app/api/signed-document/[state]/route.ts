// src/app/api/signed-document/[state]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { ProcessSignedDocumentUseCase } from '@/core/application/usecases/ProcessSignedDocumentUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { NextRequest } from 'next/server';

const logger = createLogger('SignedDocumentRoute');

/**
 * POST /api/signed-document/[state]
 *
 * Wallet posts the signed document to this endpoint (direct_post mode)
 *
 * Per EUDI spec, the request is form-encoded with:
 * Success case:
 *   - documentWithSignature: array of base64 strings (signed document bytes)
 *   - signatureObject: array of strings (signature data)
 *   - vp_token: VP token JWT containing the nonce for replay attack prevention
 *   - state: the state UUID from the request
 *
 * Error case:
 *   - error: error code
 *   - state: the state UUID from the request
 *
 * SECURITY: The nonce from the VP token is validated against the expected nonce
 * stored in the database to prevent replay attacks.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ state: string }> }) {
	try {
		const { state } = await ctx.params;
		const processSignedDocumentUseCase = Container.get(ProcessSignedDocumentUseCase);

		// Parse form data (application/x-www-form-urlencoded)
		const formData = await req.formData();

		// Extract fields
		const documentWithSignature = formData.getAll('documentWithSignature') as string[];
		const signatureObject = formData.getAll('signatureObject') as string[];
		const error = formData.get('error') as string | null;
		const stateParam = formData.get('state') as string | null;
		const vpToken = formData.get('vp_token') as string | null;

		logger.info('Callback received', {
			state,
			stateParam,
			hasDocumentWithSignature: documentWithSignature.length > 0,
			hasSignatureObject: signatureObject.length > 0,
			hasVpToken: !!vpToken,
			error,
		});

		// Process via use case
		const result = await processSignedDocumentUseCase.execute({
			state,
			stateParam: stateParam || undefined,
			documentWithSignature: documentWithSignature.length > 0 ? documentWithSignature : undefined,
			signatureObject: signatureObject.length > 0 ? signatureObject : undefined,
			vpToken: vpToken || undefined,
			error: error || undefined,
		});

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		// Return success response
		return NextResponse.json(result);
	} catch (error) {
		logger.error('Error processing signed document', error as Error);
		const msg = error instanceof Error ? error.message : 'Failed to process signed document';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
