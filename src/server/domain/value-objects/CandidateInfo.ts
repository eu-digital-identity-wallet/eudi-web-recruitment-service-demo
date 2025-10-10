export class CandidateInfo {
  private constructor(
    public readonly familyName: string,
    public readonly givenName: string,
    public readonly email?: string,
    public readonly mobilePhone?: string,
    public readonly nationality?: string,
    public readonly dateOfBirth?: string
  ) {
    if (!familyName || familyName.trim().length === 0) {
      throw new Error("Family name is required");
    }
    if (!givenName || givenName.trim().length === 0) {
      throw new Error("Given name is required");
    }
  }

  static create(data: {
    familyName: string;
    givenName: string;
    email?: string;
    mobilePhone?: string;
    nationality?: string;
    dateOfBirth?: string;
  }): CandidateInfo {
    return new CandidateInfo(
      data.familyName,
      data.givenName,
      data.email,
      data.mobilePhone,
      data.nationality,
      data.dateOfBirth
    );
  }

  isComplete(): boolean {
    return !!(
      this.familyName &&
      this.givenName &&
      this.email &&
      this.mobilePhone
    );
  }

  getFullName(): string {
    return `${this.givenName} ${this.familyName}`;
  }
}