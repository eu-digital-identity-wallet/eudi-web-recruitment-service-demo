/**
 * Inbound Port: Get Tax Residency Page Data
 * Returns comprehensive data for the tax residency verification page including:
 * - Application details
 * - Pending tax residency credential check
 * - Page access control results
 */
export interface IGetTaxResidencyPageDataUseCase {
	execute(applicationId: string): Promise<TaxResidencyPageDTO | null>;
}

export type TaxResidencyPageDTO = {
	application: {
		id: string;
		status: string;
		candidateFamilyName?: string | null;
		candidateGivenName?: string | null;
		candidateDateOfBirth?: string | null;
		candidateNationality?: string | null;
		candidateEmail?: string | null;
		candidateMobilePhone?: string | null;
		updatedAt: Date;
		createdAt: Date;
		vacancy?: {
			title: string;
			requiredCredentials: string[];
		} | null;
	};
	pageAccessResult:
		| { allowed: true }
		| { allowed: false; redirect?: string }
		| { allowed: false; notFound: true };
};
