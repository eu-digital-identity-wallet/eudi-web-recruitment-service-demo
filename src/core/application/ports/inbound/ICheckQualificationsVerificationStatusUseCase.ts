/**
 * Inbound Port: Check Qualifications Verification Status
 */
export interface ICheckQualificationsVerificationStatusUseCase {
	execute(params: { applicationId: string; responseCode?: string }): Promise<boolean>;
}
