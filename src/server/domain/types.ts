/**
 * Shared domain types for the application
 */

/**
 * Represents the types of credentials that can be requested or verified
 * - NONE: No credentials required
 * - PID: Personal Identification Document
 * - DIPLOMA: Educational diploma certificate
 * - SEAFARER: Seafarer certificate
 * - TAXRESIDENCY: Tax Residency certificate
 */
export type CredentialType = 'NONE' | 'PID' | 'DIPLOMA' | 'SEAFARER' | 'TAXRESIDENCY';
