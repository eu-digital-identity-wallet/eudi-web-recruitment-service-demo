import { IVerifierPort, InitVerificationResult } from '@/core/application/ports/outbound';
import { CredentialDecoderService } from '@/core/domain/services/CredentialDecoderService';
import { CredentialVerificationService } from '@/core/domain/services/verification/CredentialVerificationService';
import { CredentialType } from '@/core/domain/value-objects';
import { Inject, Service } from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { VerificationResponse, VpTokenRequest } from '@/core/shared/types/types/eudi';
import { env } from 'env';

/**
 * HTTP adapter for EUDI Verifier API
 * Implements IVerifierPort by communicating with external verifier service
 */
@Service()
export class EudiVerifierAdapter implements IVerifierPort {
	private readonly logger = createLogger('EudiVerifierAdapter');

	constructor(
		@Inject() private readonly credentialDecoderService: CredentialDecoderService,
		@Inject() private readonly credentialVerificationService: CredentialVerificationService,
	) {}

	public async initVerification(
		applicationId: string,
		sameDeviceFlow: boolean,
		credentialType: CredentialType[] = [CredentialType.PID],
	): Promise<InitVerificationResult> {
		this.logger.info('Init verification called', {
			applicationId,
			sameDeviceFlow,
			credentialType,
		});

		const payload: VpTokenRequest = this.credentialVerificationService.prepareVerificationRequest({
			applicationId,
			credentialTypes: credentialType,
			sameDeviceFlow,
		});

		this.logger.info('Payload for verifier', { payload: JSON.stringify(payload, null, 2) });
		console.log('=== REDIRECT URI TEMPLATE DEBUG ===');
		console.log('Template:', payload.wallet_response_redirect_uri_template);
		console.log('Same device:', sameDeviceFlow);
		console.log('Full payload:', JSON.stringify(payload, null, 2));
		console.log('===================================');
		const verifierUrl = `${env.VERIFIER_API_URL}/ui/presentations`;
		this.logger.info('Making request to verifier URL', { verifierUrl });

		try {
			const response = await fetch(verifierUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			this.logger.info('Verifier response status', { status: response.status });

			if (!response.ok) {
				let errorDetails = 'No error details available';
				try {
					const errorBody = await response.text();
					errorDetails = errorBody;
					this.logger.error('Verifier error response body', undefined, { errorBody });
				} catch (e) {
					this.logger.error('Could not read error response body', e as Error);
				}
				throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
			}

			const data = await response.json();

			// Don't encode - the verifier backend returns the values ready to use
			const requestUri = `eudi-openid4vp://?client_id=${data.client_id}&request_uri=${data.request_uri}`;
			const TransactionId = data.transaction_id;

			return { requestUri, TransactionId };
		} catch (error) {
			this.logger.error('Error in initVerification', error as Error);
			throw new Error('Failed to initialize verification process.');
		}
	}

	public async checkVerification(
		TransactionId: string,
		responseCode?: string,
	): Promise<VerificationResponse> {
		if (!TransactionId) {
			throw new Error('Transaction ID is undefined.');
		}

		try {
			let url = `${env.VERIFIER_API_URL}/ui/presentations/${TransactionId}`;
			if (responseCode) {
				url += `?response_code=${responseCode}`;
			}

			const response = await fetch(url, {
				method: 'GET',
				headers: { Accept: 'application/json' },
			});

			if (!response.ok) {
				return { status: false };
			}

			const responseData = await response.json();

			if (!responseData.vp_token || typeof responseData.vp_token !== 'object') {
				this.logger.error('Invalid vp_token in response', undefined, {
					vp_token: responseData.vp_token,
				});
				return { status: false };
			}

			const vpTokenValues = Object.values(responseData.vp_token);
			this.logger.info('VP token values count', { count: vpTokenValues.length });
			if (vpTokenValues.length === 0) {
				this.logger.error('No vp_token values found');
				return { status: false };
			}

			// Extract credentials from all VP tokens (not just the first one)
			const verifiedCredentials: Record<string, Record<string, unknown>> = {};

			for (let i = 0; i < vpTokenValues.length; i++) {
				this.logger.info('Processing VP token', { index: i + 1, total: vpTokenValues.length });

				let vpTokenB64OrHex = vpTokenValues[i];

				// Handle case where vp_token value is an array
				if (Array.isArray(vpTokenB64OrHex)) {
					if (vpTokenB64OrHex.length === 0) {
						this.logger.error('VP token array is empty', undefined, { vpToken: vpTokenB64OrHex });
						continue;
					}
					vpTokenB64OrHex = vpTokenB64OrHex[0];
				}

				if (typeof vpTokenB64OrHex !== 'string') {
					this.logger.error('VP token is not a string', undefined, { vpToken: vpTokenB64OrHex });
					continue;
				}

				try {
					// Detect format: SD-JWT-VC starts with "eyJ" (base64url encoded JWT header)
					const isSDJWT = vpTokenB64OrHex.startsWith('eyJ');

					if (isSDJWT) {
						this.logger.info('VP token is SD-JWT-VC format', { index: i + 1 });

						// Parse SD-JWT-VC format (Diploma, Seafarer, Tax Residency)
						const sdJwtClaims = this.parseSDJWT(vpTokenB64OrHex);

						if (sdJwtClaims && Object.keys(sdJwtClaims).length > 0) {
							// Use vct (verifiable credential type) as namespace identifier
							const namespace = (sdJwtClaims.vct as string) || 'unknown';
							this.logger.info('SD-JWT namespace', { namespace });
							this.logger.info('SD-JWT claims', { claims: Object.keys(sdJwtClaims) });

							verifiedCredentials[namespace] = sdJwtClaims;
						} else {
							this.logger.warn('VP token SD-JWT parsing failed', { index: i + 1 });
						}
					} else {
						this.logger.info('VP token is CBOR/mdoc format', { index: i + 1 });

						// Parse CBOR/mdoc format (PID only)
						const buffer = this.credentialDecoderService.decodeBase64OrHex(vpTokenB64OrHex);
						const decoded = this.credentialDecoderService.decodeCborData(new Uint8Array(buffer));

						if (
							!decoded ||
							typeof decoded !== 'object' ||
							!(decoded as { documents?: unknown }).documents ||
							!Array.isArray((decoded as { documents: unknown[] }).documents) ||
							!(decoded as { documents: { issuerSigned?: { nameSpaces?: unknown } }[] })
								.documents[0]?.issuerSigned?.nameSpaces
						) {
							this.logger.warn('VP token has invalid CBOR structure, skipping', { index: i + 1 });
							continue;
						}

						this.logger.info('VP token CBOR decoded successfully', { index: i + 1 });

						// Extract all namespaces from this VP token
						const decodedData = decoded as {
							documents: { issuerSigned: { nameSpaces: Record<string, unknown> } }[];
						};
						const nameSpaces = decodedData.documents[0].issuerSigned.nameSpaces;

						this.logger.info('Namespaces in VP token', {
							index: i + 1,
							namespaces: Object.keys(nameSpaces),
						});

						// Extract credentials from all namespaces in this VP token
						for (const [namespace, nsData] of Object.entries(nameSpaces)) {
							this.logger.info('Processing namespace', { namespace });
							const claims = this.extractClaimsFromNamespace(nsData);
							this.logger.info('Claims extracted', {
								namespace,
								claims: Object.keys(claims),
							});
							if (Object.keys(claims).length > 0) {
								verifiedCredentials[namespace] = claims;
							}
						}
					}
				} catch (error) {
					this.logger.error('Error decoding VP token', error as Error, { index: i + 1 });
					continue;
				}
			}

			// Process PID specifically for backward compatibility
			let personalInfo = null;
			const pidNamespace = 'eu.europa.ec.eudi.pid.1';
			if (verifiedCredentials[pidNamespace]) {
				personalInfo = this.processPidClaims(verifiedCredentials[pidNamespace]);
			}

			// Success criteria
			let ok = false;
			if (personalInfo) {
				ok = !!(personalInfo.family_name && personalInfo.given_name);
			} else {
				// For qualifications (DIPLOMA, SEAFARER, TAXRESIDENCY), just check if we have any verified credentials
				ok = Object.keys(verifiedCredentials).length > 0;
			}

			if (ok) {
				this.logger.info('checkVerification called', { TransactionId, responseCode });
				this.logger.info('Fetching verification from URL', { url });
				this.logger.info('Verification successful');
				this.logger.info('All verified credentials', {
					credentials: Object.keys(verifiedCredentials),
				});
			}

			return {
				status: ok,
				personalInfo: personalInfo ?? undefined,
				verifiedCredentials,
			};
		} catch (error) {
			this.logger.error('Error in checkVerification', error as Error);
			throw error;
		}
	}

	/**
	 * Extract claims from a namespace
	 */
	private extractClaimsFromNamespace(ns: unknown): Record<string, unknown> {
		if (!Array.isArray(ns)) return {};

		const claims: Record<string, unknown> = {};
		for (const entry of ns) {
			if (!entry?.value) continue;
			const de = this.credentialDecoderService.decodeCborData(entry.value as Uint8Array);

			if (
				!de ||
				typeof de !== 'object' ||
				!(de as { elementIdentifier?: string }).elementIdentifier
			)
				continue;

			const deData = de as { elementIdentifier: string; elementValue: unknown };
			claims[deData.elementIdentifier] = deData.elementValue;
		}
		return claims;
	}

	/**
	 * Process PID claims into personalInfo format
	 */
	private processPidClaims(claims: Record<string, unknown>) {
		// Extract birth_date
		let birthDate: string | null = null;
		const birthDateClaim = claims['birth_date'];
		if (typeof birthDateClaim === 'string') {
			birthDate = birthDateClaim;
		} else if (
			typeof birthDateClaim === 'object' &&
			birthDateClaim !== null &&
			'value' in birthDateClaim
		) {
			birthDate = (birthDateClaim as { value: string }).value;
		}

		return {
			family_name: (claims['family_name'] as string) ?? null,
			given_name: (claims['given_name'] as string) ?? null,
			birth_date: birthDate,
			nationality: Array.isArray(claims['nationality'])
				? (claims['nationality']
						.map((n: unknown) => {
							if (typeof n === 'string') return n;
							if (typeof n === 'object' && n !== null && 'country_code' in n) {
								return (n as { country_code?: string }).country_code;
							}
							return undefined;
						})
						.filter(Boolean)
						.join(',') ?? null)
				: ((claims['nationality'] as string) ?? null),
			email_address: (claims['email_address'] as string | null) ?? null,
			mobile_phone_number: (claims['mobile_phone_number'] as string) ?? null,
		};
	}

	/**
	 * Parse SD-JWT-VC format (used for Diploma, Seafarer, and Tax Residency credentials)
	 */
	private parseSDJWT(sdJwtString: string): Record<string, unknown> | null {
		try {
			// SD-JWT format: <Issuer-signed JWT>~<Disclosure 1>~<Disclosure 2>~...~<optional KB-JWT>
			const parts = sdJwtString.split('~');
			const jwtPart = parts[0];

			// Decode JWT (base64url decode the payload)
			const jwtParts = jwtPart.split('.');
			if (jwtParts.length < 2) {
				this.logger.error('Invalid JWT format');
				return null;
			}

			// Decode the payload (second part)
			const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64url').toString('utf-8'));

			this.logger.info('JWT payload', { payload });

			// Extract disclosed claims from disclosures
			const disclosedClaims: Record<string, unknown> = {};

			// Process each disclosure
			for (let i = 1; i < parts.length - 1; i++) {
				const disclosure = parts[i];
				if (!disclosure) continue;

				try {
					// Each disclosure is base64url encoded JSON array: [salt, claim_name, claim_value]
					const decoded = JSON.parse(Buffer.from(disclosure, 'base64url').toString('utf-8'));
					if (Array.isArray(decoded) && decoded.length >= 3) {
						const [, claimName, claimValue] = decoded;
						disclosedClaims[claimName] = claimValue;
					}
				} catch (e) {
					this.logger.error('Error decoding disclosure', e as Error, { index: i });
				}
			}

			this.logger.info('Disclosed claims', { disclosedClaims });

			// Merge payload and disclosed claims
			return {
				...payload,
				...disclosedClaims,
			};
		} catch (error) {
			this.logger.error('Error parsing SD-JWT', error as Error);
			return null;
		}
	}
}
