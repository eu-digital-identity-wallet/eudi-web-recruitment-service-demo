import { VpTokenRequest } from "@/server/types/eudi";
import { env } from "env";

export type CredentialType = 'PID' | 'DIPLOMA' | 'SEAFARER' | 'BOTH' ;

export interface DcqlQueryOptions {
  applicationId: string;
  credentialTypes: CredentialType;
  sameDeviceFlow: boolean;
}

/**
 * Build DCQL query for diploma credential
 */
export function buildDiplomaQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
  return {
    id: "diploma_"+applicationId,
    format: "dc+sd-jwt",
    meta: {
      vct_values: [
        "urn:eu.europa.ec.eudi:diploma:1:1"
      ]
    },
    claims: [
      {
        path: ["urn:eu.europa.ec.eudi:diploma:1:1", "family_name"]
      }
    ]
  };
}

/**
 * Build DCQL query for seafarer certificate
 */
export function buildSeafarerQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
  return {
    id: "seafearer_"+applicationId,
    format: "mso_mdoc",
    meta: {
      doctype_value: "eu.europa.ec.eudi.seafarer.1"
    },
    claims: [
      {
        path: ["eu.europa.ec.eudi.seafarer.1","family_name"],
        intent_to_retain: false
      }
    ]
  };
}

/**
 * Build DCQL query for PID (Personal Identity Document)
 */
export function buildPidQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
  return {
    id: "pid_"+applicationId,
    format: "mso_mdoc",
    meta: {
      doctype_value: "eu.europa.ec.eudi.pid.1"
    },
    claims: [
      {
        path: ["eu.europa.ec.eudi.pid.1", "family_name"],
        intent_to_retain: true
      },
      {
        path: ["eu.europa.ec.eudi.pid.1", "given_name"],
        intent_to_retain: true
      },
      {
        path: ["eu.europa.ec.eudi.pid.1", "birth_date"],
        intent_to_retain: true
      },
      {
        path: ["eu.europa.ec.eudi.pid.1", "nationality"],
        intent_to_retain: true
      },
      {
        path: ["eu.europa.ec.eudi.pid.1", "email_address"],
        intent_to_retain: true
      },
      {
        path: ["eu.europa.ec.eudi.pid.1", "mobile_phone_number"],
        intent_to_retain: false
      }
    ]
  };
}

/**
 * Build complete DCQL query based on credential requirements
 */
export function buildDcqlQuery(options: DcqlQueryOptions): VpTokenRequest['dcql_query'] {
  const credentials: VpTokenRequest['dcql_query']['credentials'] = [];

  // Dynamic credential mapping with type-safe function signatures
  const credentialMap = {
    'PID': () => buildPidQuery(options.applicationId),
    'DIPLOMA': () => buildDiplomaQuery(options.applicationId),
    'SEAFARER': () => buildSeafarerQuery(options.applicationId),
  } as const;

  // Build credentials based on requirements
  switch (options.credentialTypes) {
    case 'PID':
      credentials.push(credentialMap.PID());
      break;

    case 'DIPLOMA':
      credentials.push(credentialMap.DIPLOMA());
      break;

    case 'SEAFARER':
      credentials.push(credentialMap.SEAFARER());
      break;

    case 'BOTH':
      credentials.push(credentialMap.DIPLOMA());
      credentials.push(credentialMap.SEAFARER());
      break;

    default:
      throw new Error(`Unsupported credential type: ${options.credentialTypes}`);
  }

  return { credentials };
}

/**
 * Build complete VP token request payload
 */
export function buildVpTokenRequest(options: DcqlQueryOptions): VpTokenRequest {
  const payload: VpTokenRequest = {
    type: "vp_token",
    dcql_query: buildDcqlQuery(options),
    request_uri_method: "get",
    nonce: crypto.randomUUID(),
  };
  
  // Add redirect URI for same-device flow 
  if (options.sameDeviceFlow) {
    const base = env.NEXT_PUBLIC_APP_URI.replace(/\/+$/, "");

    // The EUDI verifier is rejecting the template with InvalidWalletResponseTemplate error
    console.log("Would set redirect URI template:", `${base}/applications/${options.applicationId}/callback?response_code={response_code}`);

    payload.wallet_response_redirect_uri_template =
       `${base}/applications/${options.applicationId}/callback?response_code={RESPONSE_CODE}`;
  }

  return payload;
}

/**
 * Get human-readable description of credential requirements
 */
export function getCredentialDescription(credentialTypes: CredentialType): string {
  switch (credentialTypes) {
    case 'PID':
      return 'Personal identity document required';
    case 'DIPLOMA':
      return 'Diploma certificate required';
    case 'SEAFARER':
      return 'Seafarer certificate required';
    case 'BOTH':
      return 'Both diploma and seafarer certificates required';
    default:
      return 'Unknown credential requirements';
  }
}