/**
 * Inbound Ports (Primary/Driving Ports)
 *
 * These define WHAT the application DOES - the use case interfaces.
 * They represent the contract between the external world (controllers, CLI, etc.)
 * and the application core.
 *
 * In Hexagonal Architecture:
 * - Inbound ports are IMPLEMENTED by use cases
 * - Inbound ports are CALLED BY controllers (interface layer)
 */

export type { ICheckQualificationsVerificationStatusUseCase } from './ICheckQualificationsVerificationStatusUseCase';
export type { ICheckSigningStatusUseCase } from './ICheckSigningStatusUseCase';
export type { ICheckVerificationStatusUseCase } from './ICheckVerificationStatusUseCase';
export type { ICreateApplicationUseCase } from './ICreateApplicationUseCase';
export type { IGenerateDocumentJWTUseCase } from './IGenerateDocumentJWTUseCase';
export type { IGetApplicationDeepLinkUseCase } from './IGetApplicationDeepLinkUseCase';
export type { IGetApplicationDetailsUseCase } from './IGetApplicationDetailsUseCase';
export type { IGetApplicationFinalizationDataUseCase } from './IGetApplicationFinalizationDataUseCase';
export type { IGetCredentialQRCodeUseCase } from './IGetCredentialQRCodeUseCase';
export type { IGetDocumentForSigningUseCase } from './IGetDocumentForSigningUseCase';
export type { IGetEmployeePageDetailsUseCase } from './IGetEmployeePageDetailsUseCase';
export type { IGetIssuedCredentialUseCase } from './IGetIssuedCredentialUseCase';
export type { IGetPIDVerificationPageDataUseCase } from './IGetPIDVerificationPageDataUseCase';
export type { IGetQualificationsDeepLinkUseCase } from './IGetQualificationsDeepLinkUseCase';
export type { IGetQualificationsPageDataUseCase } from './IGetQualificationsPageDataUseCase';
export type { IGetSigningPageDetailsUseCase } from './IGetSigningPageDetailsUseCase';
export type { IGetSigningUrlUseCase } from './IGetSigningUrlUseCase';
export type { IGetSupplementaryCredentialsDeepLinkUseCase } from './IGetSupplementaryCredentialsDeepLinkUseCase';
export type { IGetVacancyByIdUseCase } from './IGetVacancyByIdUseCase';
export type { IGetVerifiedCredentialsUseCase } from './IGetVerifiedCredentialsUseCase';
export type { IInitiateDocumentSigningUseCase } from './IInitiateDocumentSigningUseCase';
export type { IIssueEmployeeIdUseCase } from './IIssueEmployeeIdUseCase';
export type { IListVacanciesUseCase } from './IListVacanciesUseCase';
export type { IProcessSignedDocumentUseCase } from './IProcessSignedDocumentUseCase';
export type { IRequestAdditionalCredentialsUseCase } from './IRequestAdditionalCredentialsUseCase';
