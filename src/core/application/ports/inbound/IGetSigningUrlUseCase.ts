/**
 * Inbound Port: Get Signing URL Use Case
 * Defines the contract for generating signing URL for debugging/testing
 */
export interface IGetSigningUrlUseCase {
	execute(applicationId: string): Promise<{
		signingUrl: string;
		components: {
			baseUrl: string;
			requestUri: string;
			clientId: string;
			state: string;
		};
		decoded: {
			fullUrl: string;
			queryParams: {
				request_uri: string;
				client_id: string;
			};
		};
	}>;
}
