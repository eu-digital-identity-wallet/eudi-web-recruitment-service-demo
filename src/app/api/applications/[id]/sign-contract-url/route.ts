// src/app/api/applications/[id]/sign-contract-url/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { GetSigningUrlUseCase } from '@/core/application/usecases/GetSigningUrlUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('SignContractUrlRoute');

/**
 * GET /api/applications/[id]/sign-contract-url
 *
 * Returns the raw contract signing URL (for testing/debugging)
 * This shows what's encoded in the QR code for employment contract signing
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const getSigningUrlUseCase = Container.get(GetSigningUrlUseCase);

		const result = await getSigningUrlUseCase.execute(id);

		return NextResponse.json(result, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		logger.error('Error generating contract signing URL', error as Error);
		return NextResponse.json({ error: 'Failed to generate contract signing URL' }, { status: 500 });
	}
}
