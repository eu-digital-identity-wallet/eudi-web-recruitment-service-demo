import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

import ApplicationVerificationPoller from '@/components/atoms/ApplicationVerificationPoller';
import JobIcon from '@/components/atoms/JobIcon';
import PIDVerificationQR from '@/components/organisms/PIDVerificationQR';

interface ApplicationPageProps {
	application: {
		id: string;
		vacancy?: {
			title: string;
		} | null;
	};
}

/**
 * Application Page Component (PID Verification Waiting Room)
 *
 * Purpose: Display QR code for PID verification during application process (desktop) or deep link button (mobile)
 *
 * This page is shown when:
 * - Application status is CREATED or VERIFYING
 * - User needs to scan QR code or click button to verify identity with PID
 */
export default function ApplicationPage({ application }: ApplicationPageProps) {
	const title = application.vacancy?.title ?? 'Application';

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								Application for {title}
							</Typography>
						</Stack>
					}
					subheader={
						<>
							<Typography variant="body2" color="text.secondary">
								Application ID: <strong>{application.id}</strong>
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Requesting: <strong>PID</strong>
							</Typography>
						</>
					}
				/>

				<CardContent sx={{ pt: 0, textAlign: 'center', '&:last-child': { pb: 2 } }}>
					<PIDVerificationQR
						applicationId={application.id}
						qrEndpoint={`/api/applications/${application.id}/qr-verify-pid`}
						poller={<ApplicationVerificationPoller applicationId={application.id} />}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
