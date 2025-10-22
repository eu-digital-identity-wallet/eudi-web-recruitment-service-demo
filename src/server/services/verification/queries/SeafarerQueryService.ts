import { Service } from 'typedi';

import { VpTokenRequest } from '@/server/types/eudi';

/**
 * Service responsible for building DCQL queries for seafarer credentials
 * Handles maritime professional certification verification for recruitment
 */
@Service()
export class SeafarerQueryService {
	/**
	 * Build DCQL query for seafarer credential request
	 *
	 * @param applicationId - Unique identifier for the application
	 * @returns DCQL query configuration for seafarer credential
	 */
	public buildQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
		return {
			id: `seafarer_${applicationId}`,
			format: 'mso_mdoc',
			meta: {
				doctype_value: 'eu.europa.ec.eudi.seafarer.1',
			},
			// Optional: specific claims can be requested
			// claims: [
			//   {
			//     path: ["eu.europa.ec.eudi.seafarer.1","family_name"],
			//     intent_to_retain: false
			//   }
			// ]
		};
	}

	/**
	 * Get human-readable description of seafarer credential requirements
	 */
	public getDescription(): string {
		return 'Seafarer certificate required';
	}
}
