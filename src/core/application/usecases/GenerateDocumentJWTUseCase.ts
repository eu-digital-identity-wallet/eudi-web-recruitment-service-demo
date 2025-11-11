import 'server-only';
import { Inject, Service } from 'typedi';

import { JWTService } from '@/core/domain/services/JWTService';
import { DocumentSigningService } from '@/core/domain/services/signing/ContractSigningService';

import type { IGenerateDocumentJWTUseCase } from '@/core/application/ports/inbound';

/**
 * Use Case: Generate Document JWT
 * Handles the generation of signed JWT for document retrieval
 *
 * This use case orchestrates:
 * 1. Preparation of document retrieval request payload via domain service
 * 2. Signing the JWT with x5c certificate
 * 3. Returns the signed JWT for wallet consumption
 *
 * Per EUDI spec:
 * - JWT must have typ: "JWT" in header
 * - JWT must be signed with ES256
 * - JWT must include x5c certificate chain
 */
@Service()
export class GenerateDocumentJWTUseCase implements IGenerateDocumentJWTUseCase {
	constructor(
		@Inject() private readonly documentSigningService: DocumentSigningService,
		@Inject() private readonly jwtService: JWTService,
	) {}

	public async execute(state: string): Promise<string> {
		// Prepare the document retrieval request payload
		const payload = await this.documentSigningService.prepareDocumentRetrievalRequest(state);

		// Sign the JWT with x5c certificate
		const signedJwt = await this.jwtService.sign(payload);

		return signedJwt;
	}
}
