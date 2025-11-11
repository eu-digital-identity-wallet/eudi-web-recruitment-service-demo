/**
 * MobilePhone - Value Object
 *
 * Represents a mobile phone number with validation.
 * Framework-agnostic implementation using pure TypeScript.
 *
 * Benefits:
 * - Type-safe representation of phone numbers
 * - Prevents invalid phone numbers from entering the domain
 * - No external framework dependencies
 */

// Basic international phone number regex (E.164 format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export class MobilePhone {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new MobilePhone from a string
	 * @param phone - The phone number string
	 * @throws Error if phone is invalid
	 */
	static create(phone: string): MobilePhone {
		// Domain-level validation: business rules only
		if (!phone || phone.trim().length === 0) {
			throw new Error('MobilePhone cannot be empty');
		}

		// Remove spaces and dashes for validation
		const normalized = phone.replace(/[\s-]/g, '');

		if (!PHONE_REGEX.test(normalized)) {
			throw new Error(
				'Invalid mobile phone format (use E.164 format: +country code followed by digits)',
			);
		}

		return new MobilePhone(normalized);
	}

	/**
	 * Create or return null if invalid (no exception)
	 */
	static createOrNull(phone: string | null | undefined): MobilePhone | null {
		if (!phone) return null;

		try {
			return MobilePhone.create(phone);
		} catch {
			return null;
		}
	}

	/**
	 * Get the phone number string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the phone number string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another MobilePhone
	 */
	equals(other: MobilePhone): boolean {
		return this.value === other.value;
	}

	/**
	 * Get formatted phone number (with spaces for readability)
	 */
	toFormatted(): string {
		// Simple formatting: +CC NNN NNN NNNN
		if (this.value.startsWith('+')) {
			const country = this.value.substring(0, 3);
			const rest = this.value.substring(3);
			return `${country} ${rest.match(/.{1,3}/g)?.join(' ') || rest}`;
		}
		return this.value;
	}
}
