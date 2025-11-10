/**
 * SignatureObject - Value Object
 *
 * Represents the cryptographic signature object (base64 encoded).
 * Enforces validation and provides type safety.
 */

export class SignatureObject {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new SignatureObject
	 * @param signature - The signature string (base64)
	 * @throws Error if signature is invalid
	 */
	static create(signature: string): SignatureObject {
		if (!signature || signature.trim().length === 0) {
			throw new Error('SignatureObject cannot be empty');
		}

		return new SignatureObject(signature.trim());
	}

	/**
	 * Create SignatureObject or return null
	 */
	static createOrNull(signature: string | null | undefined): SignatureObject | null {
		if (!signature) return null;
		return SignatureObject.create(signature);
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another SignatureObject
	 */
	equals(other: SignatureObject): boolean {
		return this.value === other.value;
	}
}
