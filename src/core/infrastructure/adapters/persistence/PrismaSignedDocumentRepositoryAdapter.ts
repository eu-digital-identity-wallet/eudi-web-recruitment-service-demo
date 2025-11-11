import 'server-only';
import { Prisma } from '@prisma/client';

import { SignedDocumentMapper } from '@/core/domain/mappers/SignedDocumentMapper';
import { Service } from '@/core/infrastructure/config/container';
import { prisma } from '@/core/prisma';

import type { ISignedDocumentRepository } from '@/core/application/ports/outbound/ISignedDocumentRepository';
import type { SignedDocument } from '@/core/domain/model/SignedDocument';

/**
 * Prisma adapter implementing ISignedDocumentRepository port
 * Translates domain operations to Prisma-specific calls
 */
@Service()
export class PrismaSignedDocumentRepositoryAdapter implements ISignedDocumentRepository {
	/**
	 * Find signed document by state (transaction UUID)
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	async findByState(state: string): Promise<SignedDocument | null> {
		const prismaDoc = await prisma.signedDocument.findUnique({
			where: { state },
			select: {
				id: true,
				applicationId: true,
				documentHash: true,
				documentType: true,
				documentLabel: true,
				documentContent: false, // Exclude by default
				state: true,
				nonce: true,
				documentWithSignature: false, // Exclude by default
				signatureObject: true,
				signatureQualifier: true,
				signerCertificate: true,
				status: true,
				errorCode: true,
				signedAt: true,
				createdAt: true,
			},
		});

		if (!prismaDoc) return null;

		// Add null values for excluded fields
		return SignedDocumentMapper.toDomain({
			...prismaDoc,
			documentContent: null,
			documentWithSignature: null,
		});
	}

	/**
	 * Find signed document with document content (for serving the PDF)
	 * Only use this when you actually need the document bytes
	 */
	async findByStateWithContent(state: string): Promise<SignedDocument | null> {
		const prismaDoc = await prisma.signedDocument.findUnique({
			where: { state },
		});

		return prismaDoc ? SignedDocumentMapper.toDomain(prismaDoc) : null;
	}

	/**
	 * Find all signed documents for an application
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	async findByApplicationId(applicationId: string): Promise<SignedDocument[]> {
		const prismaDocs = await prisma.signedDocument.findMany({
			where: { applicationId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				applicationId: true,
				documentHash: true,
				documentType: true,
				documentLabel: true,
				documentContent: false, // Exclude by default
				state: true,
				nonce: true,
				documentWithSignature: false, // Exclude by default
				signatureObject: true,
				signatureQualifier: true,
				signerCertificate: true,
				status: true,
				errorCode: true,
				signedAt: true,
				createdAt: true,
			},
		});

		return prismaDocs.map((doc) =>
			SignedDocumentMapper.toDomain({
				...doc,
				documentContent: null,
				documentWithSignature: null,
			}),
		);
	}

	/**
	 * Find the most recent signed document for an application
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	async findLatestByApplicationId(applicationId: string): Promise<SignedDocument | null> {
		const prismaDoc = await prisma.signedDocument.findFirst({
			where: { applicationId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				applicationId: true,
				documentHash: true,
				documentType: true,
				documentLabel: true,
				documentContent: false, // Exclude by default
				state: true,
				nonce: true,
				documentWithSignature: false, // Exclude by default
				signatureObject: true,
				signatureQualifier: true,
				signerCertificate: true,
				status: true,
				errorCode: true,
				signedAt: true,
				createdAt: true,
			},
		});

		if (!prismaDoc) return null;

		return SignedDocumentMapper.toDomain({
			...prismaDoc,
			documentContent: null,
			documentWithSignature: null,
		});
	}

	/**
	 * Save domain SignedDocument entity (create new)
	 */
	async save(document: SignedDocument): Promise<SignedDocument> {
		// Convert domain entity to Prisma data using mapper
		const persistence = SignedDocumentMapper.toPersistence(document);

		// Create new signed document in database
		const prismaDoc = await prisma.signedDocument.create({
			data: {
				...persistence,
				application: { connect: { id: document.getApplicationId() } },
			},
		});

		return SignedDocumentMapper.toDomain(prismaDoc);
	}

	/**
	 * Update signed document
	 */
	async update(id: string, data: Prisma.SignedDocumentUpdateInput): Promise<SignedDocument> {
		const prismaDoc = await prisma.signedDocument.update({
			where: { id },
			data,
		});

		return SignedDocumentMapper.toDomain(prismaDoc);
	}

	/**
	 * Update by state (transaction UUID)
	 */
	async updateByState(
		state: string,
		data: Prisma.SignedDocumentUpdateInput,
	): Promise<SignedDocument | null> {
		const document = await this.findByState(state);
		if (!document) return null;

		return this.update(document.getId(), data);
	}

	/**
	 * Delete signed document
	 */
	async delete(id: string): Promise<SignedDocument> {
		const prismaDoc = await prisma.signedDocument.delete({
			where: { id },
		});

		return SignedDocumentMapper.toDomain(prismaDoc);
	}
}
