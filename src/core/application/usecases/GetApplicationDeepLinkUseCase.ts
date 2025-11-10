import 'server-only';
import { Inject, Service } from 'typedi';

import { ApplicationMapper } from '@/core/domain';
import { ApplicationStatus } from '@/core/domain/model/Application';
import { CredentialType } from '@/core/domain/value-objects';
import {
	IApplicationRepositoryToken,
	IVerifiedCredentialRepositoryToken,
} from '@/core/infrastructure/config/container';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetApplicationDeepLinkUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';

/**
 * Use Case: Get Application Deep Link
 * Retrieves the verification deep link for PID credential
 */
@Service()
export class GetApplicationDeepLinkUseCase implements IGetApplicationDeepLinkUseCase {
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		@Inject(IVerifiedCredentialRepositoryToken)
		private readonly verifiedCredentialRepo: IVerifiedCredentialRepository,
	) {}

	@ValidateInput(applicationIdSchema)
	public async execute(applicationId: string): Promise<string> {
		const prismaApp = await this.applicationRepo.findById(applicationId);
		if (!prismaApp) throw new Error('Application not found');

		const application = ApplicationMapper.toDomain(prismaApp);

		// Business rule check - QR code should be available during CREATED and VERIFYING states
		const status = application.getStatus();
		if (status !== ApplicationStatus.CREATED && status !== ApplicationStatus.VERIFYING) {
			throw new Error(
				`Application not in correct state for verification. Current status: ${status}`,
			);
		}

		// Get PID verification credential
		const pidCredential = await this.verifiedCredentialRepo.findByApplicationIdAndType(
			applicationId,
			CredentialType.PID.getValue(),
		);

		if (!pidCredential?.getVerifierRequestUri()) {
			throw new Error('No verifier link available for application');
		}

		return pidCredential.getVerifierRequestUri();
	}
}
