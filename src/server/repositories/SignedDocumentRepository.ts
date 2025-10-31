import 'server-only';
import { SignedDocument, Prisma } from '@prisma/client';

import { Service } from '@/server/container';
import { prisma } from '@/server/prisma';

@Service()
export class SignedDocumentRepository {
	/**
	 * Find signed document by state (transaction UUID)
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	async findByState(state: string): Promise<SignedDocument | null> {
		return prisma.signedDocument.findUnique({
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
		}) as Promise<SignedDocument | null>;
	}

	/**
	 * Find signed document with document content (for serving the PDF)
	 * Only use this when you actually need the document bytes
	 */
	async findByStateWithContent(state: string): Promise<SignedDocument | null> {
		return prisma.signedDocument.findUnique({
			where: { state },
		});
	}

	/**
	 * Find all signed documents for an application
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	async findByApplicationId(applicationId: string): Promise<SignedDocument[]> {
		return prisma.signedDocument.findMany({
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
		}) as Promise<SignedDocument[]>;
	}

	/**
	 * Find the most recent signed document for an application
	 * Excludes large binary fields by default to prevent ArrayBuffer detachment
	 */
	async findLatestByApplicationId(applicationId: string): Promise<SignedDocument | null> {
		return prisma.signedDocument.findFirst({
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
		}) as Promise<SignedDocument | null>;
	}

	/**
	 * Create new signed document record
	 */
	async create(data: Prisma.SignedDocumentCreateInput): Promise<SignedDocument> {
		return prisma.signedDocument.create({
			data,
		});
	}

	/**
	 * Update signed document
	 */
	async update(id: string, data: Prisma.SignedDocumentUpdateInput): Promise<SignedDocument> {
		return prisma.signedDocument.update({
			where: { id },
			data,
		});
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

		return this.update(document.id, data);
	}

	/**
	 * Delete signed document
	 */
	async delete(id: string): Promise<SignedDocument> {
		return prisma.signedDocument.delete({
			where: { id },
		});
	}
}
