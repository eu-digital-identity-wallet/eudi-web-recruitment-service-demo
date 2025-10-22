import type { CredentialType } from '../types';

export class Job {
	private constructor(
		private readonly id: string,
		private readonly title: string,
		private readonly description: string,
		private readonly requiredCredentials: CredentialType,
		private readonly createdAt: Date,
	) {}

	static create(data: {
		id: string;
		title: string;
		description: string;
		requiredCredentials?: CredentialType;
	}): Job {
		return new Job(
			data.id,
			data.title,
			data.description,
			data.requiredCredentials || 'NONE',
			new Date(),
		);
	}

	static reconstitute(data: {
		id: string;
		title: string;
		description: string;
		requiredCredentials: CredentialType;
		createdAt: Date;
	}): Job {
		return new Job(data.id, data.title, data.description, data.requiredCredentials, data.createdAt);
	}

	// Business Rules

	/**
	 * Business Rule: Determines if this job requires diploma credentials
	 */
	requiresDiploma(): boolean {
		return this.requiredCredentials === 'DIPLOMA' || this.requiredCredentials === 'BOTH';
	}

	/**
	 * Business Rule: Determines if this job requires seafarer certificate
	 */
	requiresSeafarerCert(): boolean {
		return this.requiredCredentials === 'SEAFARER' || this.requiredCredentials === 'BOTH';
	}

	/**
	 * Business Rule: Check if job has any credential requirements
	 */
	hasCredentialRequirements(): boolean {
		return this.requiredCredentials !== 'NONE' && this.requiredCredentials !== 'PID';
	}

	/**
	 * Business Rule: Validate if candidate meets job requirements
	 */
	candidateMeetsRequirements(hasDiploma: boolean, hasSeafarerCert: boolean): boolean {
		if (!this.hasCredentialRequirements()) {
			return true; // No requirements, always qualified
		}

		if (this.requiredCredentials === 'BOTH') {
			return hasDiploma && hasSeafarerCert;
		}

		if (this.requiredCredentials === 'DIPLOMA') {
			return hasDiploma;
		}

		if (this.requiredCredentials === 'SEAFARER') {
			return hasSeafarerCert;
		}

		return true;
	}

	// Queries

	getId(): string {
		return this.id;
	}

	getTitle(): string {
		return this.title;
	}

	getDescription(): string {
		return this.description;
	}

	getRequiredCredentials(): CredentialType {
		return this.requiredCredentials;
	}

	getCreatedAt(): Date {
		return this.createdAt;
	}
}
