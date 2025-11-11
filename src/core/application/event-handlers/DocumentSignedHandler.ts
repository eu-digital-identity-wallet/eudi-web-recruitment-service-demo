import { Service } from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { DocumentSigned, DomainEvent } from '@/core/domain/events';

/**
 * Document Signed Event Handler
 *
 * Handles the DocumentSigned domain event.
 * Triggered when a candidate successfully signs a document with QES (Qualified Electronic Signature).
 *
 * Responsibilities:
 * - Log signing event for audit trail and compliance
 * - Send confirmation notification (future: email/SMS)
 * - Update analytics/metrics (future)
 * - Trigger workflow progression (future: move to credential issuance)
 */
@Service()
export class DocumentSignedHandler {
	private readonly logger = createLogger('DocumentSignedHandler');

	async handle(event: DomainEvent): Promise<void> {
		const signedEvent = event as DocumentSigned;

		this.logger.info('Document signed event received', {
			eventId: signedEvent.eventId,
			documentId: signedEvent.documentId,
			applicationId: signedEvent.applicationId,
			documentType: signedEvent.documentType,
			signatureQualifier: signedEvent.signatureQualifier,
			occurredAt: signedEvent.occurredAt,
		});

		// TODO: Implement notification service
		// await this.notificationService.sendDocumentSignedConfirmation({
		//   applicationId: signedEvent.applicationId,
		//   documentType: signedEvent.documentType,
		// });

		// TODO: Implement analytics tracking
		// await this.analyticsService.trackDocumentSigning({
		//   applicationId: signedEvent.applicationId,
		//   documentType: signedEvent.documentType,
		//   signatureQualifier: signedEvent.signatureQualifier,
		//   signedAt: signedEvent.occurredAt,
		// });

		// TODO: Trigger next workflow stage
		// if (signedEvent.documentType === 'CONTRACT') {
		//   await this.workflowService.initiateCredentialIssuance(signedEvent.applicationId);
		// }
	}
}
