import type { DomainEvent } from '@/core/domain/events';

/**
 * Port interface for Event Dispatching (Outbound Port)
 * Application layer defines the contract, infrastructure layer implements it
 * Implemented by: InMemoryEventDispatcher or other event bus implementations
 *
 * Enables publishing domain events to event handlers for:
 * - Sending notifications (emails, SMS)
 * - Updating analytics/metrics
 * - Triggering workflows
 * - Logging audit trails
 * - Integration with external systems
 */
export interface IEventDispatcher {
	/**
	 * Publish a single domain event to all registered handlers
	 */
	publish(event: DomainEvent): Promise<void>;

	/**
	 * Publish multiple domain events to all registered handlers
	 */
	publishAll(events: readonly DomainEvent[]): Promise<void>;

	/**
	 * Register an event handler for a specific event type
	 */
	subscribe(eventName: string, handler: EventHandler): void;
}

/**
 * Event handler function type
 */
export type EventHandler = (event: DomainEvent) => Promise<void> | void;
