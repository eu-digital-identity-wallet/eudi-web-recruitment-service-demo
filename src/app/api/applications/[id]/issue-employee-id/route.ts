import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { IssueEmployeeIdUseCase } from '@/core/application/usecases/IssueEmployeeIdUseCase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/applications/[id]/issue-employee-id
 *
 * Called by: EmployeeIssuanceActions component on employee page
 * When: User clicks "Issue Employee ID" button (SIGNED status required)
 *
 * Purpose: Issues employee ID credential to user's EUDI Wallet
 *
 * Flow:
 * 1. Creates employee credential with application data
 * 2. Initiates OpenID4VCI (Verifiable Credential Issuance) transaction with Issuer
 * 3. Generates credential offer URL with optional PIN/OTP
 * 4. Updates application status to ISSUING
 * 5. Returns offer URL for QR code display
 *
 * Returns:
 * - success: boolean
 * - offerUrl: OpenID4VCI credential offer URL for QR code
 * - otp: Optional PIN code for pre-authorised flow
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const issueEmployeeIdUseCase = Container.get(IssueEmployeeIdUseCase);
		const { id: applicationId } = await params;

		const result = await issueEmployeeIdUseCase.execute(applicationId);

		if (!result) {
			return NextResponse.json({ error: 'Application not found' }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			offerUrl: result.offerUrl,
			otp: result.otp,
		});
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Failed to issue employee ID';
		const code = /not found/i.test(msg) ? 404 : /cannot issue/i.test(msg) ? 400 : 500;
		return NextResponse.json({ error: msg }, { status: code });
	}
}
