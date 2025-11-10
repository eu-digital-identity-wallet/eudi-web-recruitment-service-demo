import {
	DateOfBirth,
	Email,
	FamilyName,
	GivenName,
	MobilePhone,
	Nationality,
} from '@/core/domain/value-objects';

export class CandidateInfo {
	private constructor(
		public readonly familyName: FamilyName,
		public readonly givenName: GivenName,
		public readonly email?: Email,
		public readonly mobilePhone?: MobilePhone,
		public readonly nationality?: Nationality,
		public readonly dateOfBirth?: DateOfBirth,
	) {}

	static create(data: {
		familyName: string;
		givenName: string;
		email?: string;
		mobilePhone?: string;
		nationality?: string;
		dateOfBirth?: string;
	}): CandidateInfo {
		return new CandidateInfo(
			FamilyName.create(data.familyName),
			GivenName.create(data.givenName),
			data.email ? Email.create(data.email) : undefined,
			data.mobilePhone ? (MobilePhone.createOrNull(data.mobilePhone) ?? undefined) : undefined,
			data.nationality ? (Nationality.createOrNull(data.nationality) ?? undefined) : undefined,
			data.dateOfBirth ? DateOfBirth.create(data.dateOfBirth) : undefined,
		);
	}

	isComplete(): boolean {
		return !!(this.familyName && this.givenName && this.email && this.mobilePhone);
	}

	getFullName(): string {
		return `${this.givenName.getValue()} ${this.familyName.getValue()}`;
	}

	getAge(): number | undefined {
		return this.dateOfBirth?.getAge();
	}
}
