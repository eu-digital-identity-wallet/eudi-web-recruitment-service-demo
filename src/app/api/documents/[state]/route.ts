// src/app/api/documents/[state]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { GetDocumentForSigningUseCase } from '@/core/application/usecases/GetDocumentForSigningUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('DocumentsRoute');

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
		const getDocumentForSigningUseCase = Container.get(GetDocumentForSigningUseCase);

		// Get document content via use case
		const documentContent = await getDocumentForSigningUseCase.execute(state);

		if (!documentContent) {
			return NextResponse.json({ error: 'Document not found' }, { status: 404 });
		}

		// Return document as PDF
		// Convert Buffer to Uint8Array for NextResponse compatibility
		return new NextResponse(new Uint8Array(documentContent), {
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
		logger.error('Error retrieving document', error as Error);

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
