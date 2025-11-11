import type { KeyObject } from 'crypto';

/**
 * Port interface for cryptographic keystore access
 * Abstracts the underlying keystore implementation (JKS, PKCS12, etc.)
 */
export interface IKeystorePort {
	/**
	 * Load cryptographic keys and certificate from keystore
	 * @returns Private/public key pair and certificate chain
	 */
	loadKeystore(): KeystoreData;
}

/**
 * Domain model for keystore data
 */
export interface KeystoreData {
	privateKey: KeyObject;
	publicKey: KeyObject;
	cert: string; // Base64-encoded certificate for x5c header
}
