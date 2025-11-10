import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { GetApplicationDeepLinkUseCase } from '@/core/application/usecases/GetApplicationDeepLinkUseCase';

/**
 * GET /api/applications/[id]/deep-link
 * Returns the verification deep link URL for same-device flow
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
	const getApplicationDeepLinkUseCase = Container.get(GetApplicationDeepLinkUseCase);
	const { id } = await params;

	try {
		const url = await getApplicationDeepLinkUseCase.execute(id);
		return NextResponse.json({ url });
	} catch (error) {
		console.error('Error getting deep link:', error);
		return NextResponse.json({ error: 'Failed to get deep link' }, { status: 500 });
	}
}
