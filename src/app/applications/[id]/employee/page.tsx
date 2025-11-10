/**
 * Next.js Route: /applications/[id]/employee (Employee Credential Issuance)
 *
 * Responsibilities:
 * - Server-side data fetching
 * - Business logic validation (page access control)
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Fetch application and credentials data
 * 2. Validate access permissions using domain logic
 * 3. Render EmployeePage with fetched data
 *
 * Application Status: SIGNED
 * Previous Step: /applications/[id]/sign-contract
 * Next Steps: /applications/[id]/employee-qr or /applications/[id]/tax-residency
 */
import 'server-only';
import { notFound } from 'next/navigation';

import EmployeePage from '@/components/pages/EmployeePage';
import { Container } from '@/core';
import { GetEmployeePageDetailsUseCase } from '@/core/application/usecases/GetEmployeePageDetailsUseCase';

export const dynamic = 'force-dynamic';

export default async function EmployeeCredentialPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const getEmployeePageDetailsUseCase = Container.get(GetEmployeePageDetailsUseCase);

	const { id } = await params;
	if (!id) return notFound();

	// Fetch all page details with a single use case
	const pageDetails = await getEmployeePageDetailsUseCase.execute(id);
	if (!pageDetails) return notFound();

	return (
		<EmployeePage
			application={pageDetails.application}
			verifiedCredentials={pageDetails.verifiedCredentials}
			professionalQualifications={pageDetails.professionalQualifications}
		/>
	);
}
