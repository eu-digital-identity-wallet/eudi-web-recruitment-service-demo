import 'server-only';
import { Service } from 'typedi';

import { GetApplicationDetailsUseCase } from '@/core/application/usecases/GetApplicationDetailsUseCase';
import { GetVerifiedCredentialsUseCase } from '@/core/application/usecases/GetVerifiedCredentialsUseCase';
import { Container } from '@/core/infrastructure/config/container';
import { applicationIdSchema } from '@/core/shared/types/schemas/application';
import { ValidateInput } from '@/core/shared/utils/decorators/validate-input';

import type { IGetEmployeePageDetailsUseCase } from '@/core/application/ports/inbound';
import type { Application } from '@prisma/client';

/**
 * DTO for Verified Credential - plain data structure for presentation layer
 */
export type VerifiedCredentialDTO = {
	id: string;
	credentialType: string;
	credentialData: Record<string, unknown>;
	status: string;
	verifiedAt: Date | null;
};

/**
 * DTO for Employee Page Details - plain data structure for presentation layer
 */
export type EmployeePageDetailsDTO = {
	application: Application & { vacancy: { title: string; description: string } | null };
	verifiedCredentials: VerifiedCredentialDTO[];
	professionalQualifications: VerifiedCredentialDTO[];
} | null;

/**
 * Use Case: Get Employee Page Details
 * Retrieves application details and verified credentials for the employee credential issuance page
 * Composes other use cases to gather all necessary data
 * Returns DTO (plain object) to avoid exposing domain layer to presentation layer
 */
@Service()
export class GetEmployeePageDetailsUseCase implements IGetEmployeePageDetailsUseCase {
	@ValidateInput(applicationIdSchema)
	public async execute(applicationId: string): Promise<EmployeePageDetailsDTO> {
		// Compose other use cases using Container.get()
		const getDetailsUseCase = Container.get(GetApplicationDetailsUseCase);
		const getCredentialsUseCase = Container.get(GetVerifiedCredentialsUseCase);

		// Fetch application details
		const application = await getDetailsUseCase.execute(applicationId);
		if (!application) return null;

		// Page access control: Employee page is accessible when contract is signed
		const allowedStatuses = ['SIGNED', 'ISSUING', 'ISSUED'];
		if (!allowedStatuses.includes(application.status)) {
			return null;
		}

		// Fetch verified credentials - already returns DTOs
		const verifiedCredentials = await getCredentialsUseCase.execute(applicationId);

		// Filter professional qualifications (Diploma, Seafarer) - using plain strings
		const professionalQualifications = verifiedCredentials.filter(
			(cred) =>
				cred.status === 'VERIFIED' &&
				(cred.credentialType === 'DIPLOMA' || cred.credentialType === 'SEAFARER'),
		);

		return {
			application,
			verifiedCredentials,
			professionalQualifications,
		};
	}
}
