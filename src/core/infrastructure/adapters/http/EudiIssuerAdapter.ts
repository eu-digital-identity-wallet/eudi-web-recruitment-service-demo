import 'server-only';
import { Application, Vacancy } from '@prisma/client';

import { IssuedCredential } from '@/core/domain/model/IssuedCredential';
import { EmployeeCredentialService } from '@/core/domain/services/issuance/EmployeeCredentialService';
import { JWTService } from '@/core/domain/services/JWTService';
import { CredentialType } from '@/core/domain/value-objects';
import {
	ICredentialRepositoryToken,
	IKeystorePortToken,
	Inject,
	Service,
} from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { generateId } from '@/core/shared/utils/id-generator';
import { env } from '@env';

import type { IIssuerPort, IssueEmployeeIdResponse } from '@/core/application/ports/outbound';
import type { IKeystorePort } from '@/core/application/ports/outbound';
import type { IEventDispatcher } from '@/core/application/ports/outbound/IEventDispatcher';
import type { IIssuedCredentialRepository } from '@/core/application/ports/outbound/IIssuedCredentialRepository';

interface JWTPayload {
	iss: string;
	aud: string;
	grants: string[];
	credentials: Array<{
		credential_configuration_id: string;
		data: Record<string, unknown>;
	}>;
	iat: number;
	exp: number;
	[key: string]: unknown;
}

/**
 * HTTP adapter for EUDI Issuer API
 * Implements IIssuerPort by communicating with external issuer service
 */
@Service()
export class EudiIssuerAdapter implements IIssuerPort {
	private readonly logger = createLogger('EudiIssuerAdapter');

	constructor(
		@Inject() private readonly jwtService: JWTService,
		@Inject(IKeystorePortToken) private readonly keystorePort: IKeystorePort,
		@Inject(ICredentialRepositoryToken)
		private readonly credentialRepo: IIssuedCredentialRepository,
		@Inject() private readonly employeeCredentialService: EmployeeCredentialService,
		@Inject('IEventDispatcher') private readonly eventDispatcher: IEventDispatcher,
	) {}

	public async issueEmployeeId(
		app: Application & { vacancy: Vacancy },
	): Promise<IssueEmployeeIdResponse> {
		// Check for existing non-claimed EMPLOYEE credentials and expire them immediately
		// This ensures only the latest credential offer is valid (audit trail preserved)
		const existingCredentials = await this.credentialRepo.findByApplicationId(app.id);
		const nonClaimedEmployeeCredentials = existingCredentials.filter(
			(cred) =>
				cred.getCredentialType() === CredentialType.EMPLOYEE.getValue() && !cred.isClaimed(),
		);

		if (nonClaimedEmployeeCredentials.length > 0) {
			this.logger.info('Expiring old non-claimed EMPLOYEE credentials before issuing new one', {
				count: nonClaimedEmployeeCredentials.length,
				applicationId: app.id,
			});

			for (const cred of nonClaimedEmployeeCredentials) {
				// Expire immediately by setting expiresAt to now
				await this.credentialRepo.update(cred.getId(), {
					expiresAt: new Date(),
				});
			}
		}

		// Build employee credential data using dedicated service
		const credentialData = this.employeeCredentialService.buildCredentialData(app);

		// Load keystore and keys via port
		const { privateKey, cert } = this.keystorePort.loadKeystore();
		if (!privateKey || !cert) {
			throw new Error('Keystore or keys not configured');
		}

		// Prepare the JWT payload
		const jwtPayload: JWTPayload = {
			iss: env.NEXT_PUBLIC_APP_URI,
			aud: env.ISSUER_API_URL,
			grants: ['urn:ietf:params:oauth:grant-type:pre-authorized_code'],
			credentials: [
				{
					credential_configuration_id:
						this.employeeCredentialService.getCredentialConfigurationId(),
					data: credentialData,
				},
			],
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
		};

		// Sign the JWT
		const jwt = await this.jwtService.sign(jwtPayload);
		this.logger.info('Generated JWT for credential offer request', {
			credentialConfigurationId: this.employeeCredentialService.getCredentialConfigurationId(),
			applicationId: app.id,
		});

		// Prepare the request body
		const requestBody = new URLSearchParams();
		requestBody.append('request', jwt);

		this.logger.info('Sending credential offer request to issuer', {
			url: `${env.ISSUER_API_URL}/credentialOfferReq2`,
			credentialType: this.employeeCredentialService.getCredentialConfigurationId(),
		});

		const response = await fetch(`${env.ISSUER_API_URL}/credentialOfferReq2`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: requestBody.toString(),
		});

		if (!response.ok) {
			let errorDetails = 'No error details available';
			let errorMessage = `Issuer API error: ${response.status} ${response.statusText}`;

			try {
				errorDetails = await response.text();
				// Try to extract error message from HTML response
				const errorMatch = errorDetails.match(/<h1>(.*?)<\/h1>[\s\S]*?<p>\s*(.*?)\s*<\/p>/);
				if (errorMatch) {
					errorMessage = errorMatch[2];
				}
			} catch (e) {
				this.logger.error('Could not read error response', e as Error);
			}

			this.logger.error('Issuer API returned error', undefined, {
				status: response.status,
				statusText: response.statusText,
				errorMessage,
				errorDetails: errorDetails.substring(0, 500), // Log first 500 chars
				credentialType: this.employeeCredentialService.getCredentialConfigurationId(),
				applicationId: app.id,
			});

			throw new Error(errorMessage);
		}

		const responseData = await response.json();

		// Extract OTP from response
		const otp =
			responseData.grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code']?.tx_code?.value;

		// Store the pre-authorized code in database
		const preAuthorizedCode =
			responseData.grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code']?.[
				'pre-authorized_code'
			];

		// Remove sensitive OTP value from the credential offer before encoding
		const responseCopy = { ...responseData };
		if (
			responseCopy.grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code']?.tx_code?.value
		) {
			delete responseCopy.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'].tx_code
				.value;
		}

		const offerParam = encodeURIComponent(JSON.stringify(responseCopy));
		const offerUrl = `openid-credential-offer://?credential_offer=${offerParam}`;

		if (preAuthorizedCode) {
			//Create IssuedCredential domain entity (this raises CredentialIssued event)
			const credential = IssuedCredential.create({
				id: generateId(),
				applicationId: app.id,
				preAuthorizedCode,
				credentialOfferUrl: offerUrl,
				otp: otp ? String(otp) : null,
				credentialType: CredentialType.EMPLOYEE.getValue(),
				credentialData: jwtPayload.credentials[0].data as Record<string, unknown>,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			});

			//Persist domain entity through repository
			await this.credentialRepo.save(credential);

			// Publish domain events
			const events = credential.getDomainEvents();
			if (events.length > 0) {
				await this.eventDispatcher.publishAll(events);
				credential.clearDomainEvents();
			}
		}

		return { offerUrl, otp };
	}

	public async getCredentialByApplicationId(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredential | null> {
		// Repository now returns domain entity, no need for transformation
		return this.credentialRepo.findByApplicationIdAndType(applicationId, credentialType);
	}
}
