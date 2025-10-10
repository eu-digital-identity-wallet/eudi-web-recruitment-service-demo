import "server-only";
import { Inject, Service } from "typedi";
import { ValidateInput } from "@/server/decorators/validate-input";
import { VerifierService } from "./VerifierService";
import { IssuerService } from "./IssuerService";
import { ApplicationRepository } from "@/server/repositories/ApplicationRepository";
import { JobRepository } from "@/server/repositories/JobRepository";
import { VerifiedCredentialRepository } from "@/server/repositories/VerifiedCredentialRepository";
import {
  applicationCreateSchema,
  applicationIdSchema,
  applicationVerificationSchema,
  applicationExtrasSchema,
} from "@/server/schemas/application";
import { ApplicationMapper, CandidateInfo } from "@/server/domain";
import { CredentialType, Prisma } from "@prisma/client";


@Service()
export class ApplicationService {
  constructor(
    @Inject() private readonly verifier: VerifierService,
    @Inject() private readonly issuer: IssuerService,
    @Inject() private readonly applicationRepo: ApplicationRepository,
    @Inject() private readonly jobRepo: JobRepository,
    @Inject() private readonly verifiedCredentialRepo: VerifiedCredentialRepository
  ) {}

  /**
   * Map namespace to CredentialType
   */
  private namespaceToCredentialType(namespace: string): CredentialType | null {
    if (namespace === "eu.europa.ec.eudi.pid.1") return "PID";
    if (namespace.includes("diploma")) return "DIPLOMA";
    if (namespace.includes("seafarer")) return "SEAFARER";
    return null;
  }

  /**
   * Create application + initialize EUDI verification.
   * Always starts with PID (Personal ID) verification - business logic requirement.
   */
  @ValidateInput(applicationCreateSchema)
  public async create(
    newRequesParamsFor: { jobId: string; sameDeviceFlow: boolean; }
  ): Promise<{ url: string; applicationId?: string }> {

    const job = await this.jobRepo.findById(newRequesParamsFor.jobId);
    if (!job) throw new Error("Job not found");

    // Create domain entity - always starts with PID verification
    const prismaApp = await this.applicationRepo.create({
      job: { connect: { id: job.id } }
    });

    const application = ApplicationMapper.toDomain(prismaApp);

    // Business rule check: can start verification
    if (!application.canStartVerification()) {
      throw new Error("Application cannot start verification");
    }

    // Initialize PID verification (personal info is always needed first)
    const initVerificationResponse = await this.verifier.initVerification(
      application.getId(),
      newRequesParamsFor.sameDeviceFlow,
      'PID'
    );

    // Create PENDING VerifiedCredential record for PID
    await this.verifiedCredentialRepo.create({
      application: { connect: { id: application.getId() } },
      credentialType: "PID",
      namespace: "eu.europa.ec.eudi.pid.1",
      verifierTransactionId: initVerificationResponse.TransactionId,
      verifierRequestUri: initVerificationResponse.requestUri,
      credentialData: {} as Prisma.InputJsonValue,
      status: "PENDING"
    });

    const res = { url: initVerificationResponse.requestUri } as { url: string; applicationId?: string };
    if (!newRequesParamsFor.sameDeviceFlow) res.applicationId = application.getId();
    return res;
  }

  @ValidateInput(applicationIdSchema)
  public async deepLink(applicationId: string): Promise<string> {
    const prismaApp = await this.applicationRepo.findById(applicationId);
    if (!prismaApp) throw new Error("Application not found");

    const application = ApplicationMapper.toDomain(prismaApp);

    // Business rule check
    if (!application.canCompleteVerification()) {
      throw new Error("Application not in correct state for verification");
    }

    // Get PID verification credential
    const pidCredential = await this.verifiedCredentialRepo.findByApplicationIdAndType(
      applicationId,
      "PID"
    );

    if (!pidCredential?.verifierRequestUri) {
      throw new Error("No verifier link available for application");
    }

    return pidCredential.verifierRequestUri;
  }

