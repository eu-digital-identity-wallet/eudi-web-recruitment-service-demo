/**
 * VerifiedCredential - Domain Entity
 *
 * Represents a credential that has been verified from a user's wallet via OpenID4VP.
 * Contains business rules for credential verification lifecycle and status transitions.
 */

import { QualificationVerified } from '@/core/domain/events/QualificationVerified';
import {
	ApplicationId,
	CreatedAt,
	CredentialData,
	CredentialType,
	EntityId,
	Namespace,
	TransactionId,
	Url,
	VerifiedAt,
} from '@/core/domain/value-objects';

import type { DomainEvent } from '@/core/domain/events';

export enum VerificationStatus {
	PENDING = 'PENDING',
	VERIFIED = 'VERIFIED',
	FAILED = 'FAILED',
}

/**
 * EUDI Wallet Credential Namespace Constants
 *
 * Two namespace formats are used:
 * 1. Official EUDI ARF format (mdoc): eu.europa.ec.eudi.[type].[version]
 *    - Used for PID credentials in mdoc/CBOR format
 *    - Reference: EUDI Wallet ARF Annex 3.1 - PID Rulebook
 *
 * 2. URN format (SD-JWT): urn:eu.europa.ec.eudi:[type]:[version]:[variant]
 *    - Used for SD-JWT credentials (Diploma, Seafarer, Tax Residency)
 *    - Returned in the 'vct' (verifiable credential type) field of SD-JWT
 *
 * The namespace format depends on the credential encoding:
 * - mdoc/CBOR credentials use dot notation
 * - SD-JWT credentials use URN notation with colons
 */
export const CredentialNamespace = {
	// Official EUDI ARF specification
	PID: 'eu.europa.ec.eudi.pid.1', //MSO MDoc format
	DIPLOMA: 'urn:eu.europa.ec.eudi:diploma:1:1', //SD-JWT VC format
	SEAFARER: 'eu.europa.ec.eudi.seafarer.1', //MSO MDoc format
	TAXRESIDENCY: 'urn:eu.europa.ec.eudi:tax:1:1', //SD-JWT VC format
} as const;

export type CredentialNamespaceType =
	(typeof CredentialNamespace)[keyof typeof CredentialNamespace];

export class VerifiedCredential {
	private domainEvents: DomainEvent[] = [];

	private constructor(
		private readonly id: EntityId,
		private readonly applicationId: ApplicationId,
		private readonly credentialType: CredentialType,
		private readonly namespace: Namespace,
		private readonly verifierTransactionId: TransactionId,
		private readonly verifierRequestUri: Url,
		private readonly credentialData: CredentialData,
		private status: VerificationStatus,
		private verifiedAt: VerifiedAt | null,
		private readonly createdAt: CreatedAt,
	) {}

	/**
	 * Static Method: Map EUDI namespace to CredentialType string
	 *
	 * Maps namespace identifiers to credential type strings.
	 * Handles both mdoc format (dot notation) and SD-JWT format (URN notation).
	 *
	 * @param namespace - The namespace from the OpenID4VP response (from vct field for SD-JWT, or namespace for mdoc)
	 * @returns The corresponding credential type string or null if not recognized
	 */
	static mapNamespaceToCredentialType(namespace: string): string | null {
		const namespaceMap: Record<string, string> = {
			[CredentialNamespace.PID]: CredentialType.PID.getValue(),
			[CredentialNamespace.DIPLOMA]: CredentialType.DIPLOMA.getValue(),
			[CredentialNamespace.SEAFARER]: CredentialType.SEAFARER.getValue(),
			[CredentialNamespace.TAXRESIDENCY]: CredentialType.TAXRESIDENCY.getValue(),
		};

		return namespaceMap[namespace] ?? null;
	}

	// Factory method for creating new verified credentials
	static create(data: {
		id: string;
		applicationId: string;
		credentialType: string;
		namespace: string;
		verifierTransactionId: string;
		verifierRequestUri: string;
		credentialData: Record<string, unknown>;
	}): VerifiedCredential {
		return new VerifiedCredential(
			EntityId.create(data.id),
			ApplicationId.create(data.applicationId),
			CredentialType.fromString(data.credentialType),
			Namespace.create(data.namespace),
			TransactionId.create(data.verifierTransactionId),
			Url.create(data.verifierRequestUri),
			CredentialData.create(data.credentialData),
			VerificationStatus.PENDING,
			null, // verifiedAt
			CreatedAt.now(),
		);
	}

