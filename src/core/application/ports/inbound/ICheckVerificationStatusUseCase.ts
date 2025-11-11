/**
 * Inbound Port: Check Verification Status
 */
export interface ICheckVerificationStatusUseCase {
	execute(params: { applicationId: string; responseCode?: string }): Promise<boolean>;
}
