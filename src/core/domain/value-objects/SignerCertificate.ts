/**
 * SignerCertificate - Value Object
 *
 * Represents the signer's certificate (base64 encoded X.509 certificate).
 * Enforces validation and provides type safety.
 */

export class SignerCertificate {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Create a new SignerCertificate
	 * @param certificate - The certificate string (base64)
	 * @throws Error if certificate is invalid
	 */
	static create(certificate: string): SignerCertificate {
		if (!certificate || certificate.trim().length === 0) {
			throw new Error('SignerCertificate cannot be empty');
		}

		return new SignerCertificate(certificate.trim());
	}

	/**
	 * Create SignerCertificate or return null
	 */
	static createOrNull(certificate: string | null | undefined): SignerCertificate | null {
		if (!certificate) return null;
		return SignerCertificate.create(certificate);
	}

	/**
	 * Get the raw string value
	 */
	getValue(): string {
		return this.value;
	}

	/**
	 * Check equality with another SignerCertificate
	 */
	equals(other: SignerCertificate): boolean {
		return this.value === other.value;
	}
}
