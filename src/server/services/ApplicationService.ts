import "server-only";
import { Inject, Service } from "typedi";
import { ValidateInput } from "@/server/decorators/validate-input";
import { ApplicationRepository } from "../repositories/ApplicationRepository";
import { JobRepository } from "@/server/repositories/JobRepository";
import { VerifierService } from "./VerifierService";
import { IssuerService } from "./IssuerService";
import {
  applicationCreateSchema,
  applicationIdSchema,
  applicationVerificationSchema,
} from "@/server/schemas/application";


@Service()
export class ApplicationService {
  constructor(
    @Inject() private readonly applications: ApplicationRepository,
    @Inject() private readonly jobs: JobRepository,
    @Inject() private readonly verifier: VerifierService,
    @Inject() private readonly issuer: IssuerService
  ) {}

  /**
   * Create application + initialize EUDI verification.
   */
  @ValidateInput(applicationCreateSchema)
  public async create(
    newRequesParamsFor: { jobId: string; sameDeviceFlow: boolean }
  ): Promise<{ url: string; applicationId?: string }> {
  console.error('newRequesParamsFor', newRequesParamsFor);
    const job = await this.jobs.get(newRequesParamsFor.jobId);
    if (!job) throw new Error("Job not found");
  console.error('job', job);
    // persist app first
    const { id: applicationId } = await this.applications.create(job.id);

    // ✅ call with 3 positional args (applicationId, sameDeviceFlow)
    const initVerificationResponse = await this.verifier.initVerification(
      applicationId,
      newRequesParamsFor.sameDeviceFlow
    );
console.error('initVerificationResponse', initVerificationResponse);
    //save response
    await this.applications.setVerificationInit(applicationId, {
                                                                transactionId: initVerificationResponse.TransactionId,     
                                                                requestUri: initVerificationResponse.requestUri,
                                                                sameDeviceFlow: newRequesParamsFor.sameDeviceFlow,
                                                              });
    const res = { url: initVerificationResponse.requestUri } as { url: string; applicationId?: string };
    if (!newRequesParamsFor.sameDeviceFlow) res.applicationId = applicationId;
    return res;
  }

  public async deepLink(applicationId: string): Promise<string> {
    const app = await this.applications.get(applicationId);
    if (!app) throw new Error("Application not found");
    
    if (app.status!=='CREATED') throw new Error("Application not found");

    if (app.verifierRequestUri) return app.verifierRequestUri;

    throw new Error("No verifier link available for application");
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
    const record = await this.applications.get(applicationId);
    if (!record) return false;

    // helper
    const check = async (txId: string, code?: string) => {
      const verification = await this.verifier.checkVerification(txId, code);
      const personal = verification?.personalInfo;

      if (
        verification?.status === true &&
        personal?.family_name &&
        personal?.given_name
      ) {
         
        await this.applications.setVerified(applicationId, {
          family: personal.family_name,
          given: personal.given_name,
          email: personal.email_address ?? "",
          nationality: personal.nationality ?? "",
          
          phone: personal.mobile_phone_number ?? "",  
        });
        return true;
      }
      return false;
    };

    // Prefer cross-device (QR+poll) if present
    if (!record.sameDeviceFlow && record.verifierTransactionId) {
      return check(record.verifierTransactionId);
    }else if(record.sameDeviceFlow && record.verifierTransactionId){
      return check(record.verifierTransactionId, responseCode);
    }

    return false;
  }

  /**
   * Issue “Application Receipt” credential (OpenID4VCI) after verification.
   * Persists offer URL and marks status ISSUED.
   */
  @ValidateInput(applicationIdSchema)
  public async issueReceipt(applicationId: string): Promise<{ offerUrl: string } | null> {
    const record = await this.applications.get(applicationId);
    if (!record) return null;

    const offerResponse = await this.issuer.issueApplicationReceipt(record);
    await this.applications.setIssued(applicationId, offerResponse.offerUrl);
    return { offerUrl: offerResponse.offerUrl };
  }

  /**
   * Fetch application details (joins job).
   */
  @ValidateInput(applicationIdSchema)
  public async details(applicationId: string) {
    return this.applications.get(applicationId); // return raw or map to a DTO if you prefer
  }
}
