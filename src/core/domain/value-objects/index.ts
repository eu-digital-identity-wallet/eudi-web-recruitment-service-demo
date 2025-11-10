/**
 * Domain Value Objects
 *
 * Value objects are immutable objects that represent descriptive aspects of the domain.
 * They have no conceptual identity and are defined only by their attributes.
 *
 * Key characteristics:
 * - Immutable (cannot be changed after creation)
 * - Equality based on attributes, not identity
 * - Self-validating (invalid state cannot exist)
 * - Encapsulate domain concepts and invariants
 *
 * Benefits:
 * - Type safety (prevents primitive obsession)
 * - Compile-time error detection
 * - Encapsulated validation logic
 * - More expressive domain model
 */

// Identifiers
export { ApplicationId } from './ApplicationId';
export { VacancyId } from './VacancyId';
export { TransactionId } from './TransactionId';
export { EntityId } from './EntityId';

// Security & Authentication
export { DocumentHash } from './DocumentHash';
export { Nonce } from './Nonce';
export { PreAuthorizedCode } from './PreAuthorizedCode';
export { State } from './State';

// Credentials
export { CredentialType } from './CredentialType';
export { Namespace } from './Namespace';
export { CredentialData } from './CredentialData';
export { Otp } from './Otp';

// Personal Information
export { Email } from './Email';
export { FamilyName } from './FamilyName';
export { GivenName } from './GivenName';
export { MobilePhone } from './MobilePhone';
export { DateOfBirth } from './DateOfBirth';
export { Nationality } from './Nationality';

// Descriptive Fields
export { Title } from './Title';
export { Description } from './Description';
export { Url } from './Url';

// Document Signing
export { DocumentType } from './DocumentType';
export { DocumentLabel } from './DocumentLabel';
export { SignatureObject } from './SignatureObject';
export { SignatureQualifier } from './SignatureQualifier';
export { SignerCertificate } from './SignerCertificate';
export { ErrorCode } from './ErrorCode';

// Timestamps
export { CreatedAt, VerifiedAt, ExpiresAt, SignedAt, Timestamp } from './Timestamp';
