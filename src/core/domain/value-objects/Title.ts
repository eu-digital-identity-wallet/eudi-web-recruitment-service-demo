/**
 * Title - Value Object
 *
 * Represents a title or heading (e.g., job title, document title).
 * Enforces validation rules for titles.
 *
 * Benefits:
 * - Type-safe representation of titles
 * - Prevents invalid or empty titles
 * - Encapsulates title validation logic
 */

export class Title {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Title from a string
	 * @param title - The title string
	 * @throws Error if title is invalid
	 */
	static create(title: string): Title {
		// Domain-level validation: business rules only
		if (!title || title.trim().length === 0) {
			throw new Error('Title cannot be empty');
		}

		const trimmed = title.trim();

		if (trimmed.length < 3) {
			throw new Error('Title must be at least 3 characters');
		}

		if (trimmed.length > 200) {
			throw new Error('Title cannot exceed 200 characters');
		}

		return new Title(trimmed);
	}

	/**
	 * Get the title string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the title string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another Title
	 */
	equals(other: Title): boolean {
		return this.value === other.value;
	}

	/**
	 * Get truncated version for display
	 */
	truncate(maxLength: number): string {
		if (this.value.length <= maxLength) {
			return this.value;
		}
		return this.value.substring(0, maxLength - 3) + '...';
	}
}
