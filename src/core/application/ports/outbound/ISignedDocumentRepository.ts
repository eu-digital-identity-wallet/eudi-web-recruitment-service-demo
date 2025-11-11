import type { SignedDocument } from '@/core/domain/model/SignedDocument';
import type { Prisma } from '@prisma/client';

/**
 * Port interface for SignedDocument repository (Outbound Port)
 * Application layer defines the contract, infrastructure layer implements it
 * Implemented by: PrismaSignedDocumentRepositoryAdapter
 * Defines operations for managing electronically signed documents (QES)
 */
export interface ISignedDocumentRepository {
	/**
	 * Find signed document by state (transaction UUID)
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	findByState(state: string): Promise<SignedDocument | null>;

	/**
	 * Find signed document with document content (for serving the PDF)
	 * Only use this when you actually need the document bytes
	 */
	findByStateWithContent(state: string): Promise<SignedDocument | null>;

	/**
	 * Find all signed documents for an application
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	findByApplicationId(applicationId: string): Promise<SignedDocument[]>;

	/**
	 * Find the most recent signed document for an application
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	findLatestByApplicationId(applicationId: string): Promise<SignedDocument | null>;

	/**
	 * Save domain SignedDocument entity (create or update)
	 */
	save(document: SignedDocument): Promise<SignedDocument>;

	/**
	 * Update signed document
	 */
	update(id: string, data: Prisma.SignedDocumentUpdateInput): Promise<SignedDocument>;

	/**
	 * Update by state (transaction UUID)
	 */
	updateByState(
		state: string,
		data: Prisma.SignedDocumentUpdateInput,
	): Promise<SignedDocument | null>;

	/**
	 * Delete signed document
	 */
	delete(id: string): Promise<SignedDocument>;
}
