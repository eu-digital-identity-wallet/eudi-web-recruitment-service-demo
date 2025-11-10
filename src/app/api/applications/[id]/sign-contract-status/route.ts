// src/app/api/applications/sign-contract-status/[id]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { CheckSigningStatusUseCase } from '@/core/application/usecases/CheckSigningStatusUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('SignContractStatusRoute');

/**
 * GET /api/applications/sign-contract-status/[id]
 *
 * Polls the employment contract signing status for an application
 * Returns the current status (PENDING, SIGNED, FAILED, NOT_INITIATED)
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const checkSigningStatusUseCase = Container.get(CheckSigningStatusUseCase);

		const status = await checkSigningStatusUseCase.execute(id);

		return NextResponse.json(status);
	} catch (error) {
		logger.error('Error checking contract signing status', error as Error);
		const msg = error instanceof Error ? error.message : 'Failed to check contract signing status';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
