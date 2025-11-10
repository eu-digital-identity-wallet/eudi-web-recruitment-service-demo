/**
 * DocumentLabel - Value Object
 *
 * Represents a human-readable label for a document (e.g., "Employment Contract").
 * Enforces validation and provides type safety.
 */

export class DocumentLabel {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new DocumentLabel
	 * @param label - The document label string
	 * @throws Error if label is invalid
	 */
	static create(label: string): DocumentLabel {
		if (!label || label.trim().length === 0) {
			throw new Error('DocumentLabel cannot be empty');
		}

		if (label.length > 255) {
			throw new Error('DocumentLabel cannot exceed 255 characters');
		}

		return new DocumentLabel(label.trim());
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another DocumentLabel
	 */
	equals(other: DocumentLabel): boolean {
		return this.value === other.value;
	}
}
