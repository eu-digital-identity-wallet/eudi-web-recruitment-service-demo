import { Service } from 'typedi';

import { TaxResidencyQueryService } from '@/core/domain/services/verification/queries/TaxResidencyQueryService';
import { CredentialType } from '@/core/domain/value-objects';
import { Inject } from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { VpTokenRequest } from '@/core/shared/types/types/eudi';
import { env } from '@env';

import { DiplomaQueryService } from './queries/DiplomaQueryService';
import { PidQueryService } from './queries/PidQueryService';
import { SeafarerQueryService } from './queries/SeafarerQueryService';

export interface CredentialVerificationOptions {
	applicationId: string;
	credentialTypes: CredentialType[];
	sameDeviceFlow: boolean;
}

/**
 * Service responsible for credential verification workflows
 * Orchestrates multiple credential query services to build complete DCQL verification requests
 * Domain: Credential Verification (matching DocumentRetrievalService pattern)
 */
@Service()
export class CredentialVerificationService {
	private readonly logger = createLogger('CredentialVerificationService');

	constructor(
		@Inject() private readonly pidQueryService: PidQueryService,
		@Inject() private readonly diplomaQueryService: DiplomaQueryService,
		@Inject() private readonly seafarerQueryService: SeafarerQueryService,
		@Inject() private readonly taxResidencyQueryService: TaxResidencyQueryService,
	) {}

	/**
	 * Build complete DCQL query based on credential requirements
	 * Orchestrates multiple query services to compose the final request
	 */
	private buildDcqlQuery(options: CredentialVerificationOptions): VpTokenRequest['dcql_query'] {
		const credentials: VpTokenRequest['dcql_query']['credentials'] = [];

		// Build credentials based on requirements
		options.credentialTypes.forEach((credentialType) => {
			credentials.push(this.buildCredentialQuery(credentialType, options.applicationId));
		});

		return { credentials };
	}

	private buildCredentialQuery(
		credentialType: CredentialType,
		applicationId: string,
	): VpTokenRequest['dcql_query']['credentials'][0] {
		const typeValue = credentialType.getValue();
		switch (typeValue) {
			case 'PID':
				return this.pidQueryService.buildQuery(applicationId);

			case 'DIPLOMA':
				return this.diplomaQueryService.buildQuery(applicationId);

			case 'SEAFARER':
				return this.seafarerQueryService.buildQuery(applicationId);

			case 'TAXRESIDENCY':
				return this.taxResidencyQueryService.buildQuery(applicationId);

			default:
				throw new Error(`Unsupported credential type: ${typeValue}`);
		}
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
			payload.wallet_response_redirect_uri_template = `${base}/applications/${options.applicationId}/callback?response_code={RESPONSE_CODE}`;
		}

		return payload;
	}

	/**
	 * Get human-readable description of credential requirements
	 */
	public getCredentialDescription(credentialTypes: CredentialType): string {
		const typeValue = credentialTypes.getValue();
		switch (typeValue) {
			case 'PID':
				return this.pidQueryService.getDescription();
			case 'DIPLOMA':
				return this.diplomaQueryService.getDescription();
			case 'SEAFARER':
				return this.seafarerQueryService.getDescription();
			case 'TAXRESIDENCY':
				return this.taxResidencyQueryService.getDescription();
			default:
				return 'Unknown credential requirements';
		}
	}
}
