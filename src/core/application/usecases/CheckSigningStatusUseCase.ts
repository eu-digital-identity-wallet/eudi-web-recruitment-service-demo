import 'server-only';
import { Inject, Service } from 'typedi';

import { DocumentSigningService } from '@/core/domain/services/signing/ContractSigningService';

import type { ICheckSigningStatusUseCase } from '@/core/application/ports/inbound';

/**
 * Use Case: Check Signing Status
 * Handles polling for the signing status of an application's document
 *
 * This use case orchestrates:
 * 1. Retrieval of signing status via domain service
 * 2. Returns the current status (PENDING, SIGNED, FAILED, NOT_INITIATED)
 */
@Service()
export class CheckSigningStatusUseCase implements ICheckSigningStatusUseCase {
	constructor(@Inject() private readonly documentSigningService: DocumentSigningService) {}

	public async execute(applicationId: string): Promise<{
		status: string;
		signedAt?: Date | null;
		errorCode?: string | null;
	}> {
		const status = await this.documentSigningService.checkSigningStatus(applicationId);

		return status;
	}
}
