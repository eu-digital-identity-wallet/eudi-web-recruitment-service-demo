export type InitVerificationResult = {
	url: string; // eudi-openid4vp://... deep link
	transactionId: string; // verifier transaction id
};

export type VerificationData = {
	family_name: string | null;
	given_name: string | null;
	birth_date?: string | null;
	nationality?: string | null; // often an array, e.g., ["GR"]
	email_address?: string | null;
	mobile_phone_number?: string | null;
};

export interface VerificationResponse {
	status: boolean;
	personalInfo?: VerificationData;
	verifiedCredentials?: Record<string, Record<string, unknown>>; // namespace -> claims
}

export type VpTokenRequest = {
	type: 'vp_token';
	dcql_query: {
		credentials: {
			id: string;
			format: string;
			meta: {
				doctype_value?: string;
				vct_values?: string[];
			};
			claims?: {
				path: string[];
				intent_to_retain?: boolean;
			}[];
		}[];
	};
	nonce: string;
	request_uri_method: 'get' | 'post';
	wallet_response_redirect_uri_template?: string;
};

// Document Signing Types
export type DocumentRetrievalAuthRequest = {
	response_type: string | null;
	client_id: string | null;
	client_id_scheme: string | null;
	response_mode: string | null;
	response_uri: string | null;
	nonce: string | null;
	state?: string | null;
	signatureQualifier?: string | null;
	documentDigests?: DocumentDigest[] | null;
	documentLocations?: DocumentLocation[] | null;
	hashAlgorithmOID?: string | null;
	clientData?: string | null;
};

export type DocumentLocation = {
	uri?: string | null;
	method?: Method | null;
};

export type Method = {
	type?: string | null;
	oneTimePassword?: string | null;
};

export type DocumentDigest = {
	hash?: string | null;
	label?: string | null;
};
