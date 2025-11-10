/**
 * Next.js Route: /applications/[id]/tax-residency (Tax Residency Attestation Verification)
 *
 * Responsibilities:
 * - Server-side data fetching (via single use case)
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Execute GetTaxResidencyPageDataUseCase (encapsulates all business logic)
 * 2. Handle access control results
 * 3. Render TaxResidencyVerificationPage with data
 *
 * Application Status: SIGNED
 * Previous Step: /applications/[id]/employee
 * Next Step: /applications/[id]/employee (after verification)
 *
 * Note: Handles ONLY tax residency attestation (post-signing), NOT professional qualifications
 */
import 'server-only';
import { notFound } from 'next/navigation';

import TaxResidencyVerificationPage from '@/components/pages/TaxResidencyVerificationPage';
import { Container } from '@/core';
import { GetTaxResidencyPageDataUseCase } from '@/core/application/usecases/GetTaxResidencyPageDataUseCase';

export const dynamic = 'force-dynamic';

export default async function TaxResidencyRoute({ params }: { params: Promise<{ id: string }> }) {
	const getTaxResidencyPageDataUseCase = Container.get(GetTaxResidencyPageDataUseCase);
	const { id } = await params;

	const pageData = await getTaxResidencyPageDataUseCase.execute(id);
	if (!pageData) return notFound();

	// Handle page access control
	if (!pageData.pageAccessResult.allowed) {
		return notFound();
	}

	return <TaxResidencyVerificationPage application={pageData.application} />;
}
