/**
 * Description - Value Object
 *
 * Represents a descriptive text (e.g., job description, document description).
 * Enforces validation rules for descriptions.
 *
 * Benefits:
 * - Type-safe representation of descriptions
 * - Prevents invalid descriptions
 * - Encapsulates description validation logic
 */

export class Description {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Description from a string
	 * @param description - The description string
	 * @throws Error if description is invalid
	 */
	static create(description: string): Description {
		// Domain-level validation: business rules only
		if (!description || description.trim().length === 0) {
			throw new Error('Description cannot be empty');
		}

		const trimmed = description.trim();

		if (trimmed.length < 10) {
			throw new Error('Description must be at least 10 characters');
		}

		if (trimmed.length > 5000) {
			throw new Error('Description cannot exceed 5000 characters');
		}

		return new Description(trimmed);
	}

	/**
	 * Create or return null if invalid (no exception)
	 */
	static createOrNull(description: string | null | undefined): Description | null {
		if (!description) return null;

		try {
			return Description.create(description);
		} catch {
			return null;
		}
	}

	/**
	 * Get the description string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the description string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another Description
	 */
	equals(other: Description): boolean {
		return this.value === other.value;
	}

	/**
	 * Get excerpt (truncated version for preview)
	 */
	getExcerpt(maxLength: number = 200): string {
		if (this.value.length <= maxLength) {
			return this.value;
		}
		return this.value.substring(0, maxLength - 3) + '...';
	}

	/**
	 * Get word count
	 */
	getWordCount(): number {
		return this.value.split(/\s+/).filter((word) => word.length > 0).length;
	}
}
