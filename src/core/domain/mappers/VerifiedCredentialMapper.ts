import {
	VerifiedCredential,
	type VerificationStatus,
} from '@/core/domain/model/VerifiedCredential';

import type {
	VerifiedCredential as PrismaVerifiedCredential,
	CredentialType,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export class VerifiedCredentialMapper {
	/**
	 * Convert Prisma model to Domain entity
	 */
	static toDomain(prismaCredential: PrismaVerifiedCredential): VerifiedCredential {
		return VerifiedCredential.reconstitute({
			id: prismaCredential.id,
			applicationId: prismaCredential.applicationId,
			credentialType: prismaCredential.credentialType as string,
			namespace: prismaCredential.namespace,
			verifierTransactionId: prismaCredential.verifierTransactionId,
			verifierRequestUri: prismaCredential.verifierRequestUri,
			credentialData: prismaCredential.credentialData as Record<string, unknown>,
			status: prismaCredential.status as VerificationStatus,
			verifiedAt: prismaCredential.verifiedAt,
			createdAt: prismaCredential.createdAt,
		});
	}

	/**
	 * Convert Domain entity to Prisma update data
	 */
	static toPersistence(
		domain: VerifiedCredential,
	): Omit<PrismaVerifiedCredential, 'applicationId'> {
		return {
			id: domain.getId(),
			credentialType: domain.getCredentialType() as CredentialType,
			namespace: domain.getNamespace(),
			verifierTransactionId: domain.getVerifierTransactionId(),
			verifierRequestUri: domain.getVerifierRequestUri(),
			credentialData: domain.getCredentialData() as Prisma.JsonValue,
			status: domain.getStatus(),
			verifiedAt: domain.getVerifiedAt(),
			createdAt: domain.getCreatedAt(),
		};
	}
}
