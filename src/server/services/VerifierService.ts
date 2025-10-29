import { Inject, Service } from '@/server/container';
import { VerificationResponse, VpTokenRequest } from '@/server/types/eudi';
import { env } from 'env';

import { DataDecoderService } from './DataDecoderService';
import { CredentialVerificationService } from './verification/CredentialVerificationService';

import type { CredentialType } from '@/server/domain/types';

@Service()
export class VerifierService {
	constructor(
		@Inject() private readonly dataDecoderService: DataDecoderService,
		@Inject() private readonly credentialVerificationService: CredentialVerificationService,
	) {}

	public async initVerification(
		applicationId: string,
		sameDeviceFlow: boolean,
		credentialType: CredentialType[] = ['PID'],
	): Promise<{ requestUri: string; TransactionId: string }> {
		console.log('Init verification called with:', {
			applicationId,
			sameDeviceFlow,
			credentialType,
		});
		// Use the credential type directly - callers should pass the correct type
		const actualCredentialTypes: CredentialType[] = credentialType;

		const payload: VpTokenRequest = this.credentialVerificationService.prepareVerificationRequest({
			applicationId,
			credentialTypes: actualCredentialTypes,
			sameDeviceFlow,
		});
		console.log('Payload for verifier:', JSON.stringify(payload, null, 2));
		const verifierUrl = `${env.VERIFIER_API_URL}/ui/presentations`;
		console.log('Making request to verifier URL:', verifierUrl);

		try {
			const response = await fetch(verifierUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			console.log('Verifier response status:', response.status);
			if (!response.ok) {
				let errorDetails = 'No error details available';
				try {
					const errorBody = await response.text();
					errorDetails = errorBody;
					console.error('Verifier error response body:', errorBody);
				} catch (e) {
					console.error('Could not read error response body:', e);
				}
				throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
			}

			const data = await response.json();

			const clientId = encodeURIComponent(data.client_id);
			const requestURI = encodeURIComponent(data.request_uri);
			const TransactionId = encodeURIComponent(data.transaction_id);
			const requestUri = `eudi-openid4vp://?client_id=${clientId}&request_uri=${requestURI}`;

			return { requestUri, TransactionId };
		} catch (error) {
			console.error('Error in initVerification:', error);
			throw new Error('Failed to initialize verification process.');
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
			const de = this.dataDecoderService.decodeCborData(entry.value as Uint8Array);

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
		// Extract birth_date - it comes as CBOR tagged object {value: "1985-09-16", tag: 1004}
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

			//decode vp_token (first value of object)
			//console.log("Full verifier response data:", JSON.stringify(responseData, null, 2));
			//console.log("Response data vp_token:", responseData.vp_token);

			if (!responseData.vp_token || typeof responseData.vp_token !== 'object') {
				console.error('Invalid vp_token in response:', responseData.vp_token);
				return { status: false };
			}

			const vpTokenValues = Object.values(responseData.vp_token);
			if (vpTokenValues.length === 0) {
				console.error('No vp_token values found');
				return { status: false };
			}

			let vpTokenB64OrHex = vpTokenValues[0];
			//console.log("VP token value:", vpTokenB64OrHex, "type:", typeof vpTokenB64OrHex);

			// Handle case where vp_token value is an array
			if (Array.isArray(vpTokenB64OrHex)) {
				if (vpTokenB64OrHex.length === 0) {
					console.error('VP token array is empty:', vpTokenB64OrHex);
					return { status: false };
				}
				vpTokenB64OrHex = vpTokenB64OrHex[0];
				//console.log("Extracted VP token from array:", vpTokenB64OrHex, "type:", typeof vpTokenB64OrHex);
			}

			if (typeof vpTokenB64OrHex !== 'string') {
				console.error('VP token is not a string:', vpTokenB64OrHex);
				return { status: false };
			}

			const buffer = this.dataDecoderService.decodeBase64OrHex(vpTokenB64OrHex);
			const decoded = this.dataDecoderService.decodeCborData(new Uint8Array(buffer));

			//console.log("Decoded VP token:", JSON.stringify(decoded, null, 2));
			if (
				!decoded ||
				typeof decoded !== 'object' ||
				!(decoded as { documents?: unknown }).documents ||
				!Array.isArray((decoded as { documents: unknown[] }).documents) ||
				!(decoded as { documents: { issuerSigned?: { nameSpaces?: unknown } }[] }).documents[0]
					?.issuerSigned?.nameSpaces
			) {
				return { status: false };
			}
			console.log('VP token decoded');
			//Extract all namespaces
			const decodedData = decoded as {
				documents: { issuerSigned: { nameSpaces: Record<string, unknown> } }[];
			};
			const nameSpaces = decodedData.documents[0].issuerSigned.nameSpaces;

			// Extract credentials from all namespaces
			const verifiedCredentials: Record<string, Record<string, unknown>> = {};

			for (const [namespace, nsData] of Object.entries(nameSpaces)) {
				const claims = this.extractClaimsFromNamespace(nsData);
				if (Object.keys(claims).length > 0) {
					verifiedCredentials[namespace] = claims;
				}
			}

			// Process PID specifically for backward compatibility
			let personalInfo = null;
			const pidNamespace = 'eu.europa.ec.eudi.pid.1';
			if (verifiedCredentials[pidNamespace]) {
				personalInfo = this.processPidClaims(verifiedCredentials[pidNamespace]);
			}

			// Success criteria:
			// - If PID is present: must have family_name AND given_name
			// - If no PID (diploma/seafarer only): at least one credential with family_name
			let ok = false;
			if (personalInfo) {
				ok = !!(personalInfo.family_name && personalInfo.given_name);
			} else {
				// Check if any other namespace has at least family_name
				ok = Object.values(verifiedCredentials).some(
					(claims) => claims['family_name'] !== undefined && claims['family_name'] !== null,
				);
			}

			// Log success details only when verification succeeds
			if (ok) {
				console.log('checkVerification called with:', { TransactionId, responseCode });
				console.log('Fetching verification from URL:', url);
				console.log('Verification successful');
			}

			return {
				status: ok,
				personalInfo: personalInfo ?? undefined,
				verifiedCredentials,
			};
		} catch (error) {
			console.error('Error in checkVerification:', error);
			throw error;
		}
	}
}
