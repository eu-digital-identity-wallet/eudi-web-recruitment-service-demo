import type { KeyObject } from 'crypto';

/**
 * Port for Cryptographic Operations
 *
 * Business capability: Provide cryptographic services for secure operations
 * This port abstracts cryptographic operations like key management, signing, and encryption
 */
export interface ICryptographyPort {
	/**
	 * Load the application's cryptographic keys and certificate
	 *
	 * @returns Private key, public key, and certificate for signing operations
	 */
	loadKeys(): CryptographicKeys;

	/**
	 * Sign data using the application's private key
	 *
	 * @param data - Data to sign
	 * @returns Signature as a base64-encoded string
	 */
	sign(data: string | Buffer): Promise<string>;

	/**
	 * Verify a signature using the application's public key
	 *
	 * @param data - Original data
	 * @param signature - Signature to verify (base64-encoded)
	 * @returns True if signature is valid
	 */
	verify(data: string | Buffer, signature: string): Promise<boolean>;
}

/**
 * Cryptographic keys and certificate
 */
export interface CryptographicKeys {
	/** Private key for signing */
	privateKey: KeyObject;
	/** Public key for verification */
	publicKey: KeyObject;
	/** Base64-encoded certificate for x5c header */
	certificate: string;
}
