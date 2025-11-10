/**
 * CredentialType - Value Object
 *
 * Represents the type of a credential (PID, DIPLOMA, SEAFARER, etc.).
 * Enforces valid credential types and provides type safety.
 *
 * Benefits:
 * - Type-safe representation of credential types
 * - Prevents invalid credential type strings
 * - Centralized list of supported types
 */

export class CredentialType {
	// Supported credential types
	static readonly NONE = new CredentialType('NONE');
	static readonly PID = new CredentialType('PID');
	static readonly DIPLOMA = new CredentialType('DIPLOMA');
	static readonly SEAFARER = new CredentialType('SEAFARER');
	static readonly TAXRESIDENCY = new CredentialType('TAXRESIDENCY');
	static readonly EMPLOYEE = new CredentialType('EMPLOYEE');

	private constructor(private readonly value: string) {}

	/**
	 * Create a CredentialType from a string
	 * @param type - The credential type string (enum value like "EMPLOYEE" or full ID like "eu.europa.ec.eudi.employee_mdoc")
	 * @throws Error if type is not supported
	 */
	static fromString(type: string): CredentialType {
		const normalized = type.trim().toUpperCase();

		// Handle full credential configuration IDs (for backward compatibility with old DB records)
		if (normalized.includes('EMPLOYEE')) {
			return CredentialType.EMPLOYEE;
		}
		if (normalized.includes('DIPLOMA')) {
			return CredentialType.DIPLOMA;
		}
		if (normalized.includes('SEAFARER')) {
			return CredentialType.SEAFARER;
		}
		if (normalized.includes('TAX') || normalized.includes('RESIDENCY')) {
			return CredentialType.TAXRESIDENCY;
		}

		// Handle simple enum values
		switch (normalized) {
			case 'NONE':
				return CredentialType.NONE;
			case 'PID':
				return CredentialType.PID;
			case 'DIPLOMA':
				return CredentialType.DIPLOMA;
			case 'SEAFARER':
				return CredentialType.SEAFARER;
			case 'TAXRESIDENCY':
				return CredentialType.TAXRESIDENCY;
			case 'EMPLOYEE':
				return CredentialType.EMPLOYEE;
			default:
				throw new Error(`Unsupported credential type: ${type}`);
		}
	}

	/**
	 * Get all supported credential types
	 */
	static getAllTypes(): CredentialType[] {
		return [
			CredentialType.NONE,
			CredentialType.PID,
			CredentialType.DIPLOMA,
			CredentialType.SEAFARER,
			CredentialType.TAXRESIDENCY,
			CredentialType.EMPLOYEE,
		];
	}

	/**
	 * Get the credential type string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the credential type string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another CredentialType
	 */
	equals(other: CredentialType): boolean {
		return this.value === other.value;
	}

	/**
	 * Check if this is a PID credential
	 */
	isPID(): boolean {
		return this.equals(CredentialType.PID);
	}

	/**
	 * Check if this is a qualification credential (DIPLOMA or SEAFARER)
	 */
	isQualification(): boolean {
		return this.equals(CredentialType.DIPLOMA) || this.equals(CredentialType.SEAFARER);
	}
}
