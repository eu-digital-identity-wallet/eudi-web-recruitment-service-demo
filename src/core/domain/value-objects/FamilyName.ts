/**
 * FamilyName - Value Object
 *
 * Represents a person's family name (surname/last name).
 * Enforces validation rules for names.
 *
 * Benefits:
 * - Type-safe representation of family names
 * - Prevents invalid or empty names
 * - Encapsulates name validation logic
 */

export class FamilyName {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new FamilyName from a string
	 * @param name - The family name string
	 * @throws Error if name is invalid
	 */
	static create(name: string): FamilyName {
		// Domain-level validation: business rules only
		if (!name || name.trim().length === 0) {
			throw new Error('FamilyName cannot be empty');
		}

		const trimmed = name.trim();

		if (trimmed.length > 100) {
			throw new Error('FamilyName cannot exceed 100 characters');
		}

		return new FamilyName(trimmed);
	}

	/**
	 * Get the family name string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the family name string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another FamilyName
	 */
	equals(other: FamilyName): boolean {
		return this.value === other.value;
	}
}
