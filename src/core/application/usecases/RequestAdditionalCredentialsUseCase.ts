import 'server-only';
import { Inject, Service } from 'typedi';

import { ApplicationMapper } from '@/core/domain';
import { CredentialNamespace, VerifiedCredential } from '@/core/domain/model/VerifiedCredential';
import { CredentialType } from '@/core/domain/value-objects';
import {
	IApplicationRepositoryToken,
	IVerifiedCredentialRepositoryToken,
	IVerifierPortToken,
} from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { applicationExtrasSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';
import { generateId } from '@/core/shared/utils/id-generator';

import type { IRequestAdditionalCredentialsUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';
import type { IVerifierPort } from '@/core/application/ports/outbound/IVerifierPort';

/**
 * Use Case: Request Additional Credentials
 * Initiates verification for additional credentials (DIPLOMA, SEAFARER, TAXRESIDENCY)
 */
@Service()
export class RequestAdditionalCredentialsUseCase implements IRequestAdditionalCredentialsUseCase {
	private readonly logger = createLogger('RequestAdditionalCredentialsUseCase');

	constructor(
		@Inject(IVerifierPortToken) private readonly verifier: IVerifierPort,
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		@Inject(IVerifiedCredentialRepositoryToken)
		private readonly verifiedCredentialRepo: IVerifiedCredentialRepository,
	) {}

	@ValidateInput(applicationExtrasSchema)
	public async execute(data: {
		applicationId: string;
		credentialType: string[];
		sameDeviceFlow: boolean;
	}): Promise<{ url: string }> {
		const { applicationId, credentialType: credentialTypeStrings, sameDeviceFlow } = data;

		// Convert string DTOs to domain value objects
		const credentialType = credentialTypeStrings.map((type) => CredentialType.fromString(type));

		const prismaApp = await this.applicationRepo.findById(applicationId);
		if (!prismaApp) throw new Error('Application not found');

		const application = ApplicationMapper.toDomain(prismaApp);

		// Business rule check - validate each credential type can be requested
		for (const type of credentialType) {
			if (
				(type.equals(CredentialType.DIPLOMA) || type.equals(CredentialType.SEAFARER)) &&
				!application.canRequestQualifications()
			) {
				throw new Error(
					'Professional qualifications can only be requested when application is verified',
				);
			}
			if (type.equals(CredentialType.TAXRESIDENCY) && !application.canRequestTaxResidency()) {
				throw new Error('Tax residency attestation can only be requested after contract is signed');
			}
		}

		// Check for existing PENDING credentials and mark them as FAILED
		// This ensures only the latest QR code/transaction is valid while keeping audit trail
		const existingCredentials =
			await this.verifiedCredentialRepo.findByApplicationId(applicationId);
		const pendingCredentialsToFail = existingCredentials.filter((cred) => {
			const isPending = cred.isPending();
			const isQualification =
				cred.getCredentialType() === 'DIPLOMA' || cred.getCredentialType() === 'SEAFARER';
			return isPending && isQualification;
		});

		if (pendingCredentialsToFail.length > 0) {
			this.logger.info(
				'Marking old pending credentials as FAILED before creating new verification',
				{
					count: pendingCredentialsToFail.length,
					types: pendingCredentialsToFail.map((c) => c.getCredentialType()),
					ids: pendingCredentialsToFail.map((c) => c.getId()),
				},
			);
			for (const cred of pendingCredentialsToFail) {
				const credId = cred.getId();
				const credType = cred.getCredentialType();
				cred.markAsFailed();
				const updated = await this.verifiedCredentialRepo.update(credId, {
					status: 'FAILED',
				});
				this.logger.info('Updated credential status to FAILED', {
					id: credId,
					type: credType,
					newStatus: updated.getStatus(),
				});
			}
		}

		// Create a new verification request for additional credentials only (no PID)
		const initVerificationResponse = await this.verifier.initVerification(
			applicationId,
			sameDeviceFlow,
			credentialType,
		);

		// Create PENDING VerifiedCredential records for requested credentials
		const credentialsToCreate: Array<{ type: CredentialType; namespace: string }> = [];

		this.logger.info('Requested credential types', { credentialType });

		if (credentialType.some((type) => type.equals(CredentialType.DIPLOMA))) {
			credentialsToCreate.push({
				type: CredentialType.DIPLOMA,
				namespace: CredentialNamespace.DIPLOMA,
			});
		}

		if (credentialType.some((type) => type.equals(CredentialType.SEAFARER))) {
			credentialsToCreate.push({
				type: CredentialType.SEAFARER,
				namespace: CredentialNamespace.SEAFARER,
			});
		}

		if (credentialType.some((type) => type.equals(CredentialType.TAXRESIDENCY))) {
			credentialsToCreate.push({
				type: CredentialType.TAXRESIDENCY,
				namespace: CredentialNamespace.TAXRESIDENCY,
			});
		}

		this.logger.info('Credentials to create', { credentialsToCreate });

		//Create domain entities first using factory method
		for (const { type, namespace } of credentialsToCreate) {
			const credential = VerifiedCredential.create({
				id: generateId(),
				applicationId,
				credentialType: type.getValue(),
				namespace,
				verifierTransactionId: initVerificationResponse.TransactionId,
				verifierRequestUri: initVerificationResponse.requestUri,
				credentialData: {},
			});

			//Persist domain entity through repository
			await this.verifiedCredentialRepo.save(credential);
		}

		return { url: initVerificationResponse.requestUri };
	}
}
