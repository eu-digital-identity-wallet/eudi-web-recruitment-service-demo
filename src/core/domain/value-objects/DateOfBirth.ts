/**
 * DateOfBirth - Value Object
 *
 * Represents a person's date of birth with validation.
 * Enforces valid date ranges and formats.
 *
 * Benefits:
 * - Type-safe representation of birth dates
 * - Prevents invalid dates
 * - Provides age calculation
 */

export class DateOfBirth {
	private readonly value: Date;

	private constructor(value: Date) {
		this.value = value;
	}

	/**
	 * Create a new DateOfBirth from a string (ISO 8601 format)
	 * @param dateString - The date string (YYYY-MM-DD or ISO 8601)
	 * @throws Error if date is invalid
	 */
	static create(dateString: string): DateOfBirth {
		// Domain-level validation: business rules only
		if (!dateString || dateString.trim().length === 0) {
			throw new Error('DateOfBirth cannot be empty');
		}

		const date = new Date(dateString);

		if (isNaN(date.getTime())) {
			throw new Error('Invalid date format for DateOfBirth');
		}

		// Business rule: Cannot be in the future
		if (date > new Date()) {
			throw new Error('DateOfBirth cannot be in the future');
		}

		// Business rule: Must be reasonable (not more than 150 years ago)
		const minDate = new Date();
		minDate.setFullYear(minDate.getFullYear() - 150);
		if (date < minDate) {
			throw new Error('DateOfBirth cannot be more than 150 years ago');
		}

		return new DateOfBirth(date);
	}

	/**
	 * Create from Date object
	 */
	static fromDate(date: Date): DateOfBirth {
		return DateOfBirth.create(date.toISOString());
	}

	/**
	 * Get the date as ISO string (YYYY-MM-DD)
	 */
	toString(): string {
		return this.value.toISOString().split('T')[0];
	}

	/**
	 * Get the Date object
	 */
	getValue(): Date {
		return new Date(this.value);
	}

	/**
	 * Calculate age in years
	 */
	getAge(): number {
		const today = new Date();
		let age = today.getFullYear() - this.value.getFullYear();
		const monthDiff = today.getMonth() - this.value.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.value.getDate())) {
			age--;
		}

		return age;
	}

	/**
	 * Check if person is over a certain age
	 */
	isAgeOver(years: number): boolean {
		return this.getAge() >= years;
	}

	/**
	 * Check equality with another DateOfBirth
	 */
	equals(other: DateOfBirth): boolean {
		return this.value.getTime() === other.value.getTime();
	}
}
