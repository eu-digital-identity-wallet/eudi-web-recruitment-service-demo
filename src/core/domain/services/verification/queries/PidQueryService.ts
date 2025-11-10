import { Service } from 'typedi';

import { VpTokenRequest } from '@/core/shared/types/types/eudi';

/**
 * Service responsible for building DCQL queries for PID (Personal Identity Document) credentials
 * Following eIDAS and EUDI wallet standards for personal identification
 */
@Service()
export class PidQueryService {
	/**
	 * Build DCQL query for PID credential request
	 *
	 * @param applicationId - Unique identifier for the application
	 * @returns DCQL query configuration for PID credential
	 */
	public buildQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
		return {
			id: `pid_${applicationId}`,
			format: 'mso_mdoc',
			meta: {
				doctype_value: 'eu.europa.ec.eudi.pid.1',
			},
			claims: [
				{
					path: ['eu.europa.ec.eudi.pid.1', 'family_name'],
					intent_to_retain: true,
				},
				{
					path: ['eu.europa.ec.eudi.pid.1', 'given_name'],
					intent_to_retain: true,
				},
				{
					path: ['eu.europa.ec.eudi.pid.1', 'birth_date'],
					intent_to_retain: true,
				},
				{
					path: ['eu.europa.ec.eudi.pid.1', 'nationality'],
					intent_to_retain: true,
				},
				{
					path: ['eu.europa.ec.eudi.pid.1', 'email_address'],
					intent_to_retain: true,
				},
				{
					path: ['eu.europa.ec.eudi.pid.1', 'mobile_phone_number'],
					intent_to_retain: false,
				},
			],
		};
	}

	/**
	 * Get human-readable description of PID credential requirements
	 */
	public getDescription(): string {
		return 'Personal identity document required';
	}
}
