/**
 * VacancyId - Value Object
 *
 * Represents a unique identifier for a job vacancy.
 * Enforces type safety and domain rules for vacancy IDs.
 *
 * Benefits:
 * - Prevents passing wrong ID types (e.g., applicationId where vacancyId expected)
 * - Compiler catches bugs: vacancyRepo.findById(applicationId) becomes a type error
 * - Framework-agnostic validation (no external dependencies)
 * - Makes domain model more expressive and self-documenting
 */

export class VacancyId {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new VacancyId from a string
	 * @param id - The ID string
	 * @throws Error if ID is invalid
	 */
	static create(id: string): VacancyId {
		// Domain-level validation: business rules only
		if (!id || id.trim().length === 0) {
			throw new Error('VacancyId cannot be empty');
		}

		if (id.length > 255) {
			throw new Error('VacancyId cannot exceed 255 characters');
		}

		return new VacancyId(id.trim());
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
	 * Check equality with another VacancyId
	 */
	equals(other: VacancyId): boolean {
		return this.value === other.value;
	}
}
