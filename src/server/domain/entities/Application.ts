import { ApplicationId } from "../value-objects/ApplicationId";
import { CandidateInfo } from "../value-objects/CandidateInfo";

export type ApplicationStatus = "CREATED" | "VERIFIED" | "ISSUED";

export class Application {
  private constructor(
    private readonly id: ApplicationId,
    private readonly jobId: string,
    private status: ApplicationStatus,
    private candidateInfo?: CandidateInfo,
    private readonly createdAt: Date = new Date()
  ) {}

  // Factory method for new applications
  static create(jobId: string, applicationId: string): Application {
    return new Application(
      ApplicationId.create(applicationId),
      jobId,
      "CREATED"
    );
  }

  // Factory method for reconstituting from database
  static reconstitute(data: {
    id: string;
    jobId: string;
    status: ApplicationStatus;
    candidateInfo?: CandidateInfo;
    createdAt: Date;
  }): Application {
    return new Application(
      ApplicationId.create(data.id),
      data.jobId,
      data.status,
      data.candidateInfo,
      data.createdAt
    );
  }

  // Business Rules

  /**
   * Business Rule: Application must be in CREATED status to start verification
   */
  canStartVerification(): boolean {
    return this.status === "CREATED";
  }

  /**
   * Business Rule: Can only verify if in CREATED status
   */
  canCompleteVerification(): boolean {
    return this.status === "CREATED";
  }

  /**
   * Business Rule: Can only request extras after initial verification is complete
   */
  canRequestExtras(): boolean {
    return this.status === "VERIFIED";
  }

  /**
   * Business Rule: Can only issue receipt after verification
   */
  canIssueReceipt(): boolean {
    return this.status === "VERIFIED" && !!this.candidateInfo;
  }

  /**
   * Business Rule: Application must have candidate info to be considered verified
   */
  hasValidCandidateInfo(): boolean {
    return !!this.candidateInfo &&
           !!this.candidateInfo.familyName &&
           !!this.candidateInfo.givenName;
  }

  // Commands (state changes)

  markAsVerified(candidateInfo: CandidateInfo): void {
    if (!this.canCompleteVerification()) {
      throw new Error("Cannot complete verification. Application not in correct state");
    }
    this.candidateInfo = candidateInfo;
    this.status = "VERIFIED";
  }

  issueReceipt(): void {
    if (!this.canIssueReceipt()) {
      throw new Error("Cannot issue receipt. Application must be verified with candidate info");
    }
    this.status = "ISSUED";
  }

  // Queries (getters)

  getId(): string {
    return this.id.getValue();
  }

  getJobId(): string {
    return this.jobId;
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
}