/**
 * Inbound Port: Get Application Deep Link
 */
export interface IGetApplicationDeepLinkUseCase {
	execute(applicationId: string): Promise<string>;
}
