/**
 * Domain Events
 *
 * Domain events represent significant occurrences within the domain.
 * They enable loose coupling, better observability, and event-driven workflows.
 *
 * Usage pattern:
 * 1. Entity raises event when something important happens
 * 2. Entity stores event in internal collection
 * 3. Use case retrieves events and publishes them via EventBus
 * 4. Event handlers react to events (send emails, update analytics, etc.)
 */

export { DomainEvent } from './DomainEvent';
export { ApplicationVerified } from './ApplicationVerified';
export { QualificationVerified } from './QualificationVerified';
export { DocumentSigned } from './DocumentSigned';
export { CredentialIssued } from './CredentialIssued';
