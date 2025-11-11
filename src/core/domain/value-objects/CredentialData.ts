/**
 * CredentialData - Value Object
 *
 * Represents the data/claims contained in a verified credential.
 * Wraps Record<string, unknown> to provide domain-specific behavior and type safety.
 *
 * Benefits:
 * - Type safety: prevents raw objects from being passed around
 * - Immutability: returns defensive copies
 * - Domain logic: can add claim extraction methods
 * - Self-documenting: explicit type for credential data
 */

export class CredentialData {
	private readonly value: Record<string, unknown>;

	private constructor(value: Record<string, unknown>) {
		// Create defensive copy to ensure immutability
		this.value = { ...value };
	}

	/**
	 * Create CredentialData from a record
	 * @param data - The credential data object
	 */
	static create(data: Record<string, unknown>): CredentialData {
		if (!data) {
			throw new Error('CredentialData cannot be null or undefined');
		}

		if (typeof data !== 'object') {
			throw new Error('CredentialData must be an object');
		}

		return new CredentialData(data);
	}

	/**
	 * Create empty CredentialData
	 */
	static empty(): CredentialData {
		return new CredentialData({});
	}

	/**
	 * Get the data (returns a defensive copy)
	 */
	getValue(): Record<string, unknown> {
		return { ...this.value };
	}

	/**
	 * Get a specific claim by key
	 */
	getClaim(key: string): unknown {
		return this.value[key];
	}

	/**
	 * Check if a claim exists
	 */
	hasClaim(key: string): boolean {
		return key in this.value;
	}

	/**
	 * Check if credential data is empty
	 */
	isEmpty(): boolean {
		return Object.keys(this.value).length === 0;
	}

	/**
	 * Get all claim keys
	 */
	getKeys(): string[] {
		return Object.keys(this.value);
	}

	/**
	 * Check equality with another CredentialData
	 */
	equals(other: CredentialData): boolean {
		const thisKeys = Object.keys(this.value).sort();
		const otherKeys = Object.keys(other.value).sort();

		if (thisKeys.length !== otherKeys.length) return false;
		if (JSON.stringify(thisKeys) !== JSON.stringify(otherKeys)) return false;

		return JSON.stringify(this.value) === JSON.stringify(other.value);
	}
}
