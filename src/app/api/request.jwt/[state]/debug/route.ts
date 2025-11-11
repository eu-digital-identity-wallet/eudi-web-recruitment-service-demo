// src/app/api/request.jwt/[state]/debug/route.ts
import { NextResponse } from 'next/server';

import { Container } from '@/core';
import { JWTService } from '@/core/domain/services/JWTService';
import { DocumentSigningService } from '@/core/domain/services/signing/ContractSigningService';
import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('RequestJWTDebugRoute');

/**
 * GET /api/request.jwt/[state]/debug
 *
 * Debug endpoint to see the JWT payload without signing
 * Shows what the wallet will receive when accessing the request_uri
 */
export async function GET(_req: Request, ctx: { params: Promise<{ state: string }> }) {
	try {
		const { state } = await ctx.params;

		const documentSigningService = Container.get(DocumentSigningService);
		const jwtService = Container.get(JWTService);

		// Prepare the document retrieval request payload
		const payload = await documentSigningService.prepareDocumentRetrievalRequest(state);

		// Sign the JWT
		const signedJwt = await jwtService.sign(payload);

		// Decode the JWT to show header and payload
		const parts = signedJwt.split('.');
		const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
		const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

		return NextResponse.json(
			{
				jwt: signedJwt,
				decoded: {
					header,
					payload: decodedPayload,
				},
				raw_payload: payload,
				explanation: {
					header: {
						typ: 'JWT type - must be "JWT"',
						alg: 'Algorithm used to sign - ES256 (ECDSA with SHA-256)',
						x5c: 'X.509 certificate chain (base64 encoded)',
					},
					payload: {
						state: 'Transaction UUID - identifies this signing session',
						response_type: 'Must be "vp_token" per EUDI spec',
						client_id: 'Service identifier - hostname of the service',
						client_id_scheme: 'Must be "x509_san_dns" per EUDI spec',
						response_mode: 'Must be "direct_post" - wallet posts result back',
						response_uri: 'Where wallet will POST the signed document',
						nonce: 'Random UUID for replay protection',
						signatureQualifier:
							'Type of signature - "eu_eidas_qes" (Qualified Electronic Signature)',
						hashAlgorithmOID: 'Hash algorithm OID - 2.16.840.1.101.3.4.2.1 (SHA-256)',
						documentDigests: 'Array with hash and label of documents to sign',
						documentLocations: 'Array with URIs where wallet can download documents',
					},
				},
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
	} catch (error) {
		logger.error('Error generating JWT debug info', error as Error);
		return NextResponse.json(
			{
				error: 'Failed to generate JWT',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
