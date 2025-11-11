/**
 * Inbound Port: Get PID Verification Page Data Use Case
 *
 * Returns data needed for the PID verification waiting room page including access control
 */

export type PIDVerificationPageDTO = {
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

export interface IGetPIDVerificationPageDataUseCase {
	execute(applicationId: string): Promise<PIDVerificationPageDTO | null>;
}
