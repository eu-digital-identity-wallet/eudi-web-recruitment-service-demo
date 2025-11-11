/**
 * Namespace - Value Object
 *
 * Represents a credential namespace in EUDI format.
 * Used to identify the schema and type of credentials.
 *
 * Two namespace formats are supported:
 * 1. Dot notation (mdoc): "eu.europa.ec.eudi.pid.1"
 * 2. URN notation (SD-JWT): "urn:eu.europa.ec.eudi:diploma:1:1"
 *
 * Benefits:
 * - Type-safe representation of namespaces
 * - Prevents mixing up namespaces with other strings
 * - Encapsulates validation logic
 */

export class Namespace {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Namespace from a string
	 * @param namespace - The namespace string (supports both dot notation and URN format)
	 * @throws Error if namespace is invalid
	 */
	static create(namespace: string): Namespace {
		// Domain-level validation: business rules only
		if (!namespace || namespace.trim().length === 0) {
			throw new Error('Namespace cannot be empty');
		}

		// Accept both formats:
		// 1. Dot notation (mdoc): eu.europa.ec.eudi.pid.1
		//    - Segments can be alphanumeric (e.g., "pid") or numeric-only (e.g., "1")
		// 2. URN notation (SD-JWT): urn:eu.europa.ec.eudi:diploma:1:1
		const dotNotation = /^[a-z0-9]+(\.[a-z0-9]+)*$/;
		const urnNotation = /^urn:[a-z0-9:.]+$/;

		if (!dotNotation.test(namespace) && !urnNotation.test(namespace)) {
			throw new Error(
				'Namespace must follow either dot notation (e.g., eu.europa.ec.eudi.pid.1) or URN notation (e.g., urn:eu.europa.ec.eudi:diploma:1:1)',
			);
		}

		if (namespace.length > 255) {
			throw new Error('Namespace cannot exceed 255 characters');
		}

		return new Namespace(namespace.trim());
	}

	/**
	 * Get the namespace string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the namespace string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another Namespace
	 */
	equals(other: Namespace): boolean {
		return this.value === other.value;
	}

	/**
	 * Check if this namespace is for PID credentials
	 */
	isPID(): boolean {
		return this.value.includes('eudi.pid');
	}

	/**
	 * Check if this namespace is for diploma credentials
	 */
	isDiploma(): boolean {
		return this.value.includes('eudi.diploma');
	}

	/**
	 * Check if this namespace is for seafarer credentials
	 */
	isSeafarer(): boolean {
		return this.value.includes('eudi.seafarer');
	}
}
