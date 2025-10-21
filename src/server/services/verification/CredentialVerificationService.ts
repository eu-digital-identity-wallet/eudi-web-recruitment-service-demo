import { Service } from 'typedi';

import { Inject } from '@/server/container';
import { VpTokenRequest } from '@/server/types/eudi';
import { env } from 'env';

import { DiplomaQueryService } from './queries/DiplomaQueryService';
import { PidQueryService } from './queries/PidQueryService';
import { SeafarerQueryService } from './queries/SeafarerQueryService';

import type { CredentialType } from '@/server/domain/types';

export interface CredentialVerificationOptions {
	applicationId: string;
	credentialTypes: CredentialType;
	sameDeviceFlow: boolean;
}

/**
 * Service responsible for credential verification workflows
 * Orchestrates multiple credential query services to build complete DCQL verification requests
 * Domain: Credential Verification (matching DocumentRetrievalService pattern)
 */
@Service()
export class CredentialVerificationService {
	constructor(
		@Inject() private readonly pidQueryService: PidQueryService,
		@Inject() private readonly diplomaQueryService: DiplomaQueryService,
		@Inject() private readonly seafarerQueryService: SeafarerQueryService,
	) {}

	/**
	 * Build complete DCQL query based on credential requirements
	 * Orchestrates multiple query services to compose the final request
	 */
	private buildDcqlQuery(options: CredentialVerificationOptions): VpTokenRequest['dcql_query'] {
		const credentials: VpTokenRequest['dcql_query']['credentials'] = [];

		// Build credentials based on requirements
		switch (options.credentialTypes) {
			case 'PID':
				credentials.push(this.pidQueryService.buildQuery(options.applicationId));
				break;

			case 'DIPLOMA':
				credentials.push(this.diplomaQueryService.buildQuery(options.applicationId));
				break;

			case 'SEAFARER':
				credentials.push(this.seafarerQueryService.buildQuery(options.applicationId));
				break;

			case 'BOTH':
				credentials.push(this.diplomaQueryService.buildQuery(options.applicationId));
				credentials.push(this.seafarerQueryService.buildQuery(options.applicationId));
				break;

			default:
				throw new Error(`Unsupported credential type: ${options.credentialTypes}`);
		}

		return { credentials };
	}

	/**
	 * Prepare verification request payload
	 * Includes DCQL query and optional redirect URI for same-device flow
	 */
	public prepareVerificationRequest(options: CredentialVerificationOptions): VpTokenRequest {
		const payload: VpTokenRequest = {
			type: 'vp_token',
			dcql_query: this.buildDcqlQuery(options),
			request_uri_method: 'get',
			nonce: crypto.randomUUID(),
		};

		// Add redirect URI for same-device flow
		if (options.sameDeviceFlow) {
			const base = env.NEXT_PUBLIC_APP_URI.replace(/\/+$/, '');

			// The EUDI verifier is rejecting the template with InvalidWalletResponseTemplate error
			console.log(
				'Would set redirect URI template:',
				`${base}/applications/${options.applicationId}/callback?response_code={response_code}`,
			);

			payload.wallet_response_redirect_uri_template = `${base}/applications/${options.applicationId}/callback?response_code={RESPONSE_CODE}`;
		}

		return payload;
	}

	/**
	 * Get human-readable description of credential requirements
	 */
	public getCredentialDescription(credentialTypes: CredentialType): string {
		switch (credentialTypes) {
			case 'PID':
				return this.pidQueryService.getDescription();
			case 'DIPLOMA':
				return this.diplomaQueryService.getDescription();
			case 'SEAFARER':
				return this.seafarerQueryService.getDescription();
			case 'BOTH':
				return 'Both diploma and seafarer certificates required';
			default:
				return 'Unknown credential requirements';
		}
	}
}
