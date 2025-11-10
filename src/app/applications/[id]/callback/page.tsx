/**
 * Next.js Route: /applications/[id]/callback (OAuth Callback Handler - Same-Device Flow)
 *
 * Responsibilities:
 * - Process OAuth callback from EUDI Wallet
 * - Validate verification response
 * - Redirect to appropriate next step
 *
 * Flow:
 * 1. Receive response_code from query parameter (OAuth authorization code)
 * 2. Process verification with response code
 * 3. Success → redirect to /applications/[id]/finalise
 * 4. Failure → redirect to /applications/[id]?error=verification_failed
 *
 * Query Parameters:
 * - response_code: OAuth authorization code from verifier
 *
 * Note: This is only used for same-device flow. Cross-device flow polls directly without callback.
 * Note: This route has no UI - it only processes the callback and redirects
 */
import 'server-only';
import { notFound, redirect } from 'next/navigation';

import { Container } from '@/core';
import { CheckVerificationStatusUseCase } from '@/core/application/usecases/CheckVerificationStatusUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('CallbackRoute');

interface CallbackRouteProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ response_code?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CallbackRoute({ params, searchParams }: CallbackRouteProps) {
	const checkVerificationStatusUseCase = Container.get(CheckVerificationStatusUseCase);
	const { id } = await params;
	const { response_code } = await searchParams;

	if (!id || !response_code) {
		return notFound();
	}

	try {
		const success = await checkVerificationStatusUseCase.execute({
			applicationId: id,
			responseCode: response_code,
		});

		if (success) {
			redirect(`/applications/${id}/finalise`);
		} else {
			redirect(`/applications/${id}?error=verification_failed`);
		}
	} catch (error) {
		// Re-throw redirect errors (Next.js uses these internally)
		if (
			error &&
			typeof error === 'object' &&
			'digest' in error &&
			typeof error.digest === 'string' &&
			error.digest.startsWith('NEXT_REDIRECT')
		) {
			throw error;
		}
		logger.error('Error processing callback', error as Error);
		redirect(`/applications/${id}?error=callback_error`);
	}
}
