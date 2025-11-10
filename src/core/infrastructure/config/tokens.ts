import { Token } from 'typedi';

import type {
	ICheckQualificationsVerificationStatusUseCase,
	ICheckSigningStatusUseCase,
	ICheckVerificationStatusUseCase,
	ICreateApplicationUseCase,
	IGenerateDocumentJWTUseCase,
	IGetApplicationDeepLinkUseCase,
	IGetApplicationDetailsUseCase,
	IGetCredentialQRCodeUseCase,
	IGetDocumentForSigningUseCase,
	IGetIssuedCredentialUseCase,
	IGetSigningPageDetailsUseCase,
	IGetSigningUrlUseCase,
	IGetSupplementaryCredentialsDeepLinkUseCase,
	IGetVacancyByIdUseCase,
	IGetVerifiedCredentialsUseCase,
	IInitiateDocumentSigningUseCase,
	IIssueEmployeeIdUseCase,
	IListVacanciesUseCase,
	IProcessSignedDocumentUseCase,
	IRequestAdditionalCredentialsUseCase,
} from '@/core/application/ports/inbound';
import type { IApplicationRepository } from '@/core/application/ports/outbound/IApplicationRepository';
import type { IIssuedCredentialRepository } from '@/core/application/ports/outbound/IIssuedCredentialRepository';
import type { IIssuerPort } from '@/core/application/ports/outbound/IIssuerPort';
import type { IKeystorePort } from '@/core/application/ports/outbound/IKeystorePort';
import type { ISignedDocumentRepository } from '@/core/application/ports/outbound/ISignedDocumentRepository';
import type { IVacancyRepository } from '@/core/application/ports/outbound/IVacancyRepository';
import type { IVerifiedCredentialRepository } from '@/core/application/ports/outbound/IVerifiedCredentialRepository';
import type { IVerifierPort } from '@/core/application/ports/outbound/IVerifierPort';

// OUTBOUND PORT TOKENS (Infrastructure → Domain)
export const IApplicationRepositoryToken = new Token<IApplicationRepository>(
	'IApplicationRepository',
);
export const IVacancyRepositoryToken = new Token<IVacancyRepository>('IVacancyRepository');
export const IVerifiedCredentialRepositoryToken = new Token<IVerifiedCredentialRepository>(
	'IVerifiedCredentialRepository',
);
export const ISignedDocumentRepositoryToken = new Token<ISignedDocumentRepository>(
	'ISignedDocumentRepository',
);
export const ICredentialRepositoryToken = new Token<IIssuedCredentialRepository>(
	'ICredentialRepository',
);
export const IVerifierPortToken = new Token<IVerifierPort>('IVerifierPort');
export const IIssuerPortToken = new Token<IIssuerPort>('IIssuerPort');
export const IKeystorePortToken = new Token<IKeystorePort>('IKeystorePort');

// INBOUND PORT TOKENS (Adapters → Application)
export const ICreateApplicationUseCaseToken = new Token<ICreateApplicationUseCase>(
	'ICreateApplicationUseCase',
);
export const IGetApplicationDeepLinkUseCaseToken = new Token<IGetApplicationDeepLinkUseCase>(
	'IGetApplicationDeepLinkUseCase',
);
export const IGetSupplementaryCredentialsDeepLinkUseCaseToken =
	new Token<IGetSupplementaryCredentialsDeepLinkUseCase>(
		'IGetSupplementaryCredentialsDeepLinkUseCase',
	);
export const ICheckVerificationStatusUseCaseToken = new Token<ICheckVerificationStatusUseCase>(
	'ICheckVerificationStatusUseCase',
);
export const IIssueEmployeeIdUseCaseToken = new Token<IIssueEmployeeIdUseCase>(
	'IIssueEmployeeIdUseCase',
);
export const IRequestAdditionalCredentialsUseCaseToken =
	new Token<IRequestAdditionalCredentialsUseCase>('IRequestAdditionalCredentialsUseCase');
export const ICheckQualificationsVerificationStatusUseCaseToken =
	new Token<ICheckQualificationsVerificationStatusUseCase>(
		'ICheckQualificationsVerificationStatusUseCase',
	);
export const IGetApplicationDetailsUseCaseToken = new Token<IGetApplicationDetailsUseCase>(
	'IGetApplicationDetailsUseCase',
);
export const IGetVerifiedCredentialsUseCaseToken = new Token<IGetVerifiedCredentialsUseCase>(
	'IGetVerifiedCredentialsUseCase',
);
export const IGetCredentialQRCodeUseCaseToken = new Token<IGetCredentialQRCodeUseCase>(
	'IGetCredentialQRCodeUseCase',
);
export const IGetSigningPageDetailsUseCaseToken = new Token<IGetSigningPageDetailsUseCase>(
	'IGetSigningPageDetailsUseCase',
);
export const IGetSigningUrlUseCaseToken = new Token<IGetSigningUrlUseCase>('IGetSigningUrlUseCase');
export const IGetIssuedCredentialUseCaseToken = new Token<IGetIssuedCredentialUseCase>(
	'IGetIssuedCredentialUseCase',
);
export const IListVacanciesUseCaseToken = new Token<IListVacanciesUseCase>('IListVacanciesUseCase');
export const IGetVacancyByIdUseCaseToken = new Token<IGetVacancyByIdUseCase>(
	'IGetVacancyByIdUseCase',
);
export const IInitiateDocumentSigningUseCaseToken = new Token<IInitiateDocumentSigningUseCase>(
	'IInitiateDocumentSigningUseCase',
);
export const IProcessSignedDocumentUseCaseToken = new Token<IProcessSignedDocumentUseCase>(
	'IProcessSignedDocumentUseCase',
);
export const IGenerateDocumentJWTUseCaseToken = new Token<IGenerateDocumentJWTUseCase>(
	'IGenerateDocumentJWTUseCase',
);
export const ICheckSigningStatusUseCaseToken = new Token<ICheckSigningStatusUseCase>(
	'ICheckSigningStatusUseCase',
);
export const IGetDocumentForSigningUseCaseToken = new Token<IGetDocumentForSigningUseCase>(
	'IGetDocumentForSigningUseCase',
);
