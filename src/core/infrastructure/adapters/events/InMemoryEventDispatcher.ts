import { Service } from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { IEventDispatcher, EventHandler } from '@/core/application/ports/outbound';
import type { DomainEvent } from '@/core/domain/events';

/**
 * In-Memory Event Dispatcher Adapter
 * Implements IEventDispatcher port using an in-memory event bus
 *
 * This is a simple synchronous implementation suitable for:
 * - Development and testing
 * - Single-instance deployments
 * - Non-critical event handling
 *
 * For production systems with multiple instances, consider:
 * - Redis Pub/Sub adapter
 * - RabbitMQ/Kafka adapter
 * - AWS EventBridge adapter
 */
@Service()
export class InMemoryEventDispatcher implements IEventDispatcher {
	private readonly logger = createLogger('InMemoryEventDispatcher');
	private readonly handlers: Map<string, EventHandler[]> = new Map();

	/**
	 * Publish a single domain event
	 */
	async publish(event: DomainEvent): Promise<void> {
		const eventName = event.getEventName();
		const handlers = this.handlers.get(eventName) || [];

		this.logger.info(`Publishing event: ${eventName}`, {
			eventId: event.eventId,
			aggregateId: event.getAggregateId(),
			handlerCount: handlers.length,
		});

		// Execute all handlers for this event type
		for (const handler of handlers) {
			try {
				await handler(event);
			} catch (error) {
				// Log error but don't stop other handlers from executing
				this.logger.error(`Error in event handler for ${eventName}`, error as Error, {
					eventId: event.eventId,
					aggregateId: event.getAggregateId(),
				});
			}
		}
	}

	/**
	 * Publish multiple domain events
	 */
	async publishAll(events: readonly DomainEvent[]): Promise<void> {
		this.logger.info(`Publishing ${events.length} domain events`);

		for (const event of events) {
			await this.publish(event);
		}
	}

	/**
	 * Register an event handler
	 */
	subscribe(eventName: string, handler: EventHandler): void {
		const handlers = this.handlers.get(eventName) || [];
		handlers.push(handler);
		this.handlers.set(eventName, handlers);

		this.logger.info(`Subscribed handler to ${eventName}`, {
			handlerCount: handlers.length,
		});
	}
}
