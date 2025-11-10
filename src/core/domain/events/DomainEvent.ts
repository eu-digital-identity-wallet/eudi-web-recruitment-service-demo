/**
 * DomainEvent - Base class for all domain events
 *
 * Domain events represent something significant that happened in the domain.
 * They are immutable facts about the past that other parts of the system can react to.
 *
 * Benefits:
 * - Loose coupling between aggregates
 * - Audit trail of what happened
 * - Enables event sourcing patterns
 * - Better observability
 * - Easier integration with external systems
 *
 * Examples:
 * - ApplicationVerified
 * - DocumentSigned
 * - CredentialIssued
 */

export abstract class DomainEvent {
	public readonly occurredAt: Date;
	public readonly eventId: string;

	constructor() {
		this.occurredAt = new Date();
		this.eventId = crypto.randomUUID();
	}

	/**
	 * Get the event name (used for routing/logging)
	 */
	abstract getEventName(): string;

	/**
	 * Get the aggregate ID this event relates to
	 */
	abstract getAggregateId(): string;

	/**
	 * Convert event to plain object for serialization
	 */
	abstract toJSON(): Record<string, unknown>;
}
