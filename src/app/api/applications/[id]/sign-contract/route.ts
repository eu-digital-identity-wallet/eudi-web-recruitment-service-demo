// src/app/api/applications/[id]/sign-contract/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { InitiateDocumentSigningUseCase } from '@/core/application/usecases/InitiateDocumentSigningUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { NextRequest } from 'next/server';

const logger = createLogger('SignContractRoute');

/**
 * POST /api/applications/[id]/sign-contract
 *
 * Initiates employment contract signing flow for an application
 * Creates a signing transaction and returns the state UUID
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const initiateDocumentSigningUseCase = Container.get(InitiateDocumentSigningUseCase);

		const result = await initiateDocumentSigningUseCase.execute(id);

		return NextResponse.json(result);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Invalid request';
		logger.error('Error initiating contract signing', err as Error);
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
