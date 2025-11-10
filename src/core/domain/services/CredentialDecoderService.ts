import { decode } from 'cbor-x';
import { Service } from 'typedi';

import { createLogger } from '@/core/infrastructure/logging/Logger';

/**
 * Credential Decoder Service (Domain Service)
 *
 * Domain service responsible for decoding credential formats used in EUDI wallets:
 * - CBOR-encoded mDoc (ISO/IEC 18013-5) VP tokens
 * - SD-JWT (Selective Disclosure JWT) credentials
 * - Base64/Hex encoded credential data
 *
 * This is a Domain Service because:
 * - It operates on domain concepts (credentials, VP tokens)
 * - Contains domain-specific knowledge about credential formats
 * - Used by multiple use cases and infrastructure adapters
 * - Stateless operations that don't belong to a single entity
 *
 * Location: domain/services (not utils - this is domain logic)
 */
@Service()
export class CredentialDecoderService {
	private readonly logger = createLogger('CredentialDecoderService');

	/**
	 * Decode Base64 or Hex encoded credential data to Buffer
	 * Used for decoding VP tokens and credential presentations
	 */
	public decodeBase64OrHex(input: string): Buffer {
		// Ensure input is a string
		if (typeof input !== 'string') {
			throw new Error(`Expected string input, got ${typeof input}`);
		}

		const base64Regex = /^[A-Za-z0-9-_]+$/;
		if (base64Regex.test(input)) {
			const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
			return Buffer.from(base64, 'base64');
		}
		return Buffer.from(input, 'hex');
	}

	/**
	 * Decode CBOR-encoded mDoc data from Uint8Array
	 * Used for ISO/IEC 18013-5 mobile documents (mDoc)
	 */
	public decodeCborData(data: Uint8Array): unknown {
		try {
			return decode(data);
		} catch (error) {
			this.logger.error('Failed to decode CBOR credential data', error as Error);
			return null;
		}
	}
}
