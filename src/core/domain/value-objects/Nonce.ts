/**
 * Nonce - Value Object
 *
 * Represents a cryptographic nonce (number used once) for replay protection.
 * Used in document signing and other security-sensitive operations.
 *
 * Benefits:
 * - Type-safe representation of nonces
 * - Prevents mixing up nonces with other string values
 * - Encapsulates validation logic
 */

export class Nonce {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Nonce from a string
	 * @param nonce - The nonce string
	 * @throws Error if nonce is invalid
	 */
	static create(nonce: string): Nonce {
		// Domain-level validation: business rules only
		if (!nonce || nonce.trim().length === 0) {
			throw new Error('Nonce cannot be empty');
		}

		if (nonce.length > 255) {
			throw new Error('Nonce cannot exceed 255 characters');
		}

		return new Nonce(nonce.trim());
	}

	/**
	 * Get the nonce string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the nonce string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another Nonce
	 */
	equals(other: Nonce): boolean {
		return this.value === other.value;
	}
}
