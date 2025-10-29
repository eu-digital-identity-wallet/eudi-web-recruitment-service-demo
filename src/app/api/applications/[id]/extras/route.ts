import { CredentialType } from '@prisma/client';
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { ApplicationService } from '@/server/services/ApplicationService';

import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const applicationService = Container.get(ApplicationService);
		const { id: applicationId } = await params;
		const json = await req.json().catch(() => ({}));

		const diploma = json.diploma ?? false;
		const seafarer = json.seafarer ?? false;
		const taxResidency = json.taxResidency ?? false;
		const sameDeviceFlow = json.sameDeviceFlow ?? false;

		if (!diploma && !seafarer && !taxResidency) {
			return NextResponse.json(
				{ error: 'At least one credential type must be selected' },
				{ status: 400 },
			);
		}

		// Determine credential type based on checkboxes
		const credentialType: CredentialType[] = [];
		if (diploma) {
			credentialType.push(CredentialType.DIPLOMA);
		}
		if (seafarer) {
			credentialType.push(CredentialType.SEAFARER);
		}
		if (taxResidency) {
			credentialType.push(CredentialType.TAXRESIDENCY);
		}

		const result = await applicationService.requestAdditionalCredentials({
			applicationId,
			credentialType,
			sameDeviceFlow,
		});

		// Return both URL and flow type for frontend handling
		return NextResponse.json({
			...result,
			flowType: sameDeviceFlow ? 'same-device' : 'cross-device',
			credentialType,
			requiresQR: !sameDeviceFlow,
		});
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Invalid request';
		const code = /not found/i.test(msg) ? 404 : 400;
		return NextResponse.json({ error: msg }, { status: code });
	}
}
