/**
 * Outbound Ports - Hexagonal Architecture
 *
 * These are the interfaces that the application layer defines for external services.
 * Infrastructure adapters will implement these interfaces.
 */

// External Service Ports
export * from './IVerifierPort';
export * from './IIssuerPort';
export * from './IKeystorePort';
export * from './ICredentialVerificationPort';
export * from './ICredentialIssuancePort';
export * from './IDocumentSigningPort';
export * from './ICryptographyPort';
export * from './IEventDispatcher';

// Database Repository Ports
export * from './IApplicationRepository';
export * from './IVacancyRepository';
export * from './IVerifiedCredentialRepository';
export * from './IIssuedCredentialRepository';
export * from './ISignedDocumentRepository';
