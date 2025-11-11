import { DomainEvent } from './DomainEvent';

/**
 * QualificationVerified Event
 *
 * Raised when a candidate's professional qualification credential is verified successfully.
 * This includes Diploma, Seafarer certificates, or Tax Residency attestations.
 *
 * Other parts of the system can listen to this event to:
 * - Log verification event for compliance/audit
 * - Trigger workflow progression (e.g., move to signing stage)
 * - Send notifications to candidate
 * - Update analytics/dashboards
 */

export class QualificationVerified extends DomainEvent {
	constructor(
		public readonly applicationId: string,
		public readonly credentialType: string,
		public readonly namespace: string,
	) {
		super();
	}

	getEventName(): string {
		return 'QualificationVerified';
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
			credentialType: this.credentialType,
			namespace: this.namespace,
		};
	}
}
