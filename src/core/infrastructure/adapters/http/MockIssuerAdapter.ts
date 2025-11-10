import 'server-only';
import { Service, Inject } from 'typedi';

import { IssuedCredential } from '@/core/domain/model/IssuedCredential';
import { CredentialType } from '@/core/domain/value-objects';
import { ICredentialRepositoryToken } from '@/core/infrastructure/config/container';
import { createLogger } from '@/core/infrastructure/logging/Logger';
import { generateId } from '@/core/shared/utils/id-generator';

import type { IIssuedCredentialRepository } from '@/core/application/ports/outbound/IIssuedCredentialRepository';
import type {
	IIssuerPort,
	IssueEmployeeIdResponse,
} from '@/core/application/ports/outbound/IIssuerPort';
import type { Application, Vacancy } from '@prisma/client';

/**
 * Mock implementation of IIssuerPort
 * Returns fake credential offers for testing and development
 *
 * To use this mock:
 * 1. Update container.ts: Container.set({ id: IIssuerPortToken, type: MockIssuerAdapter })
 * 2. All use cases will now use mock data instead of real EUDI Issuer API
 */
@Service()
export class MockIssuerAdapter implements IIssuerPort {
	private readonly logger = createLogger('MockIssuerAdapter');

	constructor(
		@Inject(ICredentialRepositoryToken)
		private readonly credentialRepo: IIssuedCredentialRepository,
	) {}

	/**
	 * Mock: Issue employee ID credential
	 * Returns fake OpenID4VCI offer URL matching real EudiIssuerAdapter structure
	 */
	async issueEmployeeId(
		application: Application & { vacancy: Vacancy },
	): Promise<IssueEmployeeIdResponse> {
		// Generate mock pre-authorized code and OTP
		const mockPreAuthCode = `mock-pre-auth-${Date.now()}-${Math.random().toString(36).substring(7)}`;
		const mockOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit numeric OTP

		// Build credential data matching EmployeeCredentialService.buildCredentialData() structure
		// Matches EudiIssuerAdapter
		const credentialData = {
			given_name: application.candidateGivenName || 'MockFirstName',
			family_name: application.candidateFamilyName || 'MockLastName',
			birth_date: application.candidateDateOfBirth || '1990-01-01',
			employee_id: application.id, // Uses application.id as employee ID
			employer_name: 'EUDI Web Recruitment Service', // DEFAULT_EMPLOYER_NAME
			employment_start_date: new Date().toISOString().split('T')[0], // Current date YYYY-MM-DD
			employment_type: 'Contract', // DEFAULT_EMPLOYMENT_TYPE
			country_code: application.candidateNationality || 'EU',
		};

		this.logger.info('Issuing employee ID for application', {
			applicationId: application.id,
			preAuthCode: mockPreAuthCode,
			otp: mockOtp,
			credentialData,
		});

		// Mock response structure from issuer API
		// Matches the actual response structure from EudiIssuerAdapter
		const mockResponseData = {
			credential_issuer: 'https://mock-issuer.eudi.dev',
			credential_configuration_ids: ['eu.europa.ec.eudi.employee_mdoc'],
			grants: {
				'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
					'pre-authorized_code': mockPreAuthCode,
					tx_code: {
						input_mode: 'numeric',
						length: 6,
						description: 'Enter the 6-digit code',
						// value is intentionally excluded from offer URL (line 124-128)
					},
				},
			},
		};

		// Create credential offer URL matching EudiIssuerAdapter
		const offerParam = encodeURIComponent(JSON.stringify(mockResponseData));
		const offerUrl = `openid-credential-offer://?credential_offer=${offerParam}`;

		// Create and save the issued credential entity matches EudiIssuerAdapter
		const credential = IssuedCredential.create({
			id: generateId(),
			applicationId: application.id,
			preAuthorizedCode: mockPreAuthCode,
			credentialOfferUrl: offerUrl,
			otp: String(mockOtp), // Store as string
			credentialType: CredentialType.EMPLOYEE.getValue(),
			credentialData: credentialData as Record<string, unknown>,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
		});

		await this.credentialRepo.save(credential);

		this.logger.info('Employee ID credential issued successfully', {
			applicationId: application.id,
			credentialType: CredentialType.EMPLOYEE.getValue(),
			expiresAt: credential.getExpiresAt(),
		});

		// Return matches EudiIssuerAdapter
		return {
			offerUrl,
			otp: String(mockOtp),
		};
	}

	/**
	 * Get issued credential by application ID and type
	 */
	async getCredentialByApplicationId(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredential | null> {
		this.logger.info('Fetching credential for application', { applicationId, credentialType });

		return this.credentialRepo.findByApplicationIdAndType(applicationId, credentialType);
	}
}
