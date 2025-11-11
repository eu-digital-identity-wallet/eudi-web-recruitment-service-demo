import 'server-only';
import { Inject, Service } from 'typedi';

import { ApplicationMapper } from '@/core/domain';
import {
	IApplicationRepositoryToken,
	IIssuerPortToken,
} from '@/core/infrastructure/config/container';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IIssueEmployeeIdUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IIssuerPort } from '@/core/application/ports/outbound/IIssuerPort';

/**
 * Use Case: Issue Employee ID
 * Issues an Employee ID credential via OpenID4VCI after contract signing
 */
@Service()
export class IssueEmployeeIdUseCase implements IIssueEmployeeIdUseCase {
	constructor(
		@Inject(IIssuerPortToken) private readonly issuer: IIssuerPort,
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
	) {}

	@ValidateInput(applicationIdSchema)
	public async execute(applicationId: string): Promise<{ offerUrl: string; otp?: string } | null> {
		const prismaApp = await this.applicationRepo.findByIdWithVacancy(applicationId);
		if (!prismaApp) return null;

		const application = ApplicationMapper.toDomain(prismaApp);

		// Business rule check: must be ready to start issuing
		if (!application.canStartIssuing()) {
			throw new Error(
				`Cannot issue credential. Application status is ${application.getStatus()}, must be SIGNED`,
			);
		}

		if (!application.hasValidCandidateInfo()) {
			throw new Error('Application is missing verified personal information');
		}

		if (!prismaApp.vacancy) {
			throw new Error('Application has no associated vacancy');
		}

		// Use issuer port to issue employee ID credential
		const offerResponse = await this.issuer.issueEmployeeId(
			prismaApp as typeof prismaApp & { vacancy: NonNullable<typeof prismaApp.vacancy> },
		);

		return { offerUrl: offerResponse.offerUrl, otp: offerResponse.otp };
	}
}
