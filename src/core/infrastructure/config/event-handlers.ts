import { Container } from 'typedi';

import { ApplicationVerifiedHandler } from '@/core/application/event-handlers/ApplicationVerifiedHandler';
import { CredentialIssuedHandler } from '@/core/application/event-handlers/CredentialIssuedHandler';
import { DocumentSignedHandler } from '@/core/application/event-handlers/DocumentSignedHandler';
import { QualificationVerifiedHandler } from '@/core/application/event-handlers/QualificationVerifiedHandler';
import { InMemoryEventDispatcher } from '@/core/infrastructure/adapters/events/InMemoryEventDispatcher';

/**
 * Event Handler Registration
 *
 * Registers all domain event handlers with the event dispatcher.
 * This should be called once during application startup.
 *
 * Pattern: Subscribe event handlers to specific event types
 */
export function registerEventHandlers(): void {
	const eventDispatcher = Container.get(InMemoryEventDispatcher);

	// Get event handler instances from DI container
	const applicationVerifiedHandler = Container.get(ApplicationVerifiedHandler);
	const qualificationVerifiedHandler = Container.get(QualificationVerifiedHandler);
	const documentSignedHandler = Container.get(DocumentSignedHandler);
	const credentialIssuedHandler = Container.get(CredentialIssuedHandler);

	// Subscribe handlers to their respective events
	eventDispatcher.subscribe('ApplicationVerified', (event) =>
		applicationVerifiedHandler.handle(event),
	);

	eventDispatcher.subscribe('QualificationVerified', (event) =>
		qualificationVerifiedHandler.handle(event),
	);

	eventDispatcher.subscribe('DocumentSigned', (event) => documentSignedHandler.handle(event));

	eventDispatcher.subscribe('CredentialIssued', (event) => credentialIssuedHandler.handle(event));
}
