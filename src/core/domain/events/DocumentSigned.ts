import { DomainEvent } from './DomainEvent';

/**
 * DocumentSigned Event
 *
 * Raised when a document is successfully signed via EUDI Wallet.
 * Other parts of the system can listen to this event to:
 * - Archive signed documents
 * - Send notifications
 * - Trigger next workflow steps (e.g., credential issuance)
 * - Log audit trail
 */

export class DocumentSigned extends DomainEvent {
	constructor(
		public readonly documentId: string,
		public readonly applicationId: string,
		public readonly documentType: string,
		public readonly signatureQualifier: string,
	) {
		super();
	}

	getEventName(): string {
		return 'DocumentSigned';
	}

	getAggregateId(): string {
		return this.documentId;
	}

	toJSON(): Record<string, unknown> {
		return {
			eventId: this.eventId,
			eventName: this.getEventName(),
			occurredAt: this.occurredAt.toISOString(),
			documentId: this.documentId,
			applicationId: this.applicationId,
			documentType: this.documentType,
			signatureQualifier: this.signatureQualifier,
		};
	}
}
