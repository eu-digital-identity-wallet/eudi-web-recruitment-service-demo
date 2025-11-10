/**
 * Inbound Port: Request Additional Credentials
 */
export interface IRequestAdditionalCredentialsUseCase {
	execute(data: {
		applicationId: string;
		credentialType: string[];
		sameDeviceFlow: boolean;
	}): Promise<{ url: string }>;
}
