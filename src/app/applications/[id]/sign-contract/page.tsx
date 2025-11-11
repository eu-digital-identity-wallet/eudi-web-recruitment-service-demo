/**
 * Next.js Route: /applications/[id]/sign-contract (Contract Signing)
 *
 * Responsibilities:
 * - Server-side data fetching
 * - Business logic validation
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Retrieve signing page details (application + signed document)
 * 2. Extract document URL and label
 * 3. Render SignContractPage with data
 *
 * Application Status: FINALIZED, SIGNING
 * Previous Step: /applications/[id]/finalise
 * Next Step: /applications/[id]/employee (after contract signed)
 *
 * Note: Document URL uses state-based identifier for security
 */
import 'server-only';

import { notFound } from 'next/navigation';

import SignContractPage from '@/components/pages/SignContractPage';
import { Container } from '@/core';
import { GetSigningPageDetailsUseCase } from '@/core/application/usecases/GetSigningPageDetailsUseCase';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('SignContractRoute');

export const dynamic = 'force-dynamic';

export default async function SignContractRoute({ params }: { params: Promise<{ id: string }> }) {
	try {
		const getSigningPageDetailsUseCase = Container.get(GetSigningPageDetailsUseCase);

		const { id } = await params;
		const result = await getSigningPageDetailsUseCase.execute(id);

		if (!result) {
			return notFound();
		}

		const { application: app, signedDocument: signedDoc } = result;

		// Note: We don't fetch documentContent here to avoid ArrayBuffer detachment issues
		// The actual document is served via the /api/documents/[state] endpoint
		// Use case returns DTO (plain data) for signedDocument

		const documentUrl = `/api/documents/${signedDoc.state}`;
		const documentLabel = signedDoc.documentLabel;

		return (
			<SignContractPage application={app} documentUrl={documentUrl} documentLabel={documentLabel} />
		);
	} catch (error) {
		logger.error('Error loading signing page', error as Error);
		return notFound();
	}
}
