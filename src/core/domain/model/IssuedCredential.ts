/**
 * IssuedCredential - Domain Entity
 *
 * Represents a credential that has been issued to a user's wallet via OpenID4VCI.
 * Contains business rules for credential lifecycle (expiration, claiming, etc.)
 */

import { CredentialIssued } from '@/core/domain/events';
import {
	ApplicationId,
	CreatedAt,
	CredentialData,
	CredentialType,
	EntityId,
	ExpiresAt,
	Otp,
	PreAuthorizedCode,
	Url,
} from '@/core/domain/value-objects';

import type { DomainEvent } from '@/core/domain/events';

export class IssuedCredential {
	private domainEvents: DomainEvent[] = [];

	private constructor(
		private readonly id: EntityId,
		private readonly applicationId: ApplicationId,
		private readonly preAuthorizedCode: PreAuthorizedCode,
		private readonly credentialOfferUrl: Url | null,
		private readonly otp: Otp | null,
		private readonly credentialType: CredentialType,
		private readonly credentialData: CredentialData,
		private claimed: boolean,
		private readonly claimedAt: Date | null,
		private readonly expiresAt: ExpiresAt,
		private readonly createdAt: CreatedAt,
	) {}

	// Factory method for creating new issued credentials
	static create(data: {
		id: string;
		applicationId: string;
		preAuthorizedCode: string;
		credentialOfferUrl: string | null;
		otp: string | null;
		credentialType: string;
		credentialData: Record<string, unknown>;
		expiresAt: Date;
	}): IssuedCredential {
		const credential = new IssuedCredential(
			EntityId.create(data.id),
			ApplicationId.create(data.applicationId),
			PreAuthorizedCode.create(data.preAuthorizedCode),
			data.credentialOfferUrl ? Url.create(data.credentialOfferUrl) : null,
			data.otp ? Otp.create(data.otp) : null,
			CredentialType.fromString(data.credentialType),
			CredentialData.create(data.credentialData),
			false, // claimed
			null, // claimedAt
			ExpiresAt.create(data.expiresAt),
			CreatedAt.now(),
		);

		// Raise domain event - extract recipient name from credential data
		const givenName = (data.credentialData.given_name as string) || '';
		const familyName = (data.credentialData.family_name as string) || '';
		const recipientName = `${givenName} ${familyName}`.trim() || 'Unknown';

		credential.addDomainEvent(
			new CredentialIssued(data.id, data.applicationId, data.credentialType, recipientName),
		);

		return credential;
	}

	// Factory method for reconstituting from database
	static reconstitute(data: {
		id: string;
		applicationId: string;
		preAuthorizedCode: string;
		credentialOfferUrl: string | null;
		otp: string | null;
		credentialType: string;
		credentialData: Record<string, unknown>;
		claimed: boolean;
		claimedAt: Date | null;
		expiresAt: Date;
		createdAt: Date;
	}): IssuedCredential {
		return new IssuedCredential(
			EntityId.create(data.id),
			ApplicationId.create(data.applicationId),
			PreAuthorizedCode.create(data.preAuthorizedCode),
			data.credentialOfferUrl ? Url.create(data.credentialOfferUrl) : null,
			data.otp ? Otp.create(data.otp) : null,
			CredentialType.fromString(data.credentialType),
			CredentialData.create(data.credentialData),
			data.claimed,
			data.claimedAt,
			ExpiresAt.create(data.expiresAt),
			CreatedAt.create(data.createdAt),
		);
	}

	// Business Rules

	/**
	 * Business Rule: Credential can only be claimed if not already claimed and not expired
	 */
	canBeClaimed(): boolean {
		return !this.claimed && !this.isExpired();
	}

	/**
	 * Business Rule: Check if credential has expired
	 */
	isExpired(): boolean {
		return this.expiresAt.isExpired();
	}

	/**
	 * Business Rule: Check if credential requires OTP/PIN
	 */
	requiresOtp(): boolean {
		return this.otp !== null;
	}

	/**
	 * Business Rule: Check if credential has a valid offer URL
	 */
	hasOfferUrl(): boolean {
		return this.credentialOfferUrl !== null;
	}

	// Commands (state changes)

	/**
	 * Command: Mark credential as claimed by the wallet
	 */
	markAsClaimed(): void {
		if (!this.canBeClaimed()) {
			throw new Error('Credential cannot be claimed: already claimed or expired');
		}
		this.claimed = true;
	}

	// Queries (getters)

	getId(): string {
		return this.id.getValue();
	}

	getApplicationId(): string {
		return this.applicationId.getValue();
	}

	getPreAuthorizedCode(): string {
		return this.preAuthorizedCode.getValue();
	}

	getCredentialOfferUrl(): string | null {
		return this.credentialOfferUrl ? this.credentialOfferUrl.getValue() : null;
	}

	getOtp(): string | null {
		return this.otp ? this.otp.getValue() : null;
	}

	getCredentialType(): string {
		return this.credentialType.getValue();
	}

	getCredentialData(): Record<string, unknown> {
		return this.credentialData.getValue();
	}

	isClaimed(): boolean {
		return this.claimed;
	}

	getClaimedAt(): Date | null {
		return this.claimedAt;
	}

	getExpiresAt(): Date {
		return this.expiresAt.getValue();
	}

	getCreatedAt(): Date {
		return this.createdAt.getValue();
	}

	// Domain Events

	/**
	 * Add a domain event to be published later
	 */
	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	/**
	 * Get all domain events raised by this aggregate
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
