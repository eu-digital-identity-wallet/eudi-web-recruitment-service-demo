import 'server-only';
import { Inject, Service } from 'typedi';

import { ApplicationMapper } from '@/core/domain';
import { CredentialType } from '@/core/domain/value-objects';
import {
	IApplicationRepositoryToken,
	IVerifiedCredentialRepositoryToken,
} from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetSupplementaryCredentialsDeepLinkUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';

/**
 * Use Case: Get Supplementary Credentials Deep Link
 * Retrieves the verification deep link for additional credentials (DIPLOMA, SEAFARER, TAXRESIDENCY, etc.)
 */
@Service()
export class GetSupplementaryCredentialsDeepLinkUseCase
	implements IGetSupplementaryCredentialsDeepLinkUseCase
{
	private readonly logger = createLogger('GetSupplementaryCredentialsDeepLinkUseCase');

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

		// Get the most recent supplementary credential (DIPLOMA, SEAFARER, or TAXRESIDENCY)
		const qualificationsCredentials =
			await this.verifiedCredentialRepo.findByApplicationId(applicationId);

		this.logger.info('All credentials', {
			credentials: qualificationsCredentials.map((c) => ({
				type: c.getCredentialType(),
				status: c.getStatus(),
				hasUri: !!c.getVerifierRequestUri(),
			})),
		});

		const qualificationsCredential = qualificationsCredentials.find(
			(c) =>
				(c.getCredentialType() === CredentialType.DIPLOMA.getValue() ||
					c.getCredentialType() === CredentialType.SEAFARER.getValue() ||
					c.getCredentialType() === CredentialType.TAXRESIDENCY.getValue()) &&
				c.isPending(),
		);

		this.logger.info('Found credential', {
			credential: qualificationsCredential
				? {
						type: qualificationsCredential.getCredentialType(),
						status: qualificationsCredential.getStatus(),
						hasUri: !!qualificationsCredential.getVerifierRequestUri(),
					}
				: null,
		});

		if (!qualificationsCredential?.getVerifierRequestUri()) {
			throw new Error('No supplementary credentials verifier link available for application');
		}

		// Business rule check based on credential type
		const credentialType = qualificationsCredential.getCredentialType();
		this.logger.info('Checking credential type', { credentialType });
		if (credentialType === CredentialType.TAXRESIDENCY.getValue()) {
			if (!application.canRequestTaxResidency()) {
				throw new Error('Tax residency can only be requested after contract is signed');
			}
		} else {
			// DIPLOMA or SEAFARER
			if (!application.canRequestQualifications()) {
				throw new Error(
					'Professional qualifications can only be requested when application is verified',
				);
			}
		}

		return qualificationsCredential.getVerifierRequestUri();
	}
}
