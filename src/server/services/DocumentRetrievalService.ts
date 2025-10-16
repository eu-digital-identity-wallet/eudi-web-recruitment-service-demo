import { Service } from "typedi";
import {DocumentRetrievalAuthRequest} from "@/server/types/eudi";
import {env} from "@env";

@Service()
export class DocumentRetrievalService {

    public prepareDocumentRetrievalRequest(state: string, clientId: string): DocumentRetrievalAuthRequest {
        return {
            response_type: "vp_token",
            client_id: clientId,
            client_id_scheme: "x509_san_dns",
            response_mode: "direct_post",
            response_uri: env.NEXT_PUBLIC_APP_URI+"/signedDocument",
            nonce: crypto.randomUUID(),
            state: state,
            signatureQualifier: "eu_eidas_qes",
            documentDigests: [{
                hash: "",
                label: "Contract",
            }],
            documentLocations: [{
                uri: env.NEXT_PUBLIC_APP_URI+"/contractPdf",
                method: {
                    type: "public"
                }
            }],
            hashAlgorithmOID: "2.16.840.1.101.3.4.2.1",
            clientData: "",
        }
    }

}