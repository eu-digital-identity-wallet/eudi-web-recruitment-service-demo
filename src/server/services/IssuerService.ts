// src/server/services/IssuerService.ts
import "server-only";
import { Inject, Service } from "@/server/container";
import { Application, JobPosting } from "@prisma/client";
import { ApplicationJWTPayload } from "../types/jwt";
import { JWTService } from "./JWTService";
import { env } from "@env";

export type IssueReceiptResponse = { offerUrl: string; otp?: string };

@Service()
export class IssuerService {
  constructor(
    @Inject() private readonly jwtService: JWTService,
  ) {}

  /**
   * Issues an "Application Receipt" credential (OpenID4VCI).
   * Requires Application joined with JobPosting.
   */
  public async issueApplicationReceipt(
    app: Application & { job: JobPosting }
  ): Promise<IssueReceiptResponse> {

    if (!app.candidateFamilyName || !app.candidateGivenName || !app.candidateDateOfBirth) {
      throw new Error("Application is missing verified personal information");
    }

    const now = Math.floor(Date.now() / 1000);
    const payload: ApplicationJWTPayload = {
      iss: env.NEXT_PUBLIC_APP_URI || "http://localhost:3000",
      aud: env.ISSUER_API_URL, // issuer audience/endpoint base
      grants: ["urn:ietf:params:oauth:grant-type:pre-authorized_code"],
      credentials: [
        {
          credential_configuration_id: "application_receipt_v1",
          data: {
            job_board_name: "eudiw-job-board",
            employer_name: "unknown", // set your org if you have it
            job_id: app.jobId,
            job_title: app.job.title,
            application_id: app.id,
            application_date: app.createdAt.toISOString(),
            candidate_family_name: app.candidateFamilyName,
            candidate_given_name: app.candidateGivenName,

          },
        },
      ],
      iat: now,
      exp: now + 5 * 60, // 5 minutes
    };

    // 4) Sign ES256 with x5c (JWTService expects (payload, privateKey, certBase64))
    const jwt = await this.jwtService.sign(payload);

    // 5) Call Issuer to obtain the credential offer
    const endpoint = new URL("/credentialOfferReq2", env.ISSUER_API_URL).toString();
    const body = new URLSearchParams({ request: jwt });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Issuer error ${res.status}: ${res.statusText} ${text}`);
    }

    const json = await res.json();

    // 6) Extract OTP (if present) and remove it from the embedded offer
    const pac = json?.grants?.["urn:ietf:params:oauth:grant-type:pre-authorized_code"];
    const otp: string | undefined = pac?.tx_code?.value;

    // clone & scrub tx_code.value
    const offerCopy = JSON.parse(JSON.stringify(json));
    const pacCopy = offerCopy?.grants?.["urn:ietf:params:oauth:grant-type:pre-authorized_code"];
    if (pacCopy?.tx_code?.value) pacCopy.tx_code.value = undefined;

    const offerParam = encodeURIComponent(JSON.stringify(offerCopy));
    const offerUrl = `openid-credential-offer://?credential_offer=${offerParam}`;

    return { offerUrl, otp };
  }
}
