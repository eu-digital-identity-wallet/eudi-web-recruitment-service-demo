/**
 * Inbound Port: Initiate Document Signing Use Case
 * Defines the contract for creating a signing transaction for an application
 */
export interface IInitiateDocumentSigningUseCase {
	execute(applicationId: string): Promise<{
		state: string;
		documentHash: string;
	}>;
}
