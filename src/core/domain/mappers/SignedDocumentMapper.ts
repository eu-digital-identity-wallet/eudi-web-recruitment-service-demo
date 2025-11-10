import { SignedDocument, type SigningStatus } from '@/core/domain/model/SignedDocument';

import type { SignedDocument as PrismaSignedDocument } from '@prisma/client';

export class SignedDocumentMapper {
	/**
	 * Convert Prisma model to Domain entity
	 */
	static toDomain(prismaDoc: PrismaSignedDocument): SignedDocument {
		return SignedDocument.reconstitute({
			id: prismaDoc.id,
			applicationId: prismaDoc.applicationId,
			documentHash: prismaDoc.documentHash,
			documentType: prismaDoc.documentType,
			documentLabel: prismaDoc.documentLabel,
			documentContent: prismaDoc.documentContent ? Buffer.from(prismaDoc.documentContent) : null,
			state: prismaDoc.state,
			nonce: prismaDoc.nonce,
			documentWithSignature: prismaDoc.documentWithSignature
				? Buffer.from(prismaDoc.documentWithSignature)
				: null,
			signatureObject: prismaDoc.signatureObject,
			signatureQualifier: prismaDoc.signatureQualifier,
			signerCertificate: prismaDoc.signerCertificate,
			status: prismaDoc.status as SigningStatus,
			errorCode: prismaDoc.errorCode,
			signedAt: prismaDoc.signedAt,
			createdAt: prismaDoc.createdAt,
		});
	}

	/**
	 * Convert Domain entity to Prisma update data
	 */
	static toPersistence(domain: SignedDocument): Omit<PrismaSignedDocument, 'applicationId'> {
		return {
			id: domain.getId(),
			documentHash: domain.getDocumentHash(),
			documentType: domain.getDocumentType(),
			documentLabel: domain.getDocumentLabel(),
			documentContent: domain.getDocumentContent(),
			state: domain.getState(),
			nonce: domain.getNonce(),
			documentWithSignature: domain.getDocumentWithSignature(),
			signatureObject: domain.getSignatureObject(),
			signatureQualifier: domain.getSignatureQualifier(),
			signerCertificate: domain.getSignerCertificate(),
			status: domain.getStatus(),
			errorCode: domain.getErrorCode(),
			signedAt: domain.getSignedAt(),
			createdAt: domain.getCreatedAt(),
		};
	}
}
