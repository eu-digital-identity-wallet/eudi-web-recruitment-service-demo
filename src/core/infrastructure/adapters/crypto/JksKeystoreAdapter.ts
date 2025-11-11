import { createPrivateKey, createPublicKey } from 'crypto';
import fs from 'fs';

import jks from 'jks-js';

import { IKeystorePort, KeystoreData } from '@/core/application/ports/outbound';
import { Service } from '@/core/infrastructure/config/container';

/**
 * JKS (Java KeyStore) adapter implementing IKeystorePort
 * Abstracts the underlying keystore format from the domain
 */
@Service()
export class JksKeystoreAdapter implements IKeystorePort {
	public loadKeystore(): KeystoreData {
		const keystoreFile = this.getRequiredEnvVar('KEYSTORE_FILE');
		const keystorePass = this.getRequiredEnvVar('KEYSTORE_PASS');
		const keystoreAlias = this.getRequiredEnvVar('KEYSTORE_ALIAS');

		const keystore = jks.toPem(fs.readFileSync(keystoreFile), keystorePass);
		const jksStore = keystore[keystoreAlias];

		if (!jksStore) {
			const availableAliases = Object.keys(keystore).join(', ');
			throw new Error(
				`Keystore alias '${keystoreAlias}' not found. Available aliases: ${availableAliases || 'none'}`,
			);
		}

		if (!jksStore.key || !jksStore.cert) {
			throw new Error('Keystore missing key or certificate');
		}

		return {
			privateKey: createPrivateKey(jksStore.key),
			publicKey: createPublicKey(jksStore.cert),
			cert: jksStore.cert
				.replace(/-----BEGIN CERTIFICATE-----/g, '')
				.replace(/-----END CERTIFICATE-----/g, '')
				.replace(/\n/g, ''),
		};
	}

	private getRequiredEnvVar(variable: string): string {
		const value = process.env[variable];
		if (!value) throw new Error(`Missing required environment variable: ${variable}`);
		return value;
	}
}
