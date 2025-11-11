/**
 * Nationality - Value Object
 *
 * Represents a person's nationality (ISO 3166-1 alpha-2 country code).
 * Uses 2-letter country codes (e.g., "US", "GB", "DE").
 *
 * Benefits:
 * - Type-safe representation of nationality
 * - Enforces ISO standard format
 * - Prevents invalid country codes
 */

export class Nationality {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Nationality from a country code string
	 * @param code - The ISO 3166-1 alpha-2 country code (e.g., "US", "GB")
	 * @throws Error if code is invalid
	 */
	static create(code: string): Nationality {
		// Domain-level validation: business rules only
		if (!code || code.trim().length === 0) {
			throw new Error('Nationality cannot be empty');
		}

		const normalized = code.trim().toUpperCase();

		// ISO 3166-1 alpha-2 is exactly 2 letters
		if (!/^[A-Z]{2}$/.test(normalized)) {
			throw new Error('Nationality must be a valid ISO 3166-1 alpha-2 country code (2 letters)');
		}

		return new Nationality(normalized);
	}

	/**
	 * Create or return null if invalid (no exception)
	 */
	static createOrNull(code: string | null | undefined): Nationality | null {
		if (!code) return null;

		try {
			return Nationality.create(code);
		} catch {
			return null;
		}
	}

	/**
	 * Get the nationality code string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the nationality code string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another Nationality
	 */
	equals(other: Nationality): boolean {
		return this.value === other.value;
	}
}
