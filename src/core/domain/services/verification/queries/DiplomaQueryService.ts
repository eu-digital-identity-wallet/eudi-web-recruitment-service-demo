import { Service } from 'typedi';

import { VpTokenRequest } from '@/core/shared/types/types/eudi';

/**
 * Service responsible for building DCQL queries for diploma credentials
 * Handles educational qualification verification for recruitment
 */
@Service()
export class DiplomaQueryService {
	/**
	 * Build DCQL query for diploma credential request
	 *
	 * @param applicationId - Unique identifier for the application
	 * @returns DCQL query configuration for diploma credential
	 */
	public buildQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
		return {
			id: `diploma_${applicationId}`,
			format: 'dc+sd-jwt',
			meta: {
				vct_values: ['urn:eu.europa.ec.eudi:diploma:1:1'],
			},
			// Optional: specific claims can be requested
			// claims: [
			//   {
			//     path: ["eu.europa.ec.eudi.diploma.1", "family_name"]
			//   }
			// ]
		};
	}

	/**
	 * Get human-readable description of diploma credential requirements
	 */
	public getDescription(): string {
		return 'Diploma certificate required';
	}
}
