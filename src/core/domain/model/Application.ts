import { ApplicationVerified } from '@/core/domain/events';
import { ApplicationId, VacancyId } from '@/core/domain/value-objects';

import type { DomainEvent } from '@/core/domain/events/DomainEvent';
import type { CandidateInfo } from '@/core/domain/model/CandidateInfo';

/**
 * Application Domain Entity (Aggregate Root)
 *
 * Represents a job application in the EUDI recruitment workflow.
 * This is the core domain entity that orchestrates the entire application lifecycle
 * from creation through verification, qualification, signing, and credential issuance.
 *
 * Following Domain-Driven Design principles:
 * - Encapsulates business rules and invariants
 * - Maintains consistency boundaries
 * - Raises domain events for cross-aggregate communication
 * - Uses value objects to prevent primitive obsession
 *
 * Architecture: Hexagonal Architecture (Ports & Adapters) + Clean Architecture
 * - Domain layer is isolated from infrastructure concerns
 * - All dependencies point inward toward the domain
 * - Business logic is framework-agnostic
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Οὔτε δὴ φύσει οὔτε παρὰ φύσιν ἐγγίνονται αἱ ἀρεταί,
 * ἀλλὰ πεφυκόσι μὲν ἡμῖν δέξασθαι αὐτάς, τελειουμένοις δὲ διὰ τοῦ ἔθους.
 *
 * "Excellence is not born in us by nature, nor against nature,
 * but we are naturally able to receive it, and it is perfected through habit."
 *
 * — Aristotle, Nicomachean Ethics, Book II
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Application Status Enum
 * Defines all possible states an application can be in during the recruitment workflow
 */
export enum ApplicationStatus {
	CREATED = 'CREATED',
	VERIFYING = 'VERIFYING',
	VERIFIED = 'VERIFIED',
	QUALIFYING = 'QUALIFYING',
	QUALIFIED = 'QUALIFIED',
	FINALIZED = 'FINALIZED',
	SIGNING = 'SIGNING',
	SIGNED = 'SIGNED',
	ISSUING = 'ISSUING',
	ISSUED = 'ISSUED',
	ERROR = 'ERROR',
	REJECTED = 'REJECTED',
	ARCHIVED = 'ARCHIVED',
}

export class Application {
	private domainEvents: DomainEvent[] = [];

	private constructor(
		private readonly id: ApplicationId,
		private readonly vacancyId: VacancyId,
		private status: ApplicationStatus,
		private candidateInfo?: CandidateInfo,
		private readonly createdAt: Date = new Date(),
	) {}

	// Factory method for new applications
	static create(vacancyId: string, applicationId: string): Application {
		return new Application(
			ApplicationId.create(applicationId),
			VacancyId.create(vacancyId),
			ApplicationStatus.CREATED,
		);
	}

	// Factory method for reconstituting from database
	static reconstitute(data: {
		id: string;
		vacancyId: string;
		status: ApplicationStatus;
		candidateInfo?: CandidateInfo;
		createdAt: Date;
	}): Application {
		return new Application(
			ApplicationId.create(data.id),
			VacancyId.create(data.vacancyId),
			data.status,
			data.candidateInfo,
			data.createdAt,
		);
	}

	// Business Rules

	/**
	 * Business Rule: Application must be in CREATED status to start verification
	 */
	canStartVerification(): boolean {
		return this.status === ApplicationStatus.CREATED;
	}

	/**
	 * Business Rule: Can only complete verification if in VERIFYING status
	 */
	canCompleteVerification(): boolean {
		return this.status === ApplicationStatus.VERIFYING;
	}

	/**
	 * Business Rule: Can only start qualifying if in VERIFIED status
	 */
	canStartQualifying(): boolean {
		return this.status === ApplicationStatus.VERIFIED;
	}

	/**
	 * Business Rule: Can only complete qualifying if in QUALIFYING status
	 */
	canCompleteQualifying(): boolean {
		return this.status === ApplicationStatus.QUALIFYING;
	}

