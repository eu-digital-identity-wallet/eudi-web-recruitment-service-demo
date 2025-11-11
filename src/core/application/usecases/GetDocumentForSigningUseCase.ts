import 'server-only';
import { Inject, Service } from 'typedi';

import { DocumentSigningService } from '@/core/domain/services/signing/ContractSigningService';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type { IGetDocumentForSigningUseCase } from '@/core/application/ports/inbound';

/**
 * Use Case: Get Document For Signing
 * Handles retrieval of document content for wallet to sign
 *
 * This use case orchestrates:
 * 1. Retrieval of document content via domain service
 * 2. Returns the PDF/document bytes for wallet consumption
 *
 * Per EUDI spec:
 * - method.type is "public" so no authentication required
 * - Returns document bytes that match the hash in documentDigests
 */
@Service()
export class GetDocumentForSigningUseCase implements IGetDocumentForSigningUseCase {
	private readonly logger = createLogger('GetDocumentForSigningUseCase');

	constructor(@Inject() private readonly documentSigningService: DocumentSigningService) {}

	public async execute(state: string): Promise<Buffer | null> {
		// Get document content
		const documentContent = await this.documentSigningService.getDocumentForSigning(state);

		if (!documentContent) {
			return null;
		}

		// Validate buffer
		if (!Buffer.isBuffer(documentContent) || documentContent.length === 0) {
			this.logger.error(
				'Invalid document content',
				new Error('Document buffer is invalid or empty'),
			);
			return null;
		}

		return documentContent;
	}
}
