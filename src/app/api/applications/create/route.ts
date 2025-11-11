import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { CreateApplicationUseCase } from '@/core/application/usecases/CreateApplicationUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { NextRequest } from 'next/server';

const logger = createLogger('CreateApplicationRoute');

/**
 * POST /api/applications/create
 *
 * Called by: Job application form (client-side component)
 * When: User clicks "Apply" button on job listing page
 *
 * Purpose: Creates a new job application and initiates the PID (Person Identification) verification flow
 *
 * Flow:
 * 1. Creates application record in database (status: CREATED)
 * 2. Initiates OpenID4VP transaction for PID verification
 * 3. Returns verification URL/QR code for user to scan with EUDI Wallet
 *
 * Returns:
 * - url: Deep link or verification URL to display as QR code
 * - applicationId: UUID of the created application (for same-device flow)
 */
export async function POST(req: NextRequest) {
	try {
		const createApplicationUseCase = Container.get(CreateApplicationUseCase);
		const json = await req.json().catch(() => ({}));

		logger.info('Create Application Request', { json });

		const res = await createApplicationUseCase.execute({
			vacancyId: json.jobId,
			sameDeviceFlow: json.sameDevice ?? json.sameDeviceFlow ?? false,
		});

		return NextResponse.json(res);
	} catch (err: unknown) {
		logger.error('Create Application Error', err as Error);
		const msg = err instanceof Error ? err.message : 'Invalid request';
		const code = /not found/i.test(msg) ? 404 : 400;
		return NextResponse.json({ error: msg }, { status: code });
	}
}
