import { JWTPayload, SignJWT } from 'jose';

import { Inject, Service } from '@/server/container';

import { KeystoreService } from './KeystoreService';

@Service()
export class JWTService {
	constructor(@Inject() private readonly keystoreService: KeystoreService) {}

	public async sign(payload: JWTPayload): Promise<string> {
		const { privateKey, cert } = this.keystoreService.loadKeystore();
		if (!privateKey || !cert) {
			throw new Error('Keystore or keys not configured');
		}
		return await new SignJWT(payload)
			.setProtectedHeader({ alg: 'ES256', x5c: [cert] })
			.setIssuedAt()
			.setExpirationTime('5m')
			.sign(privateKey);
	}
}
