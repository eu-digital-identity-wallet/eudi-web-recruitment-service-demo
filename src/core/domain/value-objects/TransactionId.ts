/**
 * TransactionId - Value Object
 *
 * Represents a unique identifier for a verification or signing transaction.
 * Used to track OpenID4VP verification requests and responses.
 *
 * Benefits:
 * - Type-safe representation of transaction IDs
 * - Prevents mixing up transaction IDs with other string values
 * - Encapsulates validation logic
 * - Makes verification domain model more expressive
 */

export class TransactionId {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new TransactionId from a string
	 * @param id - The transaction ID string
	 * @throws Error if ID is invalid
	 */
	static create(id: string): TransactionId {
		if (!id || id.trim().length === 0) {
			throw new Error('TransactionId cannot be empty');
		}

		if (id.length > 500) {
			throw new Error('TransactionId cannot exceed 500 characters');
		}

		return new TransactionId(id.trim());
	}

	/**
	 * Get the transaction ID string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the transaction ID string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another TransactionId
	 */
	equals(other: TransactionId): boolean {
		return this.value === other.value;
	}
}
