import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

import JobIcon from '@/components/atoms/JobIcon';
import EmployeeQRSection from '@/components/organisms/EmployeeQRSection';

interface EmployeeQRPageProps {
	application: {
		id: string;
		vacancy?: {
			title: string;
		} | null;
		candidateGivenName?: string | null;
		candidateFamilyName?: string | null;
	};
	otp?: string | null;
}

/**
 * Employee QR Page Component
 *
 * Purpose: Display QR code for cross-device employee credential issuance
 *
 * This is a page-level component that:
 * - Shows QR code for wallet scanning
 * - Displays OTP for credential verification
 * - Provides navigation back to employee page
 */
export default function EmployeeQRPage({ application, otp }: EmployeeQRPageProps) {
	const title = application.vacancy?.title ?? 'Position';
	const employeeName =
		application.candidateGivenName && application.candidateFamilyName
			? `${application.candidateGivenName} ${application.candidateFamilyName}`
			: 'Employee';

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								Employee Credential for {employeeName}
							</Typography>
						</Stack>
					}
					subheader={
						<>
							<Typography variant="body2" color="text.secondary">
								Application ID: <strong>{application.id}</strong>
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Position: <strong>{title}</strong>
							</Typography>
						</>
					}
				/>

				<CardContent sx={{ pt: 0, textAlign: 'center', '&:last-child': { pb: 2 } }}>
					<EmployeeQRSection applicationId={application.id} otp={otp} />
				</CardContent>
			</Card>
		</main>
	);
}
