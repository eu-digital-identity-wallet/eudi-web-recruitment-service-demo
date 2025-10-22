// src/server/services/IssuerService.ts
import 'server-only';
import { Application, JobPosting, Prisma } from '@prisma/client';

import { Inject, Service } from '@/server/container';
import { CredentialRepository } from '@/server/repositories/CredentialRepository';
import { env } from '@env';

import { EmployeeCredentialService } from './issuance/EmployeeCredentialService';
import { JWTService } from './JWTService';
import { KeystoreService } from './KeystoreService';

export type IssueReceiptResponse = { offerUrl: string; otp?: string };

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

@Service()
export class IssuerService {
	constructor(
		@Inject() private readonly jwtService: JWTService,
		@Inject() private readonly keystoreService: KeystoreService,
		@Inject() private readonly credentialRepo: CredentialRepository,
		@Inject() private readonly employeeCredentialService: EmployeeCredentialService,
	) {}

	public async issueApplicationReceipt(
		app: Application & { job: JobPosting },
	): Promise<IssueReceiptResponse> {
		// Build employee credential data using dedicated service
		const credentialData = this.employeeCredentialService.buildCredentialData(app);

		// Load keystore and keys
		const { privateKey, cert } = this.keystoreService.loadKeystore();
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
		console.log('Generated JWT for credential offer request.');
		//console.log("Signed JWT:", jwt);
		// Prepare the request body
		const requestBody = new URLSearchParams();
		requestBody.append('request', jwt);

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
					errorMessage = errorMatch[2]; // Use only the paragraph text
				}
			} catch (e) {
				console.error('Could not read error response:', e);
			}

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
			await this.credentialRepo.create({
				application: { connect: { id: app.id } },
				preAuthorizedCode,
				credentialOfferUrl: offerUrl,
				otp: otp ? String(otp) : null,
				credentialType: 'eu.europa.ec.eudi.employee_mdoc',
				credentialData: jwtPayload.credentials[0].data as Prisma.InputJsonValue,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			});
		}

		return { offerUrl, otp };
	}

	/**
	 * Get issued credential by application ID and type
	 */
	public async getCredentialByApplicationId(applicationId: string, credentialType: string) {
		return this.credentialRepo.findByApplicationIdAndType(applicationId, credentialType);
	}
}
