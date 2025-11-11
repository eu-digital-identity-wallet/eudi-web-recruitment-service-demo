import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

import JobIcon from '@/components/atoms/JobIcon';
import QualificationsVerificationPoller from '@/components/atoms/QualificationsVerificationPoller';
import CredentialVerificationQR from '@/components/organisms/CredentialVerificationQR';

interface TaxResidencyVerificationPageProps {
	application: {
		id: string;
		vacancy?: {
			title: string;
		} | null;
	};
}

/**
 * Tax Residency Verification Page Component
 *
 * Purpose: Display QR code for tax residency attestation verification
 *
 * This page handles verification of tax residency attestation (post-signing)
 */
export default function TaxResidencyVerificationPage({
	application,
}: TaxResidencyVerificationPageProps) {
	const title = application.vacancy?.title ?? 'Application';

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								Tax Residency Attestation for {title}
							</Typography>
						</Stack>
					}
					subheader={
						<Typography variant="body2" color="text.secondary">
							Application ID: <strong>{application.id}</strong>
						</Typography>
					}
				/>

				<CardContent sx={{ pt: 0, textAlign: 'center', '&:last-child': { pb: 2 } }}>
					<CredentialVerificationQR
						applicationId={application.id}
						title="Verify Tax Residency"
						description="Scan the QR code with your EUDI Wallet to share your tax residency attestation"
						icon={<AccountBalanceIcon sx={{ color: 'primary.main' }} />}
						qrEndpoint={`/api/applications/${application.id}/qr-verify-qualifications`}
						poller={<QualificationsVerificationPoller applicationId={application.id} />}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
