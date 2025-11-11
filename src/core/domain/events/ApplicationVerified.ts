import { DomainEvent } from './DomainEvent';

/**
 * ApplicationVerified Event
 *
 * Raised when an application's PID verification is completed successfully.
 * Other parts of the system can listen to this event to:
 * - Send confirmation emails
 * - Update analytics
 * - Trigger next workflow steps
 * - Log audit trail
 */

export class ApplicationVerified extends DomainEvent {
	constructor(
		public readonly applicationId: string,
		public readonly candidateFamilyName: string,
		public readonly candidateGivenName: string,
		public readonly candidateEmail?: string,
	) {
		super();
	}

	getEventName(): string {
		return 'ApplicationVerified';
	}

	getAggregateId(): string {
		return this.applicationId;
	}

	toJSON(): Record<string, unknown> {
		return {
			eventId: this.eventId,
			eventName: this.getEventName(),
			occurredAt: this.occurredAt.toISOString(),
			applicationId: this.applicationId,
			candidateFamilyName: this.candidateFamilyName,
			candidateGivenName: this.candidateGivenName,
			candidateEmail: this.candidateEmail,
		};
	}
}
