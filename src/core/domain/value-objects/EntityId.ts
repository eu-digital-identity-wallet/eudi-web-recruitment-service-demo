/**
 * EntityId - Value Object
 *
 * Represents a unique identifier for domain entities (VerifiedCredential, SignedDocument, IssuedCredential).
 * Enforces type safety and domain rules for entity IDs.
 *
 * Benefits:
 * - Type safety: prevents mixing different ID types
 * - Self-documenting code
 * - Centralized validation logic
 */

export class EntityId {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new EntityId from a string
	 * @param id - The ID string
	 * @throws Error if ID is invalid
	 */
	static create(id: string): EntityId {
		if (!id || id.trim().length === 0) {
			throw new Error('EntityId cannot be empty');
		}

		if (id.length > 255) {
			throw new Error('EntityId cannot exceed 255 characters');
		}

		return new EntityId(id.trim());
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
	 * Check equality with another EntityId
	 */
	equals(other: EntityId): boolean {
		return this.value === other.value;
	}
}
