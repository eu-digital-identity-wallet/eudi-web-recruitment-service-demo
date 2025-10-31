// src/app/api/applications/signing-status/[id]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { DocumentSigningService } from '@/server/services/signing/ContractSigningService';

/**
 * GET /api/applications/signing-status/[id]
 *
 * Polls the signing status for an application
 * Returns the current status (PENDING, SIGNED, FAILED, NOT_INITIATED)
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const documentSigningService = Container.get(DocumentSigningService);

		const status = await documentSigningService.checkSigningStatus(id);

		return NextResponse.json(status);
	} catch (error) {
		console.error('[signing-status] Error:', error);
		const msg = error instanceof Error ? error.message : 'Failed to check signing status';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
