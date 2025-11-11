/**
 * Inbound Port: Get Qualifications Page Data
 * Returns comprehensive data for the qualifications verification page including:
 * - Application details
 * - Pending professional qualifications
 * - Credential type labels
 * - Page access control results
 */
export interface IGetQualificationsPageDataUseCase {
	execute(applicationId: string): Promise<QualificationsPageDTO | null>;
}

export type QualificationsPageDTO = {
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
	credentialTypeLabel: string;
	pageAccessResult:
		| { allowed: true }
		| { allowed: false; redirect?: string }
		| { allowed: false; notFound: true };
};
