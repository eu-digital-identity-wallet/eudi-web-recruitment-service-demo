import { IssuedCredential } from '@/core/domain/model/IssuedCredential';

import type { IssuedCredential as PrismaIssuedCredential } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export class IssuedCredentialMapper {
	/**
	 * Convert Prisma model to Domain entity
	 */
	static toDomain(prismaCredential: PrismaIssuedCredential): IssuedCredential {
		return IssuedCredential.reconstitute({
			id: prismaCredential.id,
			applicationId: prismaCredential.applicationId,
			preAuthorizedCode: prismaCredential.preAuthorizedCode,
			credentialOfferUrl: prismaCredential.credentialOfferUrl,
			otp: prismaCredential.otp,
			credentialType: prismaCredential.credentialType,
			credentialData: prismaCredential.credentialData as Record<string, unknown>,
			claimed: prismaCredential.claimed,
			claimedAt: prismaCredential.claimedAt,
			expiresAt: prismaCredential.expiresAt,
			createdAt: prismaCredential.createdAt,
		});
	}

	/**
	 * Convert Domain entity to Prisma update data
	 */
	static toPersistence(domain: IssuedCredential): Omit<PrismaIssuedCredential, 'applicationId'> {
		return {
			id: domain.getId(),
			preAuthorizedCode: domain.getPreAuthorizedCode(),
			credentialOfferUrl: domain.getCredentialOfferUrl(),
			otp: domain.getOtp(),
			credentialType: domain.getCredentialType(),
			credentialData: domain.getCredentialData() as Prisma.JsonValue,
			claimed: domain.isClaimed(),
			claimedAt: domain.getClaimedAt(),
			expiresAt: domain.getExpiresAt(),
			createdAt: domain.getCreatedAt(),
		};
	}
}
