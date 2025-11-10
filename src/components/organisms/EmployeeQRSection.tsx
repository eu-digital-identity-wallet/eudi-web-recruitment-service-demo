'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import LogoBanner from '@/components/atoms/LogoBanner';
import VerificationPulse from '@/components/atoms/VerificationPulse';

interface EmployeeQRSectionProps {
	applicationId: string;
	otp?: string | null;
}

/**
 * Employee QR Code Section Organism
 * Displays QR code for employee credential issuance with OTP
 */
export default function EmployeeQRSection({ applicationId, otp }: EmployeeQRSectionProps) {
	return (
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
				<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
					<AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
					<Typography variant="h6">Scan with EUDI Wallet</Typography>
				</Stack>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Open your EUDI Wallet app and scan this QR code to receive your employee credential
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
						src={`/api/applications/${applicationId}/qr-issue-employee-id`}
						alt="Employee Credential QR"
						width={340}
						height={340}
						style={{ display: 'block' }}
						priority
						unoptimized
					/>
				</Box>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					After scanning, your employee contract and ID will be added to your wallet.
				</Typography>

				{otp && (
					<Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
							One-Time Password (OTP):
						</Typography>
						<Typography
							variant="h4"
							sx={{
								fontFamily: 'monospace',
								fontWeight: 'bold',
								letterSpacing: '0.2em',
								color: 'primary.main',
							}}
						>
							{otp}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
							Enter this code in your EUDI Wallet app when prompted
						</Typography>
					</Box>
				)}

				<Box sx={{ mt: 3 }}>
					<Button
						component={Link}
						href={`/applications/${applicationId}/employee`}
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						fullWidth
					>
						Return to Employee Page
					</Button>
				</Box>
			</Box>

			{/* Logo Banner with integrated loading */}
			<Box sx={{ mt: 2 }}>
				<LogoBanner>
					<VerificationPulse />
				</LogoBanner>
			</Box>
		</>
	);
}
