// src/app/api/signed-document/[state]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { DocumentSigningService } from '@/server/services/signing/ContractSigningService';

import type { NextRequest } from 'next/server';

/**
 * POST /api/signed-document/[state]
 *
 * Wallet posts the signed document to this endpoint (direct_post mode)
 *
 * Per EUDI spec, the request is form-encoded with:
 * Success case:
 *   - documentWithSignature: array of base64 strings (signed document bytes)
 *   - signatureObject: array of strings (signature data)
 *   - state: the state UUID from the request
 *
 * Error case:
 *   - error: error code
 *   - state: the state UUID from the request
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ state: string }> }) {
	try {
		const { state } = await ctx.params;
		const documentSigningService = Container.get(DocumentSigningService);

		// Parse form data (application/x-www-form-urlencoded)
		const formData = await req.formData();

		// Extract fields
		const documentWithSignature = formData.getAll('documentWithSignature') as string[];
		const signatureObject = formData.getAll('signatureObject') as string[];
		const error = formData.get('error') as string | null;
		const stateParam = formData.get('state') as string | null;

		console.log('[signed-document] Callback received:', {
			state,
			stateParam,
			hasDocumentWithSignature: documentWithSignature.length > 0,
			hasSignatureObject: signatureObject.length > 0,
			error,
		});

		// Verify state matches
		if (stateParam && stateParam !== state) {
			console.error('[signed-document] State mismatch:', {
				expected: state,
				received: stateParam,
			});
			return NextResponse.json({ error: 'State parameter mismatch' }, { status: 400 });
		}

		// Process the signed document
		const result = await documentSigningService.processSignedDocument(state, {
			documentWithSignature: documentWithSignature.length > 0 ? documentWithSignature : undefined,
			signatureObject: signatureObject.length > 0 ? signatureObject : undefined,
			error: error || undefined,
		});

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		// Return success response
		return NextResponse.json({
			success: true,
			message: 'Document signed successfully',
		});
	} catch (error) {
		console.error('[signed-document] Error:', error);
		const msg = error instanceof Error ? error.message : 'Failed to process signed document';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
