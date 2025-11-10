/**
 * Timestamp - Value Object
 *
 * Represents a point in time for domain events (CreatedAt, VerifiedAt, ExpiresAt, SignedAt).
 * Wraps Date objects to provide domain-specific behavior and immutability.
 *
 * Benefits:
 * - Immutability: Date objects are mutable in JS, this wrapper prevents mutations
 * - Domain logic: can add business rules (e.g., "cannot be in future")
 * - Self-documenting: CreatedAt vs VerifiedAt vs ExpiresAt vs SignedAt are explicit types
 */

export abstract class Timestamp {
	protected readonly value: Date;

	protected constructor(value: Date) {
		this.value = new Date(value.getTime()); // Create defensive copy
	}

	/**
	 * Get the Date value (returns a copy for immutability)
	 */
	getValue(): Date {
		return new Date(this.value.getTime());
	}

	/**
	 * Get ISO string representation
	 */
	toISOString(): string {
		return this.value.toISOString();
	}

	/**
	 * Check equality with another Timestamp
	 */
	equals(other: Timestamp): boolean {
		return this.value.getTime() === other.value.getTime();
	}

	/**
	 * Check if this timestamp is before another
	 */
	isBefore(other: Timestamp): boolean {
		return this.value.getTime() < other.value.getTime();
	}

	/**
	 * Check if this timestamp is after another
	 */
	isAfter(other: Timestamp): boolean {
		return this.value.getTime() > other.value.getTime();
	}
}

/**
 * CreatedAt - When an entity was created
 */
export class CreatedAt extends Timestamp {
	static create(date: Date): CreatedAt {
		if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
			throw new Error('CreatedAt must be a valid Date');
		}
		return new CreatedAt(date);
	}

	static now(): CreatedAt {
		return new CreatedAt(new Date());
	}
}

/**
 * VerifiedAt - When a credential was verified
 */
export class VerifiedAt extends Timestamp {
	static create(date: Date): VerifiedAt {
		if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
			throw new Error('VerifiedAt must be a valid Date');
		}
		return new VerifiedAt(date);
	}

	static now(): VerifiedAt {
		return new VerifiedAt(new Date());
	}

	static createOrNull(date: Date | null): VerifiedAt | null {
		if (!date) return null;
		return VerifiedAt.create(date);
	}
}

/**
 * ExpiresAt - When something expires
 */
export class ExpiresAt extends Timestamp {
	static create(date: Date): ExpiresAt {
		if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
			throw new Error('ExpiresAt must be a valid Date');
		}
		return new ExpiresAt(date);
	}

	/**
	 * Check if this expiration has passed
	 */
	isExpired(): boolean {
		return this.value.getTime() < Date.now();
	}
}

/**
 * SignedAt - When a document was signed
 */
export class SignedAt extends Timestamp {
	static create(date: Date): SignedAt {
		if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
			throw new Error('SignedAt must be a valid Date');
		}
		return new SignedAt(date);
	}

	static now(): SignedAt {
		return new SignedAt(new Date());
	}

	static createOrNull(date: Date | null): SignedAt | null {
		if (!date) return null;
		return SignedAt.create(date);
	}
}
