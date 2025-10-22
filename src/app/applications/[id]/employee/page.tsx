import 'server-only';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Box, Card, CardContent, CardHeader, Typography, Alert } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import LogoBanner from '@/components/atoms/LogoBanner';
import VerificationPulse from '@/components/atoms/VerificationPulse';
import { Container } from '@/server';
import { ApplicationService } from '@/server/services/ApplicationService';
import { IssuerService } from '@/server/services/IssuerService';

export const dynamic = 'force-dynamic';

export default async function EmployeeCredentialPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const applicationService = Container.get(ApplicationService);
	const issuerService = Container.get(IssuerService);
	const { id } = await params;
	if (!id) return notFound();

	const app = await applicationService.details(id);
	if (!app) return notFound();

	// Only allow access once the application is verified
	if (app.status !== 'VERIFIED' && app.status !== 'ISSUED') return notFound();

	// Check if credential already exists in DB
	let existingCredential = await issuerService.getCredentialByApplicationId(
		id,
		'eu.europa.ec.eudi.employee_mdoc',
	);

	let issuerError: string | null = null;

	// If not exists, create it
	if (!existingCredential) {
		try {
			if (!app.job) {
				throw new Error('Application has no associated job');
			}
			await issuerService.issueApplicationReceipt(
				app as typeof app & { job: NonNullable<typeof app.job> },
			);
			// Fetch the newly created credential
			existingCredential = await issuerService.getCredentialByApplicationId(
				id,
				'eu.europa.ec.eudi.employee_mdoc',
			);
		} catch (error) {
			issuerError = error instanceof Error ? error.message : 'Unknown error occurred';
		}
	}

	const otp = existingCredential?.otp;

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
					title={
						<Typography variant="h5" component="h1">
							Issue Your Employee Credential
						</Typography>
					}
					subheader={
						<>
							<Typography variant="body2" color="text.secondary">
								Application ID: <strong>{app.id}</strong>
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Issuing: <strong>Employee Credential</strong>
							</Typography>
						</>
					}
				/>

				<CardContent sx={{ pt: 0, textAlign: 'center', '&:last-child': { pb: 2 } }}>
					{existingCredential ? (
						<>
							{/* QR Code */}
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									p: 2,
									border: 1,
									borderColor: 'divider',
									borderRadius: 0,
								}}
							>
								<Typography variant="h6" sx={{ mb: 1 }}>
									Scan with EUDI Wallet
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									Open your EUDI Wallet app and scan this QR code to receive your employee
									credential
								</Typography>
								<Box
									sx={{
										p: 2,
										bgcolor: 'white',
										borderRadius: 1,
										display: 'inline-block',
										border: '1px solid',
										borderColor: 'divider',
									}}
								>
									<Image
										src={`/api/applications/qr-issue/${id}`}
										alt="Employee Credential QR Code"
										width={340}
										height={340}
										style={{ display: 'block' }}
										unoptimized
									/>
								</Box>
							</Box>
						</>
					) : (
						<Alert
							severity="error"
							sx={{
								mt: 2,
								'& .MuiAlert-message': {
									width: '100%',
									textAlign: 'center',
								},
							}}
						>
							<Typography variant="body1" sx={{ mb: 1 }}>
								<strong>Unable to Generate Credential</strong>
							</Typography>
							<Typography variant="body2">
								{issuerError ||
									'There was an error generating your employee credential. This service requires registration with the EUDI issuer. Please contact the administrator or try again later.'}
							</Typography>
						</Alert>
					)}

					{/* Display OTP if required */}
					{otp && (
						<Alert
							severity="info"
							sx={{ mt: 2, '& .MuiAlert-message': { width: '100%', textAlign: 'center' } }}
						>
							<Typography variant="body2" sx={{ mb: 1 }}>
								<strong>PIN Required:</strong>
							</Typography>
							<Typography
								variant="h4"
								component="div"
								sx={{
									fontFamily: 'monospace',
									letterSpacing: '0.5em',
									textAlign: 'center',
									color: 'primary.main',
									fontWeight: 'bold',
								}}
							>
								{otp}
							</Typography>
							<Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
								Enter this PIN in your EUDI Wallet when prompted
							</Typography>
						</Alert>
					)}

					{/* Logo Banner with loading indicator */}
					<Box sx={{ mt: 2 }}>
						<LogoBanner>
							<VerificationPulse />
						</LogoBanner>
					</Box>
				</CardContent>
			</Card>
		</main>
	);
}
