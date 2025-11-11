import 'server-only';
import { Inject, Service } from 'typedi';

import { ApplicationMapper, CandidateInfo } from '@/core/domain';
import { VerificationStatus, VerifiedCredential } from '@/core/domain/model/VerifiedCredential';
import { CredentialType } from '@/core/domain/value-objects';
import {
	IApplicationRepositoryToken,
	IVerifiedCredentialRepositoryToken,
	IVerifierPortToken,
} from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { applicationVerificationSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { ICheckVerificationStatusUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IEventDispatcher } from '@/core/application/ports/outbound/IEventDispatcher';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';
import type { IVerifierPort } from '@/core/application/ports/outbound/IVerifierPort';
import type { Prisma } from '@prisma/client';

/**
 * Use Case: Check Verification Status
 * Polls verification status and updates candidate info on success
 *
 * Implements the ICheckVerificationStatusUseCase inbound port.
 */
@Service()
export class CheckVerificationStatusUseCase implements ICheckVerificationStatusUseCase {
	private readonly logger = createLogger('CheckVerificationStatusUseCase');

	constructor(
		@Inject(IVerifierPortToken) private readonly verifier: IVerifierPort,
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
		@Inject(IVerifiedCredentialRepositoryToken)
		private readonly verifiedCredentialRepo: IVerifiedCredentialRepository,
		@Inject('IEventDispatcher') private readonly eventDispatcher: IEventDispatcher,
	) {}

	@ValidateInput(applicationVerificationSchema)
	public async execute({
		applicationId,
		responseCode,
	}: {
		applicationId: string;
		responseCode?: string;
	}): Promise<boolean> {
		const prismaApp = await this.applicationRepo.findById(applicationId);
		if (!prismaApp) return false;

		const application = ApplicationMapper.toDomain(prismaApp);

		// Mark as verifying if ready to start verification (first check)
		if (application.canStartVerification()) {
			application.markAsVerifying();
			await this.applicationRepo.update(applicationId, {
				status: application.getStatus(),
			});
		}

		// Get PID verification credential
		const pidCredential = await this.verifiedCredentialRepo.findByApplicationIdAndType(
			applicationId,
			CredentialType.PID.getValue(),
		);

		if (!pidCredential?.getVerifierTransactionId()) return false;

		// Check verification with EUDI verifier via port
		const verification = await this.verifier.checkVerification(
			pidCredential.getVerifierTransactionId(),
			responseCode,
		);

		const personal = verification?.personalInfo;

		this.logger.info('Personal info received', { personal });

		if (verification?.status === true && personal?.family_name && personal?.given_name) {
			// Create candidate info value object
			const candidateInfo = CandidateInfo.create({
				familyName: personal.family_name,
				givenName: personal.given_name,
				dateOfBirth: personal.birth_date ?? undefined,
				email: personal.email_address ?? undefined,
				mobilePhone: personal.mobile_phone_number ?? undefined,
				nationality: personal.nationality ?? undefined,
			});

			this.logger.info('Candidate info created', {
				familyName: candidateInfo.familyName,
				givenName: candidateInfo.givenName,
				dateOfBirth: candidateInfo.dateOfBirth,
				email: candidateInfo.email,
				mobilePhone: candidateInfo.mobilePhone,
				nationality: candidateInfo.nationality,
			});

			// Apply domain command: mark as verified
			application.markAsVerified(candidateInfo);

			// Store all verified credentials from the VP token
			if (verification.verifiedCredentials) {
				for (const [namespace, claims] of Object.entries(verification.verifiedCredentials)) {
					const credType = VerifiedCredential.mapNamespaceToCredentialType(namespace);
					if (credType) {
						await this.verifiedCredentialRepo.updateByTransactionId(
							pidCredential.getVerifierTransactionId(),
							{
								credentialData: claims as Prisma.InputJsonValue,
								status: VerificationStatus.VERIFIED,
								verifiedAt: new Date(),
							},
						);
					}
				}
			}

			// Persist domain changes - use domain DTO, not Prisma types
			const candidateData = application.getCandidateInfo();
			await this.applicationRepo.update(applicationId, {
				status: application.getStatus(),
				candidateFamilyName: candidateData?.familyName.getValue() ?? null,
				candidateGivenName: candidateData?.givenName.getValue() ?? null,
				candidateDateOfBirth: candidateData?.dateOfBirth?.toString() ?? null,
				candidateNationality: candidateData?.nationality?.getValue() ?? null,
				candidateEmail: candidateData?.email?.getValue() ?? null,
				candidateMobilePhone: candidateData?.mobilePhone?.getValue() ?? null,
			});

			// Publish domain events
			const events = application.getDomainEvents();
			if (events.length > 0) {
				await this.eventDispatcher.publishAll(events);
				application.clearDomainEvents();
			}

			return true;
		}

		return false;
	}
}
