/**
 * PreAuthorizedCode - Value Object
 *
 * Represents a pre-authorized code for OpenID4VCI credential issuance.
 * Used in credential offer flows to allow wallets to claim credentials.
 *
 * Benefits:
 * - Type-safe representation of authorization codes
 * - Prevents mixing up codes with other string values
 * - Encapsulates validation logic
 */

export class PreAuthorizedCode {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new PreAuthorizedCode from a string
	 * @param code - The pre-authorized code string
	 * @throws Error if code is invalid
	 */
	static create(code: string): PreAuthorizedCode {
		// Domain-level validation: business rules only
		if (!code || code.trim().length === 0) {
			throw new Error('PreAuthorizedCode cannot be empty');
		}

		if (code.length > 512) {
			throw new Error('PreAuthorizedCode cannot exceed 512 characters');
		}

		return new PreAuthorizedCode(code.trim());
	}

	/**
	 * Get the code string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the code string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another PreAuthorizedCode
	 */
	equals(other: PreAuthorizedCode): boolean {
		return this.value === other.value;
	}
}
