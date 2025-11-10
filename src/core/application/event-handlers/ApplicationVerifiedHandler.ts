import { Service } from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { ApplicationVerified, DomainEvent } from '@/core/domain/events';

/**
 * Application Verified Event Handler
 *
 * Handles the ApplicationVerified domain event.
 * Triggered when a candidate successfully completes PID verification.
 *
 * Responsibilities:
 * - Log verification event for audit trail
 * - Send confirmation notification (future: email/SMS)
 * - Update analytics/metrics (future)
 * - Trigger next workflow steps (future)
 */
@Service()
export class ApplicationVerifiedHandler {
	private readonly logger = createLogger('ApplicationVerifiedHandler');

	async handle(event: DomainEvent): Promise<void> {
		const verifiedEvent = event as ApplicationVerified;

		this.logger.info('Application verified event received', {
			eventId: verifiedEvent.eventId,
			applicationId: verifiedEvent.applicationId,
			candidateName: `${verifiedEvent.candidateGivenName} ${verifiedEvent.candidateFamilyName}`,
			candidateEmail: verifiedEvent.candidateEmail,
			occurredAt: verifiedEvent.occurredAt,
		});

		// TODO: Implement notification service
		// await this.notificationService.sendVerificationConfirmation({
		//   email: verifiedEvent.candidateEmail,
		//   name: `${verifiedEvent.candidateGivenName} ${verifiedEvent.candidateFamilyName}`,
		//   applicationId: verifiedEvent.applicationId,
		// });

		// TODO: Implement analytics tracking
		// await this.analyticsService.trackVerification({
		//   applicationId: verifiedEvent.applicationId,
		//   verifiedAt: verifiedEvent.occurredAt,
		// });
	}
}
