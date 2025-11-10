/**
 * Next.js Route: /applications/[id]/employee-qr (Employee QR Code Display)
 *
 * Responsibilities:
 * - Server-side data fetching
 * - Business logic validation (status check)
 * - Pass data to presentation component
 *
 * Flow:
 * 1. Fetch application details
 * 2. Verify status is SIGNED
 * 3. Retrieve employee credential and OTP
 * 4. Render EmployeeQRPage with data
 *
 * Application Status: SIGNED
 * Previous Step: /applications/[id]/employee
 */
import 'server-only';
import { notFound } from 'next/navigation';

import EmployeeQRPage from '@/components/pages/EmployeeQRPage';
import { Container } from '@/core';
import { GetApplicationDetailsUseCase } from '@/core/application/usecases/GetApplicationDetailsUseCase';
import { GetIssuedCredentialUseCase } from '@/core/application/usecases/GetIssuedCredentialUseCase';

export const dynamic = 'force-dynamic';

export default async function EmployeeQRRoute({ params }: { params: Promise<{ id: string }> }) {
	const getDetailsUseCase = Container.get(GetApplicationDetailsUseCase);
	const getIssuedCredentialUseCase = Container.get(GetIssuedCredentialUseCase);
	const { id } = await params;

	const app = await getDetailsUseCase.execute(id);
	if (!app) return notFound();

	// Only show this page when status is SIGNED
	if (app.status !== 'SIGNED') {
		return notFound();
	}

	// Get employee credential to retrieve OTP (using plain string)
	// Use case returns DTO (plain data)
	const credential = await getIssuedCredentialUseCase.execute(id, 'EMPLOYEE');
	const otp = credential?.otp;

	return <EmployeeQRPage application={app} otp={otp} />;
}
