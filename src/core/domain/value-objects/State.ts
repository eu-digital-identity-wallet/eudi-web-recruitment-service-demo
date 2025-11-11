/**
 * State - Value Object
 *
 * Represents a state parameter used in OAuth/OIDC flows and signing sessions.
 * Typically a UUID used to track and correlate async operations.
 *
 * Benefits:
 * - Type-safe representation of state parameters
 * - Prevents mixing up state with other identifiers
 * - Encapsulates validation logic
 */

export class State {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new State from a string
	 * @param state - The state string (typically UUID)
	 * @throws Error if state is invalid
	 */
	static create(state: string): State {
		// Domain-level validation: business rules only
		if (!state || state.trim().length === 0) {
			throw new Error('State cannot be empty');
		}

		if (state.length > 255) {
			throw new Error('State cannot exceed 255 characters');
		}

		return new State(state.trim());
	}

	/**
	 * Get the state string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the state string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another State
	 */
	equals(other: State): boolean {
		return this.value === other.value;
	}
}
