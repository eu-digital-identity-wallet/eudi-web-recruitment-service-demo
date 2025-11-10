import 'server-only';
import { Inject, Service } from 'typedi';

import { DomainEvent } from '@/core/domain/events';
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

import type { ICheckQualificationsVerificationStatusUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IEventDispatcher } from '@/core/application/ports/outbound/IEventDispatcher';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';
import type { IVerifierPort } from '@/core/application/ports/outbound/IVerifierPort';
import type { Prisma } from '@prisma/client';

/**
 * Use Case: Check Qualifications Verification Status
 * Checks verification status for additional credentials
 */
@Service()
export class CheckQualificationsVerificationStatusUseCase
	implements ICheckQualificationsVerificationStatusUseCase
{
	private readonly logger = createLogger('CheckQualificationsVerificationStatusUseCase');

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
		// Load application
		const prismaApp = await this.applicationRepo.findById(applicationId);
		if (!prismaApp) {
			this.logger.info('Application not found', { applicationId });
			return false;
		}

		// Get qualifications credentials (DIPLOMA, SEAFARER, or TAXRESIDENCY)
		const qualificationsCredentials =
			await this.verifiedCredentialRepo.findByApplicationId(applicationId);
		this.logger.info('Found credentials', {
			credentials: qualificationsCredentials.map((c) => ({
				type: c.getCredentialType(),
				status: c.getStatus(),
			})),
		});

		// Filter to only qualifications credentials (not PID or EMPLOYEE)
		const qualifications = qualificationsCredentials.filter(
			(c) =>
				c.getCredentialType() === CredentialType.DIPLOMA.getValue() ||
				c.getCredentialType() === CredentialType.SEAFARER.getValue() ||
				c.getCredentialType() === CredentialType.TAXRESIDENCY.getValue(),
		);

		// Check if there are PENDING qualifications to process
		const pendingQualifications = qualifications.filter((c) => c.isPending());

		if (pendingQualifications.length === 0) {
			// No pending credentials to check - return true if we have any verified, false otherwise
			const hasVerifiedQualifications = qualifications.some((c) => c.isVerified());
			if (hasVerifiedQualifications) {
				this.logger.info('No pending qualifications, but found verified ones', {
					types: qualifications.filter((c) => c.isVerified()).map((c) => c.getCredentialType()),
				});
			} else {
				this.logger.info('No pending or verified qualifications credentials found');
			}
			return hasVerifiedQualifications;
		}
		// All pending credentials should share the same transaction ID (they were created together)
		const transactionId = pendingQualifications[0]?.getVerifierTransactionId();
		if (!transactionId) {
			this.logger.info('No transaction ID found on pending credentials');
			return false;
		}

		this.logger.info('Checking verification for', {
			credTypes: pendingQualifications.map((c) => c.getCredentialType()),
			transactionId,
		});

		// Check verification with EUDI verifier
		const verification = await this.verifier.checkVerification(transactionId, responseCode);

		this.logger.info('Verification result', {
			status: verification?.status,
			hasCredentials: !!verification?.verifiedCredentials,
			namespaces: verification?.verifiedCredentials
				? Object.keys(verification.verifiedCredentials)
				: [],
		});

		if (verification?.status === true && verification.verifiedCredentials) {
			let updatedCount = 0;
			const allEvents: DomainEvent[] = [];

			// Process ALL credentials returned in the verification response
			for (const [namespace, claims] of Object.entries(verification.verifiedCredentials)) {
				const credType = VerifiedCredential.mapNamespaceToCredentialType(namespace);
				this.logger.info('Processing namespace', {
					namespace,
					credType,
				});

				// Find if we have a pending credential for this type
				const pendingCred = pendingQualifications.find((c) => c.getCredentialType() === credType);

				if (pendingCred && credType) {
					this.logger.info('Updating credential to VERIFIED', { credType });

					// Apply domain command: mark as verified (this raises QualificationVerified event)
					pendingCred.markAsVerified();

					// Update this specific credential by its ID (not transaction ID)
					// to ensure we only update the matching credential
					await this.verifiedCredentialRepo.update(pendingCred.getId(), {
						credentialData: claims as Prisma.InputJsonValue,
						status: VerificationStatus.VERIFIED,
						verifiedAt: new Date(),
					});

					// Collect domain events
					const events = pendingCred.getDomainEvents();
					allEvents.push(...events);
					pendingCred.clearDomainEvents();

					updatedCount++;
				}
			}

			this.logger.info('Updated credentials', { count: updatedCount });

			// Publish all collected domain events
			if (allEvents.length > 0) {
				await this.eventDispatcher.publishAll(allEvents);
			}

			// Return true if we updated at least one credential
			return updatedCount > 0;
		}

		this.logger.info('Returning false - no match found');
		return false;
	}
}
