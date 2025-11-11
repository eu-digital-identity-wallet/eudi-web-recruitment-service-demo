/**
 * Inbound Port: Get Credential QR Code Use Case
 * Defines the contract for retrieving credential offer URL for QR code generation
 */
export interface IGetCredentialQRCodeUseCase {
	execute(applicationId: string): Promise<string | null>;
}