	/**
	 * Business Rule: Can only finalise if VERIFIED or QUALIFIED
	 */
	canFinalise(): boolean {
		return (
			this.status === ApplicationStatus.VERIFIED || this.status === ApplicationStatus.QUALIFIED
		);
	}

	/**
	 * Business Rule: Can only start signing if FINALIZED
	 */
	canStartSigning(): boolean {
		return this.status === ApplicationStatus.FINALIZED;
	}

	/**
	 * Business Rule: Can only complete signing if SIGNING
	 */
	canCompleteSigning(): boolean {
		return this.status === ApplicationStatus.SIGNING;
	}

	/**
	 * Business Rule: Can only start issuing if SIGNED
	 */
	canStartIssuing(): boolean {
		return this.status === ApplicationStatus.SIGNED;
	}

	/**
	 * Business Rule: Can only complete issuing if ISSUING
	 */
	canCompleteIssuing(): boolean {
		return this.status === ApplicationStatus.ISSUING;
	}

	/**
	 * Business Rule: Professional qualifications (Diploma, Seafarer) can be requested when verified (before signing)
	 */
	canRequestQualifications(): boolean {
		return this.status === ApplicationStatus.VERIFIED;
	}

	/**
	 * Business Rule: Tax Residency attestation can be requested after contract signing
	 * Allowed in SIGNED, ISSUING, or ISSUED status (anytime after contract is signed)
	 */
	canRequestTaxResidency(): boolean {
		return (
			this.status === ApplicationStatus.SIGNED ||
			this.status === ApplicationStatus.ISSUING ||
			this.status === ApplicationStatus.ISSUED
		);
	}

	/**
	 * Business Rule: Application must have candidate info to be considered verified
	 */
	hasValidCandidateInfo(): boolean {
		return (
			!!this.candidateInfo && !!this.candidateInfo.familyName && !!this.candidateInfo.givenName
		);
	}

	/**
	 * Business Rule: Finalize page access control
	 * User can access finalize page when application is ready to be finalized or is in signing process
	 */
	canAccessFinalizePage(): boolean {
		return (
			this.status === ApplicationStatus.VERIFIED ||
			this.status === ApplicationStatus.QUALIFIED ||
			this.status === ApplicationStatus.FINALIZED ||
			this.status === ApplicationStatus.SIGNING
		);
	}

	/**
	 * Business Rule: Employee page access control
	 * User can access employee page only after contract is signed
	 */
	canAccessEmployeePage(): boolean {
		return (
			this.status === ApplicationStatus.SIGNED ||
			this.status === ApplicationStatus.ISSUING ||
			this.status === ApplicationStatus.ISSUED
		);
	}

	/**
	 * Business Rule: Qualifications page access control
	 * User can access qualifications page during verification or qualifying status
	 */
	canAccessQualificationsPage(): boolean {
		return (
			this.status === ApplicationStatus.VERIFIED || this.status === ApplicationStatus.QUALIFYING
		);
	}

	/**
	 * Business Rule: Tax residency page access control
	 * User can access tax residency page only after contract is signed
	 */
	canAccessTaxResidencyPage(): boolean {
		return this.status === ApplicationStatus.SIGNED;
	}

	// Commands (state changes)

	markAsVerifying(): void {
		if (!this.canStartVerification()) {
			throw new Error('Cannot start verification. Application not in CREATED state');
		}
		this.status = ApplicationStatus.VERIFYING;
	}

	markAsVerified(candidateInfo: CandidateInfo): void {
		if (!this.canCompleteVerification()) {
			throw new Error('Cannot complete verification. Application not in VERIFYING state');
		}
		this.candidateInfo = candidateInfo;
		this.status = ApplicationStatus.VERIFIED;

		// Raise domain event
		this.addDomainEvent(
			new ApplicationVerified(
				this.id.getValue(),
				candidateInfo.familyName.getValue(),
				candidateInfo.givenName.getValue(),
				candidateInfo.email?.getValue(),
			),
		);
	}

