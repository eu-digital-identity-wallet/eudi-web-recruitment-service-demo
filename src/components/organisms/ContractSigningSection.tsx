import { Link, Typography } from '@mui/material';

import SigningActions from '@/components/atoms/SigningActions';

interface ContractSigningSectionProps {
	applicationId: string;
	jobTitle: string;
	documentUrl: string;
	documentLabel: string;
}

/**
 * Contract Signing Section Organism
 *
 * Purpose: Display contract download link and signing actions
 *
 * Used in: SignContractPage
 */
export default function ContractSigningSection({
	applicationId,
	jobTitle,
	documentUrl,
	documentLabel,
}: ContractSigningSectionProps) {
	return (
		<>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				View contract:{' '}
				<Link href={documentUrl} target="_blank" rel="noopener noreferrer" download>
					{documentLabel} (256kb - PDF)
				</Link>
			</Typography>

			<SigningActions applicationId={applicationId} jobTitle={jobTitle} />
		</>
	);
}
