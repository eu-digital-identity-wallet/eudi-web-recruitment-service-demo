/**
 * Inbound Port: Get Document For Signing Use Case
 * Defines the contract for retrieving document content for wallet to sign
 */
export interface IGetDocumentForSigningUseCase {
	execute(state: string): Promise<Buffer | null>;
}
