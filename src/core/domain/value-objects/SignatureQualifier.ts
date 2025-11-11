/**
 * SignatureQualifier - Value Object
 *
 * Represents the signature qualifier (e.g., "ades_seal_qc").
 * Enforces validation and provides type safety.
 */

export class SignatureQualifier {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new SignatureQualifier
	 * @param qualifier - The signature qualifier string
	 * @throws Error if qualifier is invalid
	 */
	static create(qualifier: string): SignatureQualifier {
		if (!qualifier || qualifier.trim().length === 0) {
			throw new Error('SignatureQualifier cannot be empty');
		}

		return new SignatureQualifier(qualifier.trim());
	}

	/**
	 * Create SignatureQualifier or return null
	 */
	static createOrNull(qualifier: string | null | undefined): SignatureQualifier | null {
		if (!qualifier) return null;
		return SignatureQualifier.create(qualifier);
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another SignatureQualifier
	 */
	equals(other: SignatureQualifier): boolean {
		return this.value === other.value;
	}
}
