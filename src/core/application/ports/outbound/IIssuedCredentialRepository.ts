import type { IssuedCredential } from '@/core/domain/model/IssuedCredential';
import type { Prisma } from '@prisma/client';

/**
 * Port interface for IssuedCredential repository (Outbound Port)
 * Application layer defines the contract, infrastructure layer implements it
 * Implemented by: PrismaIssuedCredentialRepositoryAdapter
 * Defines operations for managing credentials issued to applicants
 */
export interface IIssuedCredentialRepository {
	/**
	 * Find credential by application ID and type
	 */
	findByApplicationIdAndType(
		applicationId: string,
		credentialType: string,
	): Promise<IssuedCredential | null>;

	/**
	 * Find all credentials for an application
	 */
	findByApplicationId(applicationId: string): Promise<IssuedCredential[]>;

	/**
	 * Find credential by pre-authorized code
	 */
	findByPreAuthorizedCode(preAuthorizedCode: string): Promise<IssuedCredential | null>;

	/**
	 * Save domain IssuedCredential entity (create or update)
	 */
	save(credential: IssuedCredential): Promise<IssuedCredential>;

	/**
	 * Update issued credential
	 */
	update(id: string, data: Prisma.IssuedCredentialUpdateInput): Promise<IssuedCredential>;

	/**
	 * Delete issued credential
	 */
	delete(id: string): Promise<IssuedCredential>;
}
