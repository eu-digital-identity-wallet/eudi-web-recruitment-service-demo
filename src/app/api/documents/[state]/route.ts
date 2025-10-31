// src/app/api/documents/[state]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { DocumentSigningService } from '@/server/services/signing/ContractSigningService';

/**
 * GET /api/documents/[state]
 *
 * Wallet accesses this endpoint to retrieve the document to be signed
 * Returns the PDF/document bytes
 *
 * Per EUDI spec:
 * - method.type is "public" so no authentication required
 * - Returns document bytes that match the hash in documentDigests
 */
export async function GET(_req: Request, ctx: { params: Promise<{ state: string }> }) {
	try {
		const { state } = await ctx.params;
		const documentSigningService = Container.get(DocumentSigningService);

		// Get document content
		const documentContent = await documentSigningService.getDocumentForSigning(state);

		if (!documentContent) {
			return NextResponse.json({ error: 'Document not found' }, { status: 404 });
		}

		// Validate buffer before trying to send
		if (!Buffer.isBuffer(documentContent) || documentContent.length === 0) {
			console.error('[documents] Invalid document content');
			return NextResponse.json({ error: 'Document content is invalid' }, { status: 500 });
		}

		// Return document as PDF
		// Send buffer directly instead of converting to Uint8Array
		return new NextResponse(documentContent, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'inline; filename="contract.pdf"',
				'Content-Length': documentContent.length.toString(),
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				Pragma: 'no-cache',
			},
		});
	} catch (error) {
		console.error('[documents] Error:', error);

		// Check if it's a buffer-related error
		if (
			error instanceof RangeError ||
			(error as NodeJS.ErrnoException).code === 'ERR_BUFFER_OUT_OF_BOUNDS'
		) {
			return NextResponse.json(
				{ error: 'Document data is corrupted. Please create a new signing session.' },
				{ status: 500 },
			);
		}

		return NextResponse.json({ error: 'Failed to retrieve document' }, { status: 500 });
	}
}
