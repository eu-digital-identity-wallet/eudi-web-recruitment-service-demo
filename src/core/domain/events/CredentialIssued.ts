import { DomainEvent } from './DomainEvent';

/**
 * CredentialIssued Event
 *
 * Raised when an employee credential is successfully issued to the applicant's wallet.
 * Other parts of the system can listen to this event to:
 * - Send confirmation notifications
 * - Update application status
 * - Log audit trail
 * - Trigger workflow completion
 */

export class CredentialIssued extends DomainEvent {
	constructor(
		public readonly credentialId: string,
		public readonly applicationId: string,
		public readonly credentialType: string,
		public readonly recipientName: string,
	) {
		super();
	}

	getEventName(): string {
		return 'CredentialIssued';
	}

	getAggregateId(): string {
		return this.credentialId;
	}

	toJSON(): Record<string, unknown> {
		return {
			eventId: this.eventId,
			eventName: this.getEventName(),
			occurredAt: this.occurredAt.toISOString(),
			credentialId: this.credentialId,
			applicationId: this.applicationId,
			credentialType: this.credentialType,
			recipientName: this.recipientName,
		};
	}
}
