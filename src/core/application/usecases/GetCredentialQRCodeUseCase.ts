import 'server-only';
import { Inject, Service } from 'typedi';

import { CredentialType } from '@/core/domain/value-objects';
import { ICredentialRepositoryToken } from '@/core/infrastructure/config/container';

import type { IGetCredentialQRCodeUseCase } from '@/core/application/ports/inbound';
import type { IIssuedCredentialRepository } from '@/core/application/ports/outbound/IIssuedCredentialRepository';

/**
 * Use Case: Get Credential QR Code
 * Retrieves the credential offer URL for QR code generation
 *
 * This use case orchestrates:
 * 1. Retrieval of issued credential for application
 * 2. Returns the credential offer URL for QR code generation
 */
@Service()
export class GetCredentialQRCodeUseCase implements IGetCredentialQRCodeUseCase {
	constructor(
		@Inject(ICredentialRepositoryToken)
		private readonly credentialRepo: IIssuedCredentialRepository,
	) {}

	public async execute(applicationId: string): Promise<string | null> {
		// Get credential from repository using credential type value object
		const credential = await this.credentialRepo.findByApplicationIdAndType(
			applicationId,
			CredentialType.EMPLOYEE.getValue(),
		);

		if (!credential?.getCredentialOfferUrl()) {
			return null;
		}

		return credential.getCredentialOfferUrl();
	}
}
