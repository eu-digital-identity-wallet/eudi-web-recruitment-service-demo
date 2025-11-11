/**
 * Inbound Port: Process Signed Document Use Case
 * Defines the contract for handling the callback from the wallet with the signed document
 */
export interface IProcessSignedDocumentUseCase {
	execute(params: {
		state: string;
		stateParam?: string;
		documentWithSignature?: string[];
		signatureObject?: string[];
		vpToken?: string;
		error?: string;
	}): Promise<{ success: boolean; message?: string; error?: string }>;
}