	// Factory method for reconstituting from database
	static reconstitute(data: {
		id: string;
		applicationId: string;
		credentialType: string;
		namespace: string;
		verifierTransactionId: string;
		verifierRequestUri: string;
		credentialData: Record<string, unknown>;
		status: VerificationStatus;
		verifiedAt: Date | null;
		createdAt: Date;
	}): VerifiedCredential {
		return new VerifiedCredential(
			EntityId.create(data.id),
			ApplicationId.create(data.applicationId),
			CredentialType.fromString(data.credentialType),
			Namespace.create(data.namespace),
			TransactionId.create(data.verifierTransactionId),
			Url.create(data.verifierRequestUri),
			CredentialData.create(data.credentialData),
			data.status,
			data.verifiedAt ? VerifiedAt.create(data.verifiedAt) : null,
			CreatedAt.create(data.createdAt),
		);
	}

	// Business Rules

	/**
	 * Business Rule: Credential can only be verified if currently pending
	 */
	canBeVerified(): boolean {
		return this.status === VerificationStatus.PENDING;
	}

	/**
	 * Business Rule: Check if credential has been successfully verified
	 */
	isVerified(): boolean {
		return this.status === VerificationStatus.VERIFIED;
	}

	/**
	 * Business Rule: Check if credential verification has failed
	 */
	hasFailed(): boolean {
		return this.status === VerificationStatus.FAILED;
	}

	/**
	 * Business Rule: Check if credential is still pending verification
	 */
	isPending(): boolean {
		return this.status === VerificationStatus.PENDING;
	}

	// Commands (state changes)

	/**
	 * Command: Mark credential as successfully verified
	 * Raises QualificationVerified event for qualifications (DIPLOMA, SEAFARER, TAXRESIDENCY)
	 */
	markAsVerified(): void {
		if (!this.canBeVerified()) {
			throw new Error('Credential cannot be verified: not in pending status');
		}
		this.status = VerificationStatus.VERIFIED;
		this.verifiedAt = VerifiedAt.now();

		// Raise domain event for qualifications (not PID, as that raises ApplicationVerified)
		if (
			this.credentialType.equals(CredentialType.DIPLOMA) ||
			this.credentialType.equals(CredentialType.SEAFARER) ||
			this.credentialType.equals(CredentialType.TAXRESIDENCY)
		) {
			this.addDomainEvent(
				new QualificationVerified(
					this.applicationId.getValue(),
					this.credentialType.getValue(),
					this.namespace.getValue(),
				),
			);
		}
	}

	/**
	 * Command: Mark credential verification as failed
	 */
	markAsFailed(): void {
		if (!this.canBeVerified()) {
			throw new Error('Credential cannot be marked as failed: not in pending status');
		}
		this.status = VerificationStatus.FAILED;
	}

	// Queries (getters)

	getId(): string {
		return this.id.getValue();
	}

	getApplicationId(): string {
		return this.applicationId.getValue();
	}

	getCredentialType(): string {
		return this.credentialType.getValue();
	}

	getNamespace(): string {
		return this.namespace.getValue();
	}

	getVerifierTransactionId(): string {
		return this.verifierTransactionId.getValue();
	}

	getVerifierRequestUri(): string {
		return this.verifierRequestUri.getValue();
	}

	getCredentialData(): Record<string, unknown> {
		return this.credentialData.getValue();
	}

	getStatus(): VerificationStatus {
		return this.status;
	}

	getVerifiedAt(): Date | null {
		return this.verifiedAt ? this.verifiedAt.getValue() : null;
	}

	getCreatedAt(): Date {
		return this.createdAt.getValue();
	}

	/**
	 * Get formatted capacities string for display purposes
	 * Handles both array and string formats from credential data
	 */
	getFormattedCapacities(): string | null {
		const capacities = this.credentialData.getClaim('capacities');

		if (!capacities) {
			return null;
		}

		// Type guard for capacity array item
		interface CapacityItem {
			capacity_code?: string;
		}

		// Handle array format (extract capacity_code from each item)
		if (Array.isArray(capacities)) {
			const codes = capacities
				.map((item: unknown) => {
					if (typeof item === 'object' && item !== null && 'capacity_code' in item) {
						const capacityItem = item as CapacityItem;
						return capacityItem.capacity_code || '';
					}
					return '';
				})
				.filter((code) => code !== '');

			return codes.length > 0 ? codes.join(', ') : null;
		}

		// Handle string or other formats
		return String(capacities);
	}

	// Domain Events

	/**
	 * Add a domain event to be published later
	 */
	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	/**
	 * Get all domain events raised by this entity
	 */
	getDomainEvents(): readonly DomainEvent[] {
		return [...this.domainEvents];
	}

	/**
	 * Clear domain events after they've been published
	 */
	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}
