import { Service } from 'typedi';

import { VpTokenRequest } from '@/server/types/eudi';

@Service()
export class TaxResidencyQueryService {
	public buildQuery(applicationId: string): VpTokenRequest['dcql_query']['credentials'][0] {
		return {
			id: `tax_residency_${applicationId}`,
			format: 'dc+sd-jwt',
			meta: {
				vct_values: ['urn:eu.europa.ec.eudi:tax:1:1'],
			},
		};
	}

	/**
	 * Get human-readable description of diploma credential requirements
	 */
	public getDescription(): string {
		return 'Tax residency certificate';
	}
}
