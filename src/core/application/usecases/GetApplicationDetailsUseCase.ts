import 'server-only';
import { Inject, Service } from 'typedi';

import { IApplicationRepositoryToken } from '@/core/infrastructure/config/container';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetApplicationDetailsUseCase } from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';

/**
 * Use Case: Get Application Details
 * Fetches application details with associated job
 */
@Service()
export class GetApplicationDetailsUseCase implements IGetApplicationDetailsUseCase {
	constructor(
		@Inject(IApplicationRepositoryToken) private readonly applicationRepo: IApplicationRepository,
	) {}

	@ValidateInput(applicationIdSchema)
	public async execute(applicationId: string) {
		return this.applicationRepo.findByIdWithVacancy(applicationId);
	}
}
