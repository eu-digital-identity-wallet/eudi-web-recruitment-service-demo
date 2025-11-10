/**
 * Shared types for component props
 * These are plain object representations of domain models
 */

/**
 * Plain object type for verified credentials (transformed from domain model)
 * Used throughout the component hierarchy to pass credential data to client components
 *
 * This type is intentionally NOT using the VerifiedCredential domain model class
 * to avoid serialization issues when passing data from server to client components.
 */
export type VerifiedCredentialData = {
	readonly id: string;
	readonly credentialType: string;
	readonly credentialData: Record<string, unknown>;
	readonly status: string;
	readonly verifiedAt: Date | null;
};
