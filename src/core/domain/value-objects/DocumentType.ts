/**
 * DocumentType - Value Object
 *
 * Represents the type of document being signed (e.g., "employment_contract").
 * Enforces validation and provides type safety.
 */

export class DocumentType {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new DocumentType
	 * @param type - The document type string
	 * @throws Error if type is invalid
	 */
	static create(type: string): DocumentType {
		if (!type || type.trim().length === 0) {
			throw new Error('DocumentType cannot be empty');
		}

		return new DocumentType(type.trim());
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another DocumentType
	 */
	equals(other: DocumentType): boolean {
		return this.value === other.value;
	}
}
