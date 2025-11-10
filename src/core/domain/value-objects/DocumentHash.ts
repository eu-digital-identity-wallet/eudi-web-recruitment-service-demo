/**
 * DocumentHash - Value Object
 *
 * Represents a cryptographic hash of a document (typically SHA-256).
 * Used for document integrity verification in signing workflows.
 * Framework-agnostic implementation using pure TypeScript.
 *
 * Benefits:
 * - Type-safe representation of document hashes
 * - Prevents mixing up hashes with other string values
 * - No external framework dependencies
 * - Makes signing domain model more expressive
 */

// Hash format regex patterns
const SHA256_REGEX = /^[a-f0-9]{64}$/i;
const SHA512_REGEX = /^[a-f0-9]{128}$/i;
const SHA1_REGEX = /^[a-f0-9]{40}$/i;
const BASE64_REGEX = /^[A-Za-z0-9+/]+=*$/;

export class DocumentHash {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new DocumentHash from a hash string
	 * @param hash - The hash string (hex-encoded SHA-256/SHA-512/SHA-1 or base64)
	 * @throws Error if hash is invalid
	 */
	static create(hash: string): DocumentHash {
		// Domain-level validation: business rules only
		if (!hash || hash.trim().length === 0) {
			throw new Error('DocumentHash cannot be empty');
		}

		const trimmed = hash.trim();

		// Validate against supported hash formats
		const isValidFormat =
			SHA256_REGEX.test(trimmed) ||
			SHA512_REGEX.test(trimmed) ||
			SHA1_REGEX.test(trimmed) ||
			BASE64_REGEX.test(trimmed);

		if (!isValidFormat) {
			throw new Error(
				'Invalid DocumentHash format: must be hex-encoded SHA-1/SHA-256/SHA-512 or base64',
			);
		}

		// Normalize hex hashes to lowercase
		const normalized = /^[a-f0-9]+$/i.test(trimmed) ? trimmed.toLowerCase() : trimmed;

		return new DocumentHash(normalized);
	}

	/**
	 * Create from base64-encoded hash
	 */
	static fromBase64(base64Hash: string): DocumentHash {
		if (!BASE64_REGEX.test(base64Hash)) {
			throw new Error('Invalid base64 hash format');
		}

		return new DocumentHash(base64Hash);
	}

	/**
	 * Get the hash string
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Get the hash string (alias for toString)
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another DocumentHash
	 */
	equals(other: DocumentHash): boolean {
		return this.value.toLowerCase() === other.value.toLowerCase();
	}

	/**
	 * Check if this is a SHA-256 hash
	 */
	isSHA256(): boolean {
		return SHA256_REGEX.test(this.value);
	}

	/**
	 * Check if this is a base64-encoded hash
	 */
	isBase64(): boolean {
		return BASE64_REGEX.test(this.value);
	}
}
