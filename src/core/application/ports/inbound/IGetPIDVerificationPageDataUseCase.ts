/**
 * Inbound Port: Get PID Verification Page Data Use Case
 *
 * Returns data needed for the PID verification waiting room page including access control
 */

export type PIDVerificationPageDTO = {
	application: {
		id: string;
		status: string;
		candidateFamilyName: string;
		candidateGivenName: string;
		candidateDateOfBirth: Date;
		candidateNationality: string;
		candidateEmail: string;
		candidateMobilePhone: string | null;
		updatedAt: Date;
		createdAt: Date;
		vacancy: {
			title: string;
			requiredCredentials: string[];
		} | null;
	};
	pageAccessResult: {
		allowed: boolean;
		notFound?: boolean;
	};
};

export interface IGetPIDVerificationPageDataUseCase {
	execute(applicationId: string): Promise<PIDVerificationPageDTO | null>;
}