	markAsQualifying(): void {
		if (!this.canStartQualifying()) {
			throw new Error('Cannot start qualifying. Application not in VERIFIED state');
		}
		this.status = ApplicationStatus.QUALIFYING;
	}

	markAsQualified(): void {
		if (!this.canCompleteQualifying()) {
			throw new Error('Cannot complete qualifying. Application not in QUALIFYING state');
		}
		this.status = ApplicationStatus.QUALIFIED;
	}

	markAsFinalised(): void {
		if (!this.canFinalise()) {
			throw new Error('Cannot finalise. Application not in VERIFIED or QUALIFIED state');
		}
		this.status = ApplicationStatus.FINALIZED;
	}

	markAsSigning(): void {
		if (!this.canStartSigning()) {
			throw new Error('Cannot start signing. Application not in FINALIZED state');
		}
		this.status = ApplicationStatus.SIGNING;
	}

	markAsSigned(): void {
		if (!this.canCompleteSigning()) {
			throw new Error('Cannot complete signing. Application not in SIGNING state');
		}
		this.status = ApplicationStatus.SIGNED;
	}

	markAsIssuing(): void {
		if (!this.canStartIssuing()) {
			throw new Error('Cannot start issuing. Application not in SIGNED state');
		}
		this.status = ApplicationStatus.ISSUING;
	}

	markAsIssued(): void {
		if (!this.canCompleteIssuing()) {
			throw new Error('Cannot complete issuing. Application not in ISSUING state');
		}
		this.status = ApplicationStatus.ISSUED;
	}

	markAsError(): void {
		this.status = ApplicationStatus.ERROR;
	}

	markAsRejected(): void {
		this.status = ApplicationStatus.REJECTED;
	}

	markAsArchived(): void {
		this.status = ApplicationStatus.ARCHIVED;
	}

	// Business Logic

	/**
	 * Build employee credential data for issuance
	 * This is RICH DOMAIN MODEL - business logic belongs in the entity
	 *
	 * @returns Employee credential data ready for issuance
	 * @throws Error if application doesn't have required candidate information
	 */
	buildEmployeeCredentialData(): {
		given_name: string;
		family_name: string;
		birth_date: string;
		employee_id: string;
		employer_name: string;
		employment_start_date: string;
		employment_type: string;
		country_code: string;
	} {
		// Business rule: Must have verified candidate information
		if (!this.candidateInfo) {
			throw new Error('Cannot build employee credential: No candidate information available');
		}

		if (
			!this.candidateInfo.familyName ||
			!this.candidateInfo.givenName ||
			!this.candidateInfo.dateOfBirth
		) {
			throw new Error('Cannot build employee credential: Missing required personal information');
		}

		// Business constants (could be moved to configuration)
		const EMPLOYER_NAME = 'EUDI Web Recruitment Service';
		const EMPLOYMENT_TYPE = 'Contract';

		return {
			given_name: this.candidateInfo.givenName.getValue(),
			family_name: this.candidateInfo.familyName.getValue(),
			birth_date: this.candidateInfo.dateOfBirth?.toString() || '',
			employee_id: this.id.getValue(), // Use application ID as employee ID
			employer_name: EMPLOYER_NAME,
			employment_start_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
			employment_type: EMPLOYMENT_TYPE,
			country_code: this.candidateInfo.nationality?.getValue() || 'EU',
		};
	}

	// Queries (getters)

	getId(): string {
		return this.id.getValue();
	}

	getVacancyId(): string {
		return this.vacancyId.getValue();
	}

	getStatus(): ApplicationStatus {
		return this.status;
	}

	getCandidateInfo(): CandidateInfo | undefined {
		return this.candidateInfo;
	}

	getCreatedAt(): Date {
		return this.createdAt;
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
