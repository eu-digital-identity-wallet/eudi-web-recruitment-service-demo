/**
 * ErrorCode - Value Object
 *
 * Represents an error code from signing operations.
 * Enforces validation and provides type safety.
 */

export class ErrorCode {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new ErrorCode
	 * @param code - The error code string
	 * @throws Error if code is invalid
	 */
	static create(code: string): ErrorCode {
		if (!code || code.trim().length === 0) {
			throw new Error('ErrorCode cannot be empty');
		}

		return new ErrorCode(code.trim());
	}

	/**
	 * Create ErrorCode or return null
	 */
	static createOrNull(code: string | null | undefined): ErrorCode | null {
		if (!code) return null;
		return ErrorCode.create(code);
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another ErrorCode
	 */
	equals(other: ErrorCode): boolean {
		return this.value === other.value;
	}
}
