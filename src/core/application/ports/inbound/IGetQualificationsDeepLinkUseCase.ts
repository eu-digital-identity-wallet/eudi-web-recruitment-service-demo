/**
 * Inbound Port: Get Qualifications Deep Link
 */
export interface IGetQualificationsDeepLinkUseCase {
	execute(applicationId: string): Promise<string>;
}
