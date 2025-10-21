// src/app/api/applications/verification/[id]/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { ApplicationService } from '@/server/services/ApplicationService';

import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	const applicationService = Container.get(ApplicationService);
	const { id } = await ctx.params;
	const responseCode = req.nextUrl.searchParams.get('response_code') ?? undefined;

	const ok = await applicationService.verificationStatus({
		applicationId: id,
		responseCode,
	});

	return NextResponse.json(
		{ status: ok },
		{
			headers: {
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				Pragma: 'no-cache',
			},
		},
	);
}
