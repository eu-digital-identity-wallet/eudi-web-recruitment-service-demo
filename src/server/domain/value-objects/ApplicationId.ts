export class ApplicationId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Application ID cannot be empty");
    }
  }

  static create(value: string): ApplicationId {
    return new ApplicationId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ApplicationId): boolean {
    return this.value === other.value;
  }
}