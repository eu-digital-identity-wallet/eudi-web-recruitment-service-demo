/**
 * Url - Value Object
 *
 * Represents a valid URL with validation.
 * Used for credential offer URLs, request URIs, etc.
 *
 * Benefits:
 * - Type-safe representation of URLs
 * - Prevents invalid URLs from entering the domain
 * - Framework-agnostic validation
 */

export class Url {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new Url from a string
	 * @param urlString - The URL string
	 * @throws Error if URL is invalid
	 */
	static create(urlString: string): Url {
		// Domain-level validation: business rules only
		if (!urlString || urlString.trim().length === 0) {
			throw new Error('Url cannot be empty');
		}

		const trimmed = urlString.trim();

		// Validate URL format using URL constructor
		try {
			new URL(trimmed);
		} catch {
			throw new Error('Invalid URL format');
		}

		if (trimmed.length > 2048) {
			throw new Error('Url cannot exceed 2048 characters');
		}

		return new Url(trimmed);
	}

	/**
	 * Create or return null if invalid (no exception)
	 */
	static createOrNull(urlString: string | null | undefined): Url | null {
		if (!urlString) return null;

		try {
			return Url.create(urlString);
		} catch {
			return null;
		}
	}

	/**
	 * Get the URL string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the URL string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Get the URL object
	 */
	toURL(): URL {
		return new URL(this.value);
	}

	/**
	 * Get the protocol (e.g., "https:")
	 */
	getProtocol(): string {
		return this.toURL().protocol;
	}

	/**
	 * Get the hostname
	 */
	getHostname(): string {
		return this.toURL().hostname;
	}

	/**
	 * Check if this is an HTTPS URL
	 */
	isHttps(): boolean {
		return this.getProtocol() === 'https:';
	}

	/**
	 * Check equality with another Url
	 */
	equals(other: Url): boolean {
		return this.value === other.value;
	}
}
