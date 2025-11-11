/**
 * Inbound Port: Generate Document JWT Use Case
 * Defines the contract for generating signed JWT for document retrieval
 */
export interface IGenerateDocumentJWTUseCase {
	execute(state: string): Promise<string>;
}
