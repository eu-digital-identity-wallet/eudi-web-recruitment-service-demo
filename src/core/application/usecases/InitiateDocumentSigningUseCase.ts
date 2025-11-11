import 'server-only';
import { Inject, Service } from 'typedi';

import { ApplicationMapper } from '@/core/domain';
import { ContractPdfGeneratorService } from '@/core/domain/services/signing/ContractPdfGeneratorService';
import { DocumentSigningService } from '@/core/domain/services/signing/ContractSigningService';
import { IApplicationRepositoryToken } from '@/core/infrastructure/config/container';

import type { IInitiateDocumentSigningUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';

/**
 * Use Case: Initiate Document Signing
 * Handles the creation of a signing transaction for an application
 *
 * This use case orchestrates:
 * 1. Verification that the application exists
 * 2. Generation of the employment contract PDF
 * 3. Initiation of the document signing process via domain service
 * 4. Returns the state UUID for tracking the signing transaction
 */
@Service()
export class InitiateDocumentSigningUseCase implements IInitiateDocumentSigningUseCase {
	constructor(
		@Inject() private readonly documentSigningService: DocumentSigningService,
		@Inject() private readonly pdfGeneratorService: ContractPdfGeneratorService,
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
	) {}

	public async execute(applicationId: string): Promise<{
		state: string;
		documentHash: string;
	}> {
		// Verify application exists
		const prismaApp = await this.applicationRepo.findByIdWithVacancy(applicationId);
		if (!prismaApp) {
			throw new Error('Application not found');
		}

		// Mark application as finalised if ready
		const app = ApplicationMapper.toDomain(prismaApp);
		if (app.canFinalise()) {
			app.markAsFinalised();
			await this.applicationRepo.update(applicationId, {
				status: app.getStatus(),
			});
		}

		// Mark application as signing
		const updatedApp = await this.applicationRepo.findById(applicationId);
		if (updatedApp) {
			const application = ApplicationMapper.toDomain(updatedApp);
			if (application.canStartSigning()) {
				application.markAsSigning();
				await this.applicationRepo.update(applicationId, {
					status: application.getStatus(),
				});
			}
		}

		// Generate professional PDF contract using pdf-lib
		const contractPdf = await this.pdfGeneratorService.generateEmploymentContract({
			applicationId: prismaApp.id,
			candidateGivenName: prismaApp.candidateGivenName,
			candidateFamilyName: prismaApp.candidateFamilyName,
			candidateEmail: prismaApp.candidateEmail,
			candidateDateOfBirth: prismaApp.candidateDateOfBirth,
			jobTitle: prismaApp.vacancy?.title || 'Position',
			jobDescription: prismaApp.vacancy?.description || 'Employment position as discussed',
			companyName: 'EUDI Demo Company',
			startDate: 'As mutually agreed',
		});

		// Initiate document signing through domain service
		const signedDocument = await this.documentSigningService.initDocumentSigning(
			applicationId,
			contractPdf,
			'employment_contract',
			'Employment_Contract.pdf',
		);

		return {
			state: signedDocument.getState(),
			documentHash: signedDocument.getDocumentHash(),
		};
	}
}
