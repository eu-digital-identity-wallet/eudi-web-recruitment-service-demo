import crypto from 'crypto';

import { Service } from 'typedi';

/**
 * Service responsible for document hashing operations
 * Provides cryptographic hash calculation and verification for document signing workflows
 * Domain: Document Signing
 */
@Service()
export class DocumentHashService {
	private readonly HASH_ALGORITHM = 'sha256';

	/**
	 * Calculates SHA-256 hash of document content
	 * Returns base64-encoded hash as required by EUDI wallet document signing spec
	 *
	 * @param documentBytes - The document content as a Buffer
	 * @returns Base64-encoded SHA-256 hash
	 */
	calculateDocumentHash(documentBytes: Buffer): string {
		const hash = crypto.createHash(this.HASH_ALGORITHM);
		hash.update(documentBytes);
		return hash.digest('base64');
	}

	/**
	 * Verifies that a document matches its expected hash
	 *
	 * @param documentBytes - The document content to verify
	 * @param expectedHash - The expected base64-encoded hash
	 * @returns True if the document hash matches the expected hash
	 */
	verifyDocumentHash(documentBytes: Buffer, expectedHash: string): boolean {
		const actualHash = this.calculateDocumentHash(documentBytes);
		return actualHash === expectedHash;
	}
}
