// src/server/types/jwt.ts
import type { JWTPayload } from "jose";

/** OAuth grant used by your issuer flow */
export type PreAuthorizedGrant = "urn:ietf:params:oauth:grant-type:pre-authorized_code";

/** The business data you embed in the credential request */
export interface ApplicationCredentialData {
  job_board_name: string;
  employer_name: string;
  job_id: string;
  job_title: string;


  application_id: string;
  application_date: string;                 // ISO string (e.g., app.createdAt.toISOString())
  candidate_family_name: string | null;
  candidate_given_name: string | null;
  candidate_birth_date?: string | null;     // optional if you add it
}

/** A single credential configuration request */
export interface ApplicationCredential {
  credential_configuration_id: "application_receipt_v1";
  data: ApplicationCredentialData;
}

/** Full JWT you sign and POST to the issuer endpoint */
export interface ApplicationJWTPayload extends JWTPayload {
  iss: string;                              // e.g., NEXT_PUBLIC_APP_URI
  aud: string;                              // e.g., ISSUER_API_URL
  grants: PreAuthorizedGrant[];             // ["urn:ietf:params:oauth:grant-type:pre-authorized_code"]
  credentials: ApplicationCredential[];     
  iat: number;                              
  exp: number;                              
}
