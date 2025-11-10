import type { VerifiedCredential } from '@/core/domain/model/VerifiedCredential';
import type { Prisma, VerifiedCredential as PrismaVerifiedCredential } from '@prisma/client';

/**
 * Port interface for VerifiedCredential repository (Outbound Port)
 * Application layer defines the contract, infrastructure layer implements it
 * Implemented by: PrismaVerifiedCredentialRepositoryAdapter
 * Defines operations for managing verified credentials from wallet presentations
 */
export interface IVerifiedCredentialRepository {
	/**
	 * Find verified credential by transaction ID
	 */
	findByTransactionId(transactionId: string): Promise<VerifiedCredential | null>;

	/**
	 * Find all verified credentials for an application
	 */
	findByApplicationId(applicationId: string): Promise<VerifiedCredential[]>;

	/**
	 * Find specific credential type for an application
	 */
	findByApplicationIdAndType(
		applicationId: string,
		credentialType: string,
	): Promise<VerifiedCredential | null>;

	/**
	 * Save domain VerifiedCredential entity (create or update)
	 */
	save(credential: VerifiedCredential): Promise<PrismaVerifiedCredential>;

	/**
	 * Update verified credential
	 */
	update(id: string, data: Prisma.VerifiedCredentialUpdateInput): Promise<VerifiedCredential>;

	/**
	 * Update by transaction ID
	 */
	updateByTransactionId(
		transactionId: string,
		data: Prisma.VerifiedCredentialUpdateInput,
	): Promise<VerifiedCredential | null>;

	/**
	 * Delete verified credential
	 */
	delete(id: string): Promise<VerifiedCredential>;
}
