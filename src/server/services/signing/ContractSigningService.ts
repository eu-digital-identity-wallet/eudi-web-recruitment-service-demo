import { Service } from 'typedi';

import { DocumentRetrievalAuthRequest } from '@/server/types/eudi';
import { env } from 'env';

/**
 * Service responsible for document signing workflows
 * Handles preparation of document retrieval requests for qualified electronic signatures (QES)
 * Domain: Document Signing (matching CredentialVerificationService pattern)
 */
@Service()
export class DocumentSigningService {
	private readonly DEFAULT_RESPONSE_TYPE = 'vp_token';
	private readonly DEFAULT_CLIENT_ID_SCHEME = 'x509_san_dns';
	private readonly DEFAULT_RESPONSE_MODE = 'direct_post';
	private readonly DEFAULT_SIGNATURE_QUALIFIER = 'eu_eidas_qes';
	private readonly DEFAULT_HASH_ALGORITHM_OID = '2.16.840.1.101.3.4.2.1'; // SHA-256

	/**
	 * Prepare document retrieval request for signing
	 * Similar to CredentialVerificationService.prepareVerificationRequest()
	 *
	 * @param state - State parameter for request tracking
	 * @param clientId - Client identifier for the signing request
	 * @returns Document retrieval authentication request payload
	 */
	public prepareDocumentRetrievalRequest(
		state: string,
		clientId: string,
	): DocumentRetrievalAuthRequest {
		return {
			response_type: this.DEFAULT_RESPONSE_TYPE,
			client_id: clientId,
			client_id_scheme: this.DEFAULT_CLIENT_ID_SCHEME,
			response_mode: this.DEFAULT_RESPONSE_MODE,
			response_uri: `${env.NEXT_PUBLIC_APP_URI}/signedDocument`, //tha kalesei to wallet gia na parei to ypogegrapmeno  document
			nonce: crypto.randomUUID(),
			state: state,
			signatureQualifier: this.DEFAULT_SIGNATURE_QUALIFIER,
			documentDigests: [
				{
					hash: '', // to has tou document pou 8a ypograpsei to wallet
					label: 'Contract',
				},
			],
			documentLocations: [
				{
					uri: `${env.NEXT_PUBLIC_APP_URI}/contractPdf`, // tha kalesei to wallet gia na parei to document pou 8a ypographei
					method: {
						type: 'public',
					},
				},
			],
			hashAlgorithmOID: this.DEFAULT_HASH_ALGORITHM_OID,
			clientData: '',
		};
	}

	/**
	 * Get human-readable description of signature qualifier
	 */
	public getSignatureQualifierDescription(): string {
		return 'Qualified electronic signature (eIDAS QES)';
	}
}
