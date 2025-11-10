/**
 * Inbound Port: Check Signing Status Use Case
 * Defines the contract for checking document signing status
 */
export interface ICheckSigningStatusUseCase {
	execute(applicationId: string): Promise<{
		status: string;
		signedAt?: Date | null;
		errorCode?: string | null;
	}>;
}
