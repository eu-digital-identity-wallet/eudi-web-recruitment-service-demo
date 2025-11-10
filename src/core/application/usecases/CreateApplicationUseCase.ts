import 'server-only';
import { Inject, Service } from 'typedi';

import { Application } from '@/core/domain/model/Application';
import { CredentialNamespace, VerifiedCredential } from '@/core/domain/model/VerifiedCredential';
import { CredentialType } from '@/core/domain/value-objects';
import {
	IApplicationRepositoryToken,
	IVacancyRepositoryToken,
	IVerifiedCredentialRepositoryToken,
	IVerifierPortToken,
} from '@/core/infrastructure/config/container';
import { applicationCreateSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';
import { generateId } from '@/core/shared/utils/id-generator';

import type { ICreateApplicationUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IVacancyRepository } from '@/core/application/ports/outbound/IVacancyRepository';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';
import type { IVerifierPort } from '@/core/application/ports/outbound/IVerifierPort';

/**
 * Use Case: Create Application
 * Creates a new job application and initializes PID verification
 *
 * Implements the ICreateApplicationUseCase inbound port.
 */
@Service()
export class CreateApplicationUseCase implements ICreateApplicationUseCase {
	constructor(
		@Inject(IVerifierPortToken) private readonly verifier: IVerifierPort,
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		@Inject(IVacancyRepositoryToken) private readonly jobRepo: IVacancyRepository,
		@Inject(IVerifiedCredentialRepositoryToken)
		private readonly verifiedCredentialRepo: IVerifiedCredentialRepository,
	) {}

	@ValidateInput(applicationCreateSchema)
	public async execute(params: {
		vacancyId: string;
		sameDeviceFlow: boolean;
	}): Promise<{ url: string; applicationId?: string }> {
		const job = await this.jobRepo.findById(params.vacancyId);
		if (!job) throw new Error('Job not found');

		//Create domain entity first (encapsulates business rules)
		const application = Application.create(job.id, generateId());

		// Business rule check: can start verification
		if (!application.canStartVerification()) {
			throw new Error('Application cannot start verification');
		}

		//Persist domain entity through repository
		await this.applicationRepo.save(application);

		// Initialize PID verification (personal info is always needed first)
		const initVerificationResponse = await this.verifier.initVerification(
			application.getId(),
			params.sameDeviceFlow,
			[CredentialType.PID],
		);

		//Create PENDING VerifiedCredential entity for PID
		const pidCredential = VerifiedCredential.create({
			id: generateId(),
			applicationId: application.getId(),
			credentialType: CredentialType.PID.getValue(),
			namespace: CredentialNamespace.PID,
			verifierTransactionId: initVerificationResponse.TransactionId,
			verifierRequestUri: initVerificationResponse.requestUri,
			credentialData: {},
		});

		//Persist domain entity through repository
		await this.verifiedCredentialRepo.save(pidCredential);

		const res = { url: initVerificationResponse.requestUri } as {
			url: string;
			applicationId?: string;
		};
		if (!params.sameDeviceFlow) res.applicationId = application.getId();
		return res;
	}
}
