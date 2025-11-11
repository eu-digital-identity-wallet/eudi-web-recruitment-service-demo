import WorkIcon from '@mui/icons-material/Work';
import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

import JobIcon from '@/components/atoms/JobIcon';
import QualificationsVerificationPoller from '@/components/atoms/QualificationsVerificationPoller';
import CredentialVerificationQR from '@/components/organisms/CredentialVerificationQR';

interface QualificationsVerificationPageProps {
	application: {
		id: string;
		vacancy?: {
			title: string;
		} | null;
	};
	credentialTypeLabel: string;
}

/**
 * Qualifications Verification Page Component
 *
 * Purpose: Display QR code for professional qualifications verification
 *
 * This page handles verification of Diploma and/or Seafarer certificates
 */
export default function QualificationsVerificationPage({
	application,
	credentialTypeLabel,
}: QualificationsVerificationPageProps) {
	const title = application.vacancy?.title ?? 'Application';

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								Additional Credentials for {title}
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
						title={`Verify ${credentialTypeLabel}`}
						description={`Scan the QR code with your EUDI Wallet to share your ${credentialTypeLabel}`}
						icon={<WorkIcon sx={{ color: 'primary.main' }} />}
						qrEndpoint={`/api/applications/${application.id}/qr-verify-qualifications`}
						poller={<QualificationsVerificationPoller applicationId={application.id} />}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
