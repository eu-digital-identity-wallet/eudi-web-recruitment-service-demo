/**
 * Otp - Value Object
 *
 * Represents a One-Time Password used for credential issuance.
 * Enforces validation rules for OTP format.
 *
 * Benefits:
 * - Type safety for OTP values
 * - Centralized validation logic
 * - Self-documenting code
 */

export class Otp {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Otp from a string
	 * @param otp - The OTP string
	 * @throws Error if OTP is invalid
	 */
	static create(otp: string): Otp {
		if (!otp || otp.trim().length === 0) {
			throw new Error('OTP cannot be empty');
		}

		const trimmed = otp.trim();

		// Validate OTP format (typically 6 digits, but can vary)
		if (trimmed.length < 4 || trimmed.length > 10) {
			throw new Error('OTP must be between 4 and 10 characters');
		}

		return new Otp(trimmed);
	}

	/**
	 * Create OTP or return null if input is null/undefined
	 */
	static createOrNull(otp: string | null | undefined): Otp | null {
		if (!otp) return null;
		return Otp.create(otp);
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another Otp
	 */
	equals(other: Otp): boolean {
		return this.value === other.value;
	}
}
