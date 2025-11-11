/**
 * Email - Value Object
 *
 * Represents an email address with domain-level validation.
 * Framework-agnostic implementation using pure TypeScript.
 *
 * Benefits:
 * - Guarantees all Email instances are valid
 * - Prevents invalid email addresses from entering the domain
 * - No external framework dependencies
 * - Makes domain model more expressive and self-documenting
 */

// Simple but effective email regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Email from a string
	 * @param email - The email address string
	 * @throws Error if email is invalid
	 */
	static create(email: string): Email {
		// Domain-level validation: business rules only
		if (!email || email.trim().length === 0) {
			throw new Error('Email cannot be empty');
		}

		const trimmed = email.trim().toLowerCase();

		if (trimmed.length > 254) {
			throw new Error('Email cannot exceed 254 characters');
		}

		if (!EMAIL_REGEX.test(trimmed)) {
			throw new Error('Invalid email format');
		}

		// Check local part (before @) doesn't exceed 64 characters
		const [localPart] = trimmed.split('@');
		if (localPart && localPart.length > 64) {
			throw new Error('Email local part cannot exceed 64 characters');
		}

		return new Email(trimmed);
	}

	/**
	 * Create an Email or return null if invalid (no exception)
	 * Useful for optional email fields
	 */
	static createOrNull(email: string | null | undefined): Email | null {
		if (!email) return null;

		try {
			return Email.create(email);
		} catch {
			return null;
		}
	}

	/**
	 * Get the email address string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the email address string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Get the domain part of the email (after @)
	 */
	getDomain(): string {
		const parts = this.value.split('@');
		return parts[1] || '';
	}

	/**
	 * Get the local part of the email (before @)
	 */
	getLocalPart(): string {
		const parts = this.value.split('@');
		return parts[0] || '';
	}

	/**
	 * Check equality with another Email
	 */
	equals(other: Email): boolean {
		return this.value === other.value;
	}

	/**
	 * Check if email is from a specific domain
	 */
	isFromDomain(domain: string): boolean {
		return this.getDomain().toLowerCase() === domain.toLowerCase();
	}
}
