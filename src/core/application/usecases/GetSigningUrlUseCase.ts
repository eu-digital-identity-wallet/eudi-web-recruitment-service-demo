import 'server-only';
import { Inject, Service } from 'typedi';

import { ISignedDocumentRepositoryToken } from '@/core/infrastructure/config/container';
import { env } from 'env';

import type { IGetSigningUrlUseCase } from '@/core/application/ports/inbound';
import type { ISignedDocumentRepository } from '@/core/application/ports/outbound/ISignedDocumentRepository';

/**
 * Use Case: Get Signing URL
 * Handles generation of signing URL for debugging/testing
 *
 * This use case orchestrates:
 * 1. Retrieval of the latest signed document for an application
 * 2. Construction of the signing URL per EUDI spec
 * 3. Returns the URL components for debugging
 */
@Service()
export class GetSigningUrlUseCase implements IGetSigningUrlUseCase {
	constructor(
		@Inject(ISignedDocumentRepositoryToken)
		private readonly signedDocumentRepo: ISignedDocumentRepository,
	) {}

	public async execute(applicationId: string): Promise<{
		signingUrl: string;
		components: {
			baseUrl: string;
			requestUri: string;
			clientId: string;
			state: string;
		};
		decoded: {
			fullUrl: string;
			queryParams: {
				request_uri: string;
				client_id: string;
			};
		};
	}> {
		// Get the most recent signed document for this application
		const signedDocument = await this.signedDocumentRepo.findLatestByApplicationId(applicationId);

		if (!signedDocument) {
			throw new Error('No pending document signing found');
		}

		// Construct the request_uri (wallet will access this to get the signed JWT)
		const requestUri = `${env.NEXT_PUBLIC_APP_URI}/api/request.jwt/${signedDocument.getState()}`;

		// Get client_id from the app URI hostname
		const clientId = new URL(env.NEXT_PUBLIC_APP_URI).hostname;

		// Construct the URL per EUDI spec
		const signingUrl = `${env.NEXT_PUBLIC_APP_URI}?request_uri=${encodeURIComponent(requestUri)}&client_id=${encodeURIComponent(clientId)}`;

		return {
			signingUrl,
			components: {
				baseUrl: env.NEXT_PUBLIC_APP_URI,
				requestUri,
				clientId,
				state: signedDocument.getState(),
			},
			decoded: {
				fullUrl: signingUrl,
				queryParams: {
					request_uri: requestUri,
					client_id: clientId,
				},
			},
		};
	}
}
