import { Application, JobPosting } from '@prisma/client';
import { Service } from 'typedi';

export interface EmployeeCredentialData extends Record<string, unknown> {
	given_name: string;
	family_name: string;
	birth_date: string;
	employee_id: string;
	employer_name: string;
	employment_start_date: string;
	employment_type: string;
	country_code: string;
}

/**
 * Service responsible for building employee credential data
 * Handles the business logic for creating employee attestations for issuance
 */
@Service()
export class EmployeeCredentialService {
	private readonly CREDENTIAL_CONFIGURATION_ID = 'eu.europa.ec.eudi.employee_mdoc';
	private readonly DEFAULT_EMPLOYER_NAME = 'EUDI Web Recruitment Service';
	private readonly DEFAULT_EMPLOYMENT_TYPE = 'Contract';

	/**
	 * Build employee credential data from application
	 *
	 * @param application - The application with verified personal information
	 * @returns Employee credential data ready for issuance
	 */
	public buildCredentialData(
		application: Application & { job: JobPosting },
	): EmployeeCredentialData {
		this.validateApplication(application);

		return {
			given_name: application.candidateGivenName!,
			family_name: application.candidateFamilyName!,
			birth_date: application.candidateDateOfBirth!,
			employee_id: application.id,
			employer_name: this.DEFAULT_EMPLOYER_NAME,
			employment_start_date: this.getCurrentDate(),
			employment_type: this.DEFAULT_EMPLOYMENT_TYPE,
			country_code: application.candidateNationality || 'EU',
		};
	}

	/**
	 * Get the credential configuration ID for employee credentials
	 */
	public getCredentialConfigurationId(): string {
		return this.CREDENTIAL_CONFIGURATION_ID;
	}

	/**
	 * Get human-readable description of employee credential
	 */
	public getDescription(): string {
		return 'Employee attestation credential';
	}

	/**
	 * Validate that application has required personal information
	 */
	private validateApplication(application: Application): void {
		if (
			!application.candidateFamilyName ||
			!application.candidateGivenName ||
			!application.candidateDateOfBirth
		) {
			throw new Error('Application is missing verified personal information');
		}
	}

	/**
	 * Get current date in ISO format (YYYY-MM-DD)
	 */
	private getCurrentDate(): string {
		return new Date().toISOString().split('T')[0];
	}
}
