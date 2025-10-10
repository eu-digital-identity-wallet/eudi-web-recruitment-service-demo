// src/server/types/jwt.ts
import type { JWTPayload } from "jose";

/** OAuth grant used by your issuer flow */
export type PreAuthorizedGrant = "urn:ietf:params:oauth:grant-type:pre-authorized_code";

/** EUDI Employee credential data (namespace: eu.europa.ec.eudi.employee.1) */
export interface EmployeeCredentialData {
  given_name: string;
  family_name: string;
  birth_date: string;
  employee_id: string;
  employer_name: string;
  employment_start_date: string;
  employment_type: string;
  country_code: string;
}

/** EUDI Loyalty Card credential data (namespace: eu.europa.ec.eudi.loyalty.1) */
export interface LoyaltyCardCredentialData {
  given_name: string;
  family_name: string;
  loyalty_card_company: string;
  client_id: string;
  issuance_date: string;
  expiry_date: string;
}

/** Application Receipt credential data (custom credential type) */
export interface ApplicationReceiptData {
  job_board_name: string;
  employer_name: string;
  job_id: string;
  job_title: string;
  application_id: string;
  application_date: string;
  candidate_family_name: string;
  candidate_given_name: string;
  candidate_birth_date: string;
}

/** A single credential configuration request */
export interface ApplicationCredential {
  credential_configuration_id: "eu.europa.ec.eudi.employee_mdoc" | "eu.europa.ec.eudi.loyalty_mdoc" | "application_receipt_v1";
  data: {
    "eu.europa.ec.eudi.employee.1"?: EmployeeCredentialData;
    "eu.europa.ec.eudi.loyalty.1"?: LoyaltyCardCredentialData;
  } | ApplicationReceiptData;
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
