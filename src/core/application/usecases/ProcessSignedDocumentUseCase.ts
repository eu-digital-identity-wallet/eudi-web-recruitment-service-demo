import 'server-only';
import { Inject, Service } from 'typedi';

import { DocumentSigningService } from '@/core/domain/services/signing/ContractSigningService';

import type { IProcessSignedDocumentUseCase } from '@/core/application/ports/inbound';

/**
 * Use Case: Process Signed Document
 * Handles the callback from the wallet with the signed document
 *
 * This use case orchestrates:
 * 1. Validation of the state parameter
 * 2. Processing the signed document via domain service
 * 3. Storing the result in the database
 */
@Service()
export class ProcessSignedDocumentUseCase implements IProcessSignedDocumentUseCase {
	constructor(@Inject() private readonly documentSigningService: DocumentSigningService) {}

	public async execute(params: {
		state: string;
		stateParam?: string;
		documentWithSignature?: string[];
		signatureObject?: string[];
		vpToken?: string;
		error?: string;
	}): Promise<{ success: boolean; message?: string; error?: string }> {
		// Validate state matches
		if (params.stateParam && params.stateParam !== params.state) {
			return {
				success: false,
				error: 'State parameter mismatch',
			};
		}

		// Process the signed document using domain service
		const result = await this.documentSigningService.processSignedDocument(params.state, {
			documentWithSignature: params.documentWithSignature,
			signatureObject: params.signatureObject,
			vpToken: params.vpToken,
			error: params.error,
		});

		if (!result.success) {
			return {
				success: false,
				error: result.error || 'Failed to process signed document',
			};
		}

		return {
			success: true,
			message: 'Document signed successfully',
		};
	}
}
