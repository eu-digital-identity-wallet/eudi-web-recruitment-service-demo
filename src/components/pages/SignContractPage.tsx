import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

import JobIcon from '@/components/atoms/JobIcon';
import ContractSigningSection from '@/components/organisms/ContractSigningSection';

interface SignContractPageProps {
	application: {
		id: string;
		vacancy?: {
			title: string;
		} | null;
	};
	documentUrl: string;
	documentLabel: string;
}

/**
 * Sign Contract Page Component
 *
 * Purpose: Display contract and signing options
 *
 * This page is shown when:
 * - Application status is FINALIZED or SIGNING
 * - User is ready to sign the employment contract
 */
export default function SignContractPage({
	application,
	documentUrl,
	documentLabel,
}: SignContractPageProps) {
	const title = application.vacancy?.title ?? 'Application';

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								Employment Contract
							</Typography>
						</Stack>
					}
				/>

				<CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
					<ContractSigningSection
						applicationId={application.id}
						jobTitle={title}
						documentUrl={documentUrl}
						documentLabel={documentLabel}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
