import { CredentialType, Description, Title, VacancyId } from '@/core/domain/value-objects';

export class Vacancy {
	private constructor(
		private readonly id: VacancyId,
		private readonly title: Title,
		private readonly description: Description,
		private readonly requiredCredentials: CredentialType[],
		private readonly createdAt: Date,
	) {}

	// Factory method for creating new vacancies
	static create(data: {
		id: string;
		title: string;
		description: string;
		requiredCredentials: CredentialType[];
	}): Vacancy {
		return new Vacancy(
			VacancyId.create(data.id),
			Title.create(data.title),
			Description.create(data.description),
			data.requiredCredentials,
			new Date(),
		);
	}

	// Factory method for reconstituting from database
	static reconstitute(data: {
		id: string;
		title: string;
		description: string;
		requiredCredentials: CredentialType[];
		createdAt: Date;
	}): Vacancy {
		return new Vacancy(
			VacancyId.create(data.id),
			Title.create(data.title),
			Description.create(data.description),
			data.requiredCredentials,
			data.createdAt,
		);
	}

	// Getters
	getId(): string {
		return this.id.getValue();
	}

	getIdValueObject(): VacancyId {
		return this.id;
	}

	getTitle(): string {
		return this.title.getValue();
	}

	getTitleValueObject(): Title {
		return this.title;
	}

	getDescription(): string {
		return this.description.getValue();
	}

	getDescriptionValueObject(): Description {
		return this.description;
	}

	getRequiredCredentials(): CredentialType[] {
		return this.requiredCredentials;
	}

	getCreatedAt(): Date {
		return this.createdAt;
	}

	// Business methods
	requiresPID(): boolean {
		return true; // PID is always required
	}

	requiresDiploma(): boolean {
		return this.requiredCredentials.some((cred) => cred.equals(CredentialType.DIPLOMA));
	}

	requiresSeafarer(): boolean {
		return this.requiredCredentials.some((cred) => cred.equals(CredentialType.SEAFARER));
	}
}
