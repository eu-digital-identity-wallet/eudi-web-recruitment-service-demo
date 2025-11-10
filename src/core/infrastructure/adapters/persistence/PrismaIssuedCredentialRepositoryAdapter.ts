import 'server-only';
import { Prisma } from '@prisma/client';

import { IssuedCredentialMapper } from '@/core/domain/mappers/IssuedCredentialMapper';
import { Service } from '@/core/infrastructure/config/container';
import { prisma } from '@/core/prisma';

import type { IIssuedCredentialRepository } from '@/core/application/ports/outbound/IIssuedCredentialRepository';
import type { IssuedCredential } from '@/core/domain/model/IssuedCredential';

/**
 * Prisma adapter implementing ICredentialRepository port
 * Translates domain operations to Prisma-specific calls
 */
@Service()
export class PrismaIssuedCredentialRepositoryAdapter implements IIssuedCredentialRepository {
	/**
	 * Find credential by application ID and type
	 */
	async findByApplicationIdAndType(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredential | null> {
		const prismaCredential = await prisma.issuedCredential.findFirst({
			where: {
				applicationId,
				credentialType,
			},
		});

		return prismaCredential ? IssuedCredentialMapper.toDomain(prismaCredential) : null;
	}

	/**
	 * Find all credentials for an application
	 */
	async findByApplicationId(applicationId: string): Promise<IssuedCredential[]> {
		const prismaCredentials = await prisma.issuedCredential.findMany({
			where: { applicationId },
		});

		return prismaCredentials.map((c) => IssuedCredentialMapper.toDomain(c));
	}

	/**
	 * Find credential by pre-authorized code
	 */
	async findByPreAuthorizedCode(preAuthorizedCode: string): Promise<IssuedCredential | null> {
		const prismaCredential = await prisma.issuedCredential.findFirst({
			where: { preAuthorizedCode },
		});

		return prismaCredential ? IssuedCredentialMapper.toDomain(prismaCredential) : null;
	}

	/**
	 * Save domain IssuedCredential entity (create new)
	 */
	async save(credential: IssuedCredential): Promise<IssuedCredential> {
		// Convert domain entity to Prisma data using mapper
		const persistence = IssuedCredentialMapper.toPersistence(credential);

		// Create new issued credential in database
		const prismaCredential = await prisma.issuedCredential.create({
			data: {
				...persistence,
				credentialData: persistence.credentialData as Prisma.InputJsonValue,
				application: { connect: { id: credential.getApplicationId() } },
			},
		});

		return IssuedCredentialMapper.toDomain(prismaCredential);
	}

	/**
	 * Update issued credential
	 */
	async update(id: string, data: Prisma.IssuedCredentialUpdateInput): Promise<IssuedCredential> {
		const prismaCredential = await prisma.issuedCredential.update({
			where: { id },
			data,
		});

		return IssuedCredentialMapper.toDomain(prismaCredential);
	}

	/**
	 * Delete issued credential
	 */
	async delete(id: string): Promise<IssuedCredential> {
		const prismaCredential = await prisma.issuedCredential.delete({
			where: { id },
		});

		return IssuedCredentialMapper.toDomain(prismaCredential);
	}
}
