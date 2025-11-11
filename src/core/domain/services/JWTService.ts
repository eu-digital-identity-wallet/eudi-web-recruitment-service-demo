import { JWTPayload, SignJWT } from 'jose';
import { Service } from 'typedi';

import { Inject } from '@/core/infrastructure/config/container';
import { IKeystorePortToken } from '@/core/infrastructure/config/tokens';

import type { IKeystorePort } from '@/core/application/ports/outbound/IKeystorePort';

@Service()
export class JWTService {
	constructor(@Inject(IKeystorePortToken) private readonly keystorePort: IKeystorePort) {}

	public async sign(payload: JWTPayload): Promise<string> {
		const { privateKey, cert } = this.keystorePort.loadKeystore();
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
