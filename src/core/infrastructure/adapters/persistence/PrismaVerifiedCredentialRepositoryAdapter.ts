import 'server-only';
import { Prisma, CredentialType } from '@prisma/client';

import { VerifiedCredentialMapper } from '@/core/domain/mappers/VerifiedCredentialMapper';
import { Service } from '@/core/infrastructure/config/container';
import { prisma } from '@/core/prisma';

import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';
import type { VerifiedCredential } from '@/core/domain/model/VerifiedCredential';
import type { VerifiedCredential as PrismaVerifiedCredential } from '@prisma/client';

/**
 * Prisma adapter implementing IVerifiedCredentialRepository port
 * Translates domain operations to Prisma-specific calls
 */
@Service()
export class PrismaVerifiedCredentialRepositoryAdapter implements IVerifiedCredentialRepository {
	/**
	 * Find verified credential by transaction ID
	 */
	async findByTransactionId(transactionId: string): Promise<VerifiedCredential | null> {
		const prismaCredential = await prisma.verifiedCredential.findFirst({
			where: { verifierTransactionId: transactionId },
		});

		return prismaCredential ? VerifiedCredentialMapper.toDomain(prismaCredential) : null;
	}

	/**
	 * Find all verified credentials for an application
	 */
	async findByApplicationId(applicationId: string): Promise<VerifiedCredential[]> {
		const prismaCredentials = await prisma.verifiedCredential.findMany({
			where: { applicationId },
			orderBy: { createdAt: 'asc' },
		});

		return prismaCredentials.map((c) => VerifiedCredentialMapper.toDomain(c));
	}

	/**
	 * Find specific credential type for an application
	 */
	async findByApplicationIdAndType(
		applicationId: string,
		credentialType: CredentialType,
	): Promise<VerifiedCredential | null> {
		const prismaCredential = await prisma.verifiedCredential.findFirst({
			where: {
				applicationId,
				credentialType,
			},
		});

		return prismaCredential ? VerifiedCredentialMapper.toDomain(prismaCredential) : null;
	}

	/**
	 * Save domain VerifiedCredential entity (create new)
	 */
	async save(credential: VerifiedCredential): Promise<PrismaVerifiedCredential> {
		// Convert domain entity to Prisma data using mapper
		const persistence = VerifiedCredentialMapper.toPersistence(credential);

		// Create new verified credential in database
		return prisma.verifiedCredential.create({
			data: {
				id: persistence.id,
				application: { connect: { id: credential.getApplicationId() } },
				credentialType: persistence.credentialType,
				namespace: persistence.namespace,
				verifierTransactionId: persistence.verifierTransactionId,
				verifierRequestUri: persistence.verifierRequestUri,
				credentialData: persistence.credentialData as Prisma.InputJsonValue,
				status: persistence.status,
				verifiedAt: persistence.verifiedAt,
			},
		});
	}

	/**
	 * Update verified credential
	 */
	async update(
		id: string,
		data: Prisma.VerifiedCredentialUpdateInput,
	): Promise<VerifiedCredential> {
		const prismaCredential = await prisma.verifiedCredential.update({
			where: { id },
			data,
		});

		return VerifiedCredentialMapper.toDomain(prismaCredential);
	}

	/**
	 * Update by transaction ID
	 */
	async updateByTransactionId(
		transactionId: string,
		data: Prisma.VerifiedCredentialUpdateInput,
	): Promise<VerifiedCredential | null> {
		const credential = await this.findByTransactionId(transactionId);
		if (!credential) return null;

		return this.update(credential.getId(), data);
	}

	/**
	 * Delete verified credential
	 */
	async delete(id: string): Promise<VerifiedCredential> {
		const prismaCredential = await prisma.verifiedCredential.delete({
			where: { id },
		});

		return VerifiedCredentialMapper.toDomain(prismaCredential);
	}
}
