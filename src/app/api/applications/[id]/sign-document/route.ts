// src/app/api/applications/[id]/sign-document/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/server';
import { ApplicationRepository } from '@/server/repositories/ApplicationRepository';
import { ContractPdfGeneratorService } from '@/server/services/signing/ContractPdfGeneratorService';
import { DocumentSigningService } from '@/server/services/signing/ContractSigningService';

import type { NextRequest } from 'next/server';

/**
 * POST /api/applications/[id]/sign-document
 *
 * Initiates document signing flow for an application
 * Creates a signing transaction and returns the state UUID
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const documentSigningService = Container.get(DocumentSigningService);
		const pdfGeneratorService = Container.get(ContractPdfGeneratorService);
		const applicationRepo = Container.get(ApplicationRepository);

		// Verify application exists
		const application = await applicationRepo.findByIdWithJob(id);
		if (!application) {
			return NextResponse.json({ error: 'Application not found' }, { status: 404 });
		}

		// Generate professional PDF contract using pdf-lib
		const contractPdf = await pdfGeneratorService.generateEmploymentContract({
			applicationId: application.id,
			candidateGivenName: application.candidateGivenName,
			candidateFamilyName: application.candidateFamilyName,
			candidateEmail: application.candidateEmail,
			candidateDateOfBirth: application.candidateDateOfBirth,
			jobTitle: application.job?.title || 'Position',
			jobDescription: application.job?.description || 'Employment position as discussed',
			companyName: 'EUDI Demo Company',
			startDate: 'As mutually agreed',
		});

		// Initiate document signing
		const signedDocument = await documentSigningService.initDocumentSigning(
			id,
			contractPdf,
			'employment_contract',
			'Employment_Contract.pdf',
		);

		return NextResponse.json({
			state: signedDocument.state,
			documentHash: signedDocument.documentHash,
		});
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Invalid request';
		console.error('[sign-document] Error:', msg);
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
