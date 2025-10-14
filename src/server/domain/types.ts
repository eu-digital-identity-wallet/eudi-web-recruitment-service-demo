/**
 * Shared domain types for the application
 */

/**
 * Represents the types of credentials that can be requested or verified
 * - NONE: No credentials required
 * - PID: Personal Identification Document
 * - DIPLOMA: Educational diploma certificate
 * - SEAFARER: Seafarer certificate
 * - BOTH: Both diploma and seafarer certificates
 */
export type CredentialType = 'NONE' | 'PID' | 'DIPLOMA' | 'SEAFARER' | 'BOTH';