  @ValidateInput(applicationIdSchema)
  public async extrasDeepLink(applicationId: string): Promise<string> {
    const prismaApp = await this.applicationRepo.findById(applicationId);
    if (!prismaApp) throw new Error("Application not found");

    const application = ApplicationMapper.toDomain(prismaApp);

    // Business rule check
    if (!application.canRequestExtras()) {
      throw new Error("Application must be verified first");
    }

    // Get the most recent extras credential (DIPLOMA or SEAFARER)
    const extrasCredentials = await this.verifiedCredentialRepo.findByApplicationId(applicationId);
    const extrasCredential = extrasCredentials.find(
      (c) => (c.credentialType === "DIPLOMA" || c.credentialType === "SEAFARER") && c.status === "PENDING"
    );

    if (!extrasCredential?.verifierRequestUri) {
      throw new Error("No extras verifier link available for application");
    }

    return extrasCredential.verifierRequestUri;
  }
  /**
   * Poll verification status (cross-device) or finalize same-device (needs responseCode).
   * Updates candidate fields and status to VERIFIED on success.
   */
  @ValidateInput(applicationVerificationSchema)
  public async verificationStatus({
    applicationId,
    responseCode, // only for same-device deep link completions
  }: { applicationId: string; responseCode?: string }): Promise<boolean> {
    const prismaApp = await this.applicationRepo.findById(applicationId);
    if (!prismaApp) return false;

    const application = ApplicationMapper.toDomain(prismaApp);

    // Get PID verification credential
    const pidCredential = await this.verifiedCredentialRepo.findByApplicationIdAndType(
      applicationId,
      "PID"
    );

    if (!pidCredential?.verifierTransactionId) return false;

    // Check verification with EUDI verifier
    const verification = await this.verifier.checkVerification(
      pidCredential.verifierTransactionId,
      responseCode
    );

    const personal = verification?.personalInfo;

    if (
      verification?.status === true &&
      personal?.family_name &&
      personal?.given_name
    ) {
      // Create candidate info value object
      const candidateInfo = CandidateInfo.create({
        familyName: personal.family_name,
        givenName: personal.given_name,
        dateOfBirth: personal.birth_date ?? undefined,
        email: personal.email_address ?? undefined,
        mobilePhone: personal.mobile_phone_number ?? undefined,
        nationality: personal.nationality ?? undefined,
      });

      // Apply domain command: mark as verified
      application.markAsVerified(candidateInfo);

      // Store all verified credentials from the VP token
      if (verification.verifiedCredentials) {
        for (const [namespace, claims] of Object.entries(verification.verifiedCredentials)) {
          const credType = this.namespaceToCredentialType(namespace);
          if (credType) {
            await this.verifiedCredentialRepo.updateByTransactionId(
              pidCredential.verifierTransactionId,
              {
                credentialData: claims as Prisma.InputJsonValue,
                status: "VERIFIED",
                verifiedAt: new Date()
              }
            );
          }
        }
      }

      // Persist domain changes
      await this.applicationRepo.update(
        applicationId,
        ApplicationMapper.toPersistence(application)
      );

      return true;
    }

    return false;
  }

  /**
   * Issue "Application Receipt" credential (OpenID4VCI) after verification.
   * Persists offer URL and marks status ISSUED.
   */
  @ValidateInput(applicationIdSchema)
  public async issueReceipt(applicationId: string): Promise<{ offerUrl: string; otp?: string } | null> {
    const prismaApp = await this.applicationRepo.findByIdWithJob(applicationId);
    if (!prismaApp) return null;

    const application = ApplicationMapper.toDomain(prismaApp);

    // Business rule check
    if (!application.canIssueReceipt()) {
      const status = application.getStatus();
      const hasCandidate = !!application.getCandidateInfo();

      if (status !== "VERIFIED") {
        throw new Error(`Cannot issue receipt. Application status is ${status}, must be VERIFIED`);
      }
      if (!hasCandidate) {
        throw new Error("Application is missing verified personal information");
      }

      throw new Error("Cannot issue receipt. Application must be verified with candidate info");
    }

    if (!prismaApp.job) {
      throw new Error("Application has no associated job");
    }
    const offerResponse = await this.issuer.issueApplicationReceipt(prismaApp as typeof prismaApp & { job: NonNullable<typeof prismaApp.job> });

    // Apply domain command: issue receipt (changes status to ISSUED)
    application.issueReceipt();

    // Persist domain changes
    await this.applicationRepo.update(
      applicationId,
      ApplicationMapper.toPersistence(application)
    );

    return { offerUrl: offerResponse.offerUrl, otp: offerResponse.otp };
  }

