import { env } from "env";
import { VerificationResponse, VpTokenRequest } from "@/server/types/eudi";
import { Inject, Service } from "@/server/container";
import { DataDecoderService } from "./DataDecoderService";

@Service()
export class VerifierService {
  constructor(
    @Inject() private readonly dataDecoderService: DataDecoderService // Injecting the DataDecoderService
  ) {}

  public async initVerification(
    applicationId: string,
    sameDeviceFlow: boolean,
  ): Promise<{ requestUri: string; TransactionId: string }> {
console.log("Init verification called with:", { applicationId, sameDeviceFlow });
    const payload: VpTokenRequest = this.buildInitVerificationPayload(applicationId, sameDeviceFlow);
console.log("Payload for verifier:", JSON.stringify(payload, null, 2));
    try {
      const response = await fetch(`${env.VERIFIER_API_URL}/ui/presentations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
console.log("Verifier response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
console.log("ClientId:", encodeURIComponent(data.client_id));
      const clientId = encodeURIComponent(data.client_id);
      const requestURI = encodeURIComponent(data.request_uri);
      const TransactionId = encodeURIComponent(data.transaction_id);
      const requestUri = `eudi-openid4vp://?client_id=${clientId}&request_uri=${requestURI}`;

      return { requestUri, TransactionId };
    } catch (error) {
      console.error("Error in initVerification:", error);
      throw new Error("Failed to initialize verification process.");
    }
  }

  private buildInitVerificationPayload(applicationId: string, sameDeviceFlow: boolean ): VpTokenRequest {
    const payload: VpTokenRequest = {
      type: "vp_token",
      dcql_query: {
        credentials: [
          {
                "id": applicationId,
                "format": "mso_mdoc",
                "meta": {
                    "doctype_value": "eu.europa.ec.eudi.pid.1"
                },
                "claims": [
                    {
                        "path": [
                            "eu.europa.ec.eudi.pid.1",
                            "family_name"
                        ],
                        "intent_to_retain": false
                    },
                    {
                        "path": [
                            "eu.europa.ec.eudi.pid.1",
                            "given_name"
                        ],
                        "intent_to_retain": false
                    },
                    {
                        "path": [
                            "eu.europa.ec.eudi.pid.1",
                            "nationality"
                        ],
                        "intent_to_retain": false
                    },
                    {
                        "path": [
                            "eu.europa.ec.eudi.pid.1",
                            "email_address"
                        ],
                        "intent_to_retain": false
                    },
                    {
                        "path": [
                            "eu.europa.ec.eudi.pid.1",
                            "mobile_phone_number"
                        ],
                        "intent_to_retain": false
                    }
                ]
            }
        ]
      },
      request_uri_method: "get",
      nonce: crypto.randomUUID(),
    };

    // TODO it requires Diploma or SeaFarer Certificate
  
    if (sameDeviceFlow) {
      const base = (env.NEXT_PUBLIC_APP_URI || "http://localhost:3000").replace(/\/+$/, "");
      payload.wallet_response_redirect_uri_template =
        `${base}/applications/${applicationId}/callback?response_code={response_code}`;
    }

    return payload;
  }

  public async checkVerification(
    TransactionId: string,
    responseCode?:string
  ): Promise<VerificationResponse> {
    if (!TransactionId) {
      throw new Error("Transaction ID is undefined.");
    }

    try {
      let url = `${env.VERIFIER_API_URL}/ui/presentations/${TransactionId}`;
      if(responseCode){
        url += `?response_code=${responseCode}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        return { status: false };
      }

      const responseData = await response.json();
    
      // 1) decode vp_token (first value of object)
      const vpTokenB64OrHex = Object.values(responseData.vp_token)[0] as string;
      const buffer = this.dataDecoderService.decodeBase64OrHex(vpTokenB64OrHex);
      const decoded = this.dataDecoderService.decodeCborData(new Uint8Array(buffer));
      if (!decoded || !decoded.documents?.[0]?.issuerSigned?.nameSpaces) {
        return { status: false };
      }

      // 2) walk namespace eu.europa.ec.eudi.pid.1 and collect elements
      const ns = decoded.documents[0].issuerSigned.nameSpaces["eu.europa.ec.eudi.pid.1"];
      
      if (!Array.isArray(ns)) return { status: false };

      const claims: Record<string, unknown> = {};
      for (const entry of ns) {
        
        if (!entry?.value) continue;
        const de = this.dataDecoderService.decodeCborData(entry.value as Uint8Array);
        
        if (!de?.elementIdentifier) continue;

        claims[de.elementIdentifier] = de.elementValue;
      } 
      const personalInfo = {
        family_name: (claims["family_name"] as string) ?? null,
        given_name: (claims["given_name"] as string) ?? null,
        birth_date: (claims["birth_date"] as string) ?? null,
        nationality: Array.isArray(claims["nationality"])
          ? (claims["nationality"].map((n: unknown) => {
              if (typeof n === "string") return n;
              if (typeof n === "object" && n !== null && "country_code" in n) {
                return (n as { country_code?: string }).country_code;
              }
              return undefined;
            }).filter(Boolean)
              .join(",")) ?? null
          : (claims["nationality"] as string) ?? null,
        email_address:  (claims["email_address"] as string | null) ?? null,        
        mobile_phone_number: (claims["mobile_phone_number"] as string) ?? null,
      };

      // Success criteria: at minimum, we have the two core identifiers
      const ok = !!(personalInfo.family_name && personalInfo.given_name);
      return ok ? { status: true, personalInfo } : { status: false };
    } catch (error) {
      console.error("Error in checkVerification:", error);
      throw error;
    }
  }

}
