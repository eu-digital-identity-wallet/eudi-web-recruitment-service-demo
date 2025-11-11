/**
 * GivenName - Value Object
 *
 * Represents a person's given name (first name).
 * Enforces validation rules for names.
 *
 * Benefits:
 * - Type-safe representation of given names
 * - Prevents invalid or empty names
 * - Encapsulates name validation logic
 */

export class GivenName {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new GivenName from a string
	 * @param name - The given name string
	 * @throws Error if name is invalid
	 */
	static create(name: string): GivenName {
		// Domain-level validation: business rules only
		if (!name || name.trim().length === 0) {
			throw new Error('GivenName cannot be empty');
		}

		const trimmed = name.trim();

		if (trimmed.length > 100) {
			throw new Error('GivenName cannot exceed 100 characters');
		}

		return new GivenName(trimmed);
	}

	/**
	 * Get the given name string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the given name string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another GivenName
	 */
	equals(other: GivenName): boolean {
		return this.value === other.value;
	}
}