  /**
   * Request additional credentials for an already verified application
   */
  @ValidateInput(applicationExtrasSchema)
  public async requestAdditionalCredentials(data: {
    applicationId: string;
    credentialType: 'DIPLOMA' | 'SEAFARER' | 'BOTH';
    sameDeviceFlow: boolean;
  }): Promise<{ url: string }> {
    const { applicationId, credentialType, sameDeviceFlow } = data;

    const prismaApp = await this.applicationRepo.findById(applicationId);
    if (!prismaApp) throw new Error("Application not found");

    const application = ApplicationMapper.toDomain(prismaApp);

    // Business rule check
    if (!application.canRequestExtras()) {
      throw new Error("Application must be verified first");
    }

    // Create a new verification request for additional credentials only (no PID)
    const initVerificationResponse = await this.verifier.initVerification(
      applicationId,
      sameDeviceFlow,
      credentialType
    );

    // Create PENDING VerifiedCredential records for requested credentials
    const credentialsToCreate: Array<{ type: CredentialType; namespace: string }> = [];

    if (credentialType === 'DIPLOMA' || credentialType === 'BOTH') {
      credentialsToCreate.push({
        type: "DIPLOMA",
        namespace: "urn:eu.europa.ec.eudi:diploma:1:1"
      });
    }

    if (credentialType === 'SEAFARER' || credentialType === 'BOTH') {
      credentialsToCreate.push({
        type: "SEAFARER",
        namespace: "eu.europa.ec.eudi.seafarer.1"
      });
    }

    // Create PENDING records for each credential
    for (const { type, namespace } of credentialsToCreate) {
      await this.verifiedCredentialRepo.create({
        application: { connect: { id: applicationId } },
        credentialType: type,
        namespace,
        verifierTransactionId: initVerificationResponse.TransactionId,
        verifierRequestUri: initVerificationResponse.requestUri,
        credentialData: {} as Prisma.InputJsonValue,
        status: "PENDING"
      });
    }

    return { url: initVerificationResponse.requestUri };
  }

  /**
   * Check extras verification status
   */
  @ValidateInput(applicationVerificationSchema)
  public async extrasVerificationStatus({
    applicationId,
    responseCode,
  }: { applicationId: string; responseCode?: string }): Promise<boolean> {
    // Get extras credentials (DIPLOMA or SEAFARER) that are PENDING
    const extrasCredentials = await this.verifiedCredentialRepo.findByApplicationId(applicationId);
    const extrasCredential = extrasCredentials.find(
      (c) => (c.credentialType === "DIPLOMA" || c.credentialType === "SEAFARER") && c.status === "PENDING"
    );

    if (!extrasCredential?.verifierTransactionId) return false;

    // Check verification with EUDI verifier
    const verification = await this.verifier.checkVerification(
      extrasCredential.verifierTransactionId,
      responseCode
    );

    if (verification?.status === true && verification.verifiedCredentials) {
      // Store all verified credentials from the VP token
      for (const [namespace, claims] of Object.entries(verification.verifiedCredentials)) {
        const credType = this.namespaceToCredentialType(namespace);
        if (credType && credType !== "PID") {
          // Update the corresponding VerifiedCredential record
          await this.verifiedCredentialRepo.updateByTransactionId(
            extrasCredential.verifierTransactionId,
            {
              credentialData: claims as Prisma.InputJsonValue,
              status: "VERIFIED",
              verifiedAt: new Date()
            }
          );
        }
      }

      return true;
    }

    return false;
  }

  /**
   * Fetch application details (joins job).
   */
  @ValidateInput(applicationIdSchema)
  public async details(applicationId: string) {
    return this.applicationRepo.findByIdWithJob(applicationId);
  }

  /**
   * Get all verified credentials for an application
   */
  @ValidateInput(applicationIdSchema)
  public async getVerifiedCredentials(applicationId: string) {
    return this.verifiedCredentialRepo.findByApplicationId(applicationId);
  }
}
