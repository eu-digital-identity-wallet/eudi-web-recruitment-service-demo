/**
 * ApplicationId - Value Object
 *
 * Represents a unique identifier for an application.
 * Enforces type safety and domain rules for application IDs.
 *
 * Benefits:
 * - Prevents passing wrong ID types (e.g., vacancyId where applicationId expected)
 * - Compiler catches bugs: applicationRepo.findById(vacancyId) becomes a type error
 * - Framework-agnostic validation (no external dependencies)
 * - Makes domain model more expressive and self-documenting
 */

export class ApplicationId {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new ApplicationId from a string
	 * @param id - The ID string
	 * @throws Error if ID is invalid
	 */
	static create(id: string): ApplicationId {
		// Domain-level validation: business rules only
		if (!id || id.trim().length === 0) {
			throw new Error('ApplicationId cannot be empty');
		}

		if (id.length > 255) {
			throw new Error('ApplicationId cannot exceed 255 characters');
		}

		return new ApplicationId(id.trim());
	}

	/**
	 * Get the raw string value
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the raw string value (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another ApplicationId
	 */
	equals(other: ApplicationId): boolean {
		return this.value === other.value;
	}
}
