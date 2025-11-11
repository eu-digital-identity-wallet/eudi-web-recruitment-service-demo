import 'server-only';
import { Service } from 'typedi';

import { CredentialType } from '@/core/domain/value-objects';
import { createLogger } from '@/core/infrastructure/logging/Logger';

import type {
	IVerifierPort,
	InitVerificationResult,
} from '@/core/application/ports/outbound/IVerifierPort';
import type { VerificationResponse } from '@/core/shared/types/types/eudi';

/**
 * Mock implementation of IVerifierPort
 * Returns fake verification data for testing and development
 *
 * To use this mock:
 * 1. Update container.ts: Container.set({ id: IVerifierPortToken, type: MockVerifierAdapter })
 * 2. All use cases will now use mock data instead of real EUDI API
 */
@Service()
export class MockVerifierAdapter implements IVerifierPort {
	private readonly logger = createLogger('MockVerifierAdapter');
	private verifications = new Map<
		string,
		{ applicationId: string; credentialTypes: CredentialType[] }
	>();

	/**
	 * Mock: Initialize verification request
	 * Returns fake deep link and transaction ID
	 */
	async initVerification(
		applicationId: string,
		sameDeviceFlow: boolean,
		credentialType: CredentialType[],
	): Promise<InitVerificationResult> {
		const transactionId = `mock-txn-${Date.now()}-${Math.random().toString(36).substring(7)}`;

		// Store verification data for later retrieval
		this.verifications.set(transactionId, { applicationId, credentialTypes: credentialType });

		const flow = sameDeviceFlow ? 'same-device' : 'cross-device';
		const requestUri = `mock-eudi-openid4vp://verify?transaction_id=${transactionId}&flow=${flow}&credentials=${credentialType.join(',')}`;

		this.logger.info('Initialized verification', {
			applicationId,
			transactionId,
			credentialType,
			flow,
		});

		return {
			requestUri,
			TransactionId: transactionId,
		};
	}

	/**
	 * Mock: Check verification status
	 * Returns fake verified personal information
	 * @param transactionId - Transaction ID from initVerification
	 * @param _responseCode - Not used in mock (required by interface for same-device flow)
	 */
	async checkVerification(
		transactionId: string,
		_responseCode?: string,
	): Promise<VerificationResponse> {
		const verification = this.verifications.get(transactionId);

		if (!verification) {
			this.logger.warn('Unknown transaction ID', { transactionId });
			return { status: false };
		}

		this.logger.info('Checking verification for transaction', { transactionId });

		// Generate mock verified credentials based on requested types
		// Matches the structure returned by real EudiVerifierAdapter
		const verifiedCredentials: Record<string, Record<string, unknown>> = {};

		for (const credType of verification.credentialTypes) {
			const mockData = this.getMockCredentialData(credType);
			if (mockData) {
				verifiedCredentials[mockData.namespace] = mockData.claims;
			}
		}

		// Process PID specifically for backward compatibility (matches EudiVerifierAdapter)
		let personalInfo = null;
		const pidNamespace = 'eu.europa.ec.eudi.pid.1';
		if (verifiedCredentials[pidNamespace]) {
			const pidClaims = verifiedCredentials[pidNamespace];
			personalInfo = {
				family_name: (pidClaims.family_name as string) ?? null,
				given_name: (pidClaims.given_name as string) ?? null,
				birth_date: (pidClaims.birth_date as string) ?? null,
				nationality: (pidClaims.nationality as string) ?? null,
				email_address: (pidClaims.email_address as string | null) ?? null,
				mobile_phone_number: (pidClaims.mobile_phone_number as string) ?? null,
			};
		}

		// Success criteria (matches EudiVerifierAdapter)
		let ok = false;
		if (personalInfo) {
			ok = !!(personalInfo.family_name && personalInfo.given_name);
		} else {
			// For qualifications (DIPLOMA, SEAFARER, TAXRESIDENCY), just check if we have any verified credentials
			ok = Object.keys(verifiedCredentials).length > 0;
		}

		this.logger.info('Verification successful', {
			applicationId: verification.applicationId,
			credentialTypes: verification.credentialTypes,
			verifiedCount: Object.keys(verifiedCredentials).length,
			namespaces: Object.keys(verifiedCredentials),
		});

		return {
			status: ok,
			personalInfo: personalInfo ?? undefined,
			verifiedCredentials,
		};
	}

	/**
	 * Get mock credential data for a given credential type
	 * Returns namespace and claims that match real EUDI credential structure
	 */
	private getMockCredentialData(
		credType: CredentialType,
	): { namespace: string; claims: Record<string, unknown> } | null {
		// Mock credential data mapping - dynamically returns appropriate structure
		const mockCredentials: Record<string, { namespace: string; claims: Record<string, unknown> }> =
			{
				PID: {
					// PID claims match processPidClaims() output from EudiVerifierAdapter
					namespace: 'eu.europa.ec.eudi.pid.1',
					claims: {
						family_name: 'MockLastName',
						given_name: 'MockFirstName',
						birth_date: '1990-01-01',
						nationality: 'GR',
						email_address: 'mock.user@example.com',
						mobile_phone_number: '+30 1234567890',
					},
				},
				DIPLOMA: {
					// Diploma credentials use SD-JWT format (vct-based namespace)
					// Matches DiplomaQueryService.ts line 22 and RequestAdditionalCredentialsUseCase.ts line 73
					namespace: 'urn:eu.europa.ec.eudi:diploma:1:1',
					claims: {
						vct: 'urn:eu.europa.ec.eudi:diploma:1:1',
						degree: 'Bachelor of Science',
						field_of_study: 'Computer Science',
						institution: 'Mock University',
						graduation_date: '2012-06-15',
						student_id: 'MOCK-STU-98765',
					},
				},
				SEAFARER: {
					// Seafarer Identity Document (SID) - SD-JWT format
					// Matches RequestAdditionalCredentialsUseCase.ts line 80
					namespace: 'eu.europa.ec.eudi.seafarer.1',
					claims: {
						vct: 'eu.europa.ec.eudi.seafarer.1',
						given_name: 'MockFirstName',
						family_name: 'MockLastName',
						birth_date: '1990-01-01',
						certificate_number: 'MOCK-SF-12345',
						certificate_type: 'Seafarer Identity Document',
						rank: 'Chief Engineer',
						issue_date: '2020-01-15',
						expiry_date: '2025-01-14',
						issuing_authority: 'Mock Maritime Authority',
					},
				},
				TAXRESIDENCY: {
					// Tax Residency Attestation - SD-JWT format
					// Matches RequestAdditionalCredentialsUseCase.ts line 87
					namespace: 'urn:eu.europa.ec.eudi:tax:1:1',
					claims: {
						vct: 'urn:eu.europa.ec.eudi:tax:1:1',
						country: 'GR',
						tax_id: 'MOCK-TAX-98765',
						residence_address: {
							street: '123 Mock Street',
							city: 'Athens',
							postal_code: '10431',
							country: 'Greece',
						},
						valid_from: '2023-01-01',
						valid_until: '2025-12-31',
					},
				},
				NONE: {
					// No credentials required
					namespace: 'none',
					claims: {},
				},
			};

		return mockCredentials[credType.getValue()] ?? null;
	}

	/**
	 * Clear all stored verifications (useful for testing)
	 */
	clearVerifications(): void {
		this.verifications.clear();
		this.logger.info('Cleared all verifications');
	}
}
