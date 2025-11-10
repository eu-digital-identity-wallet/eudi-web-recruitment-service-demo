import type { Application as DomainApplication } from '@/core/domain/model/Application';
import type { Application, Vacancy } from '@prisma/client';

/**
 * Port interface for Application persistence (Outbound Port)
 * Application layer defines the contract, infrastructure layer implements it
 * Implemented by: PrismaApplicationRepositoryAdapter
 */
export interface IApplicationRepository {
	/**
	 * Find application by ID
	 */
	findById(id: string): Promise<Application | null>;

	/**
	 * Find application by ID with vacancy relation
	 */
	findByIdWithVacancy(id: string): Promise<(Application & { vacancy: Vacancy | null }) | null>;

	/**
	 * Save domain Application entity (create or update)
	 */
	save(application: DomainApplication): Promise<Application>;

	/**
	 * Update application
	 */
	update(id: string, data: UpdateApplicationData): Promise<Application>;

	/**
	 * Delete application
	 */
	delete(id: string): Promise<Application>;
}

/**
 * Domain-specific data transfer object for updates
 */
export interface UpdateApplicationData {
	status?: string;
	transactionId?: string | null;
	candidateFamilyName?: string | null;
	candidateGivenName?: string | null;
	candidateDateOfBirth?: string | null;
	candidateNationality?: string | null;
	candidateEmail?: string | null;
	candidateMobilePhone?: string | null;
	verifiedCredentials?: Record<string, unknown> | null;
	signedContractUrl?: string | null;
	receiptIssued?: boolean;
	extrasTransactionId?: string | null;
}
