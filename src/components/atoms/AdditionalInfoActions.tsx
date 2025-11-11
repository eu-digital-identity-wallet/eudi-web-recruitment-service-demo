'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import { Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { toast } from 'react-toastify';

import LogoBox from './LogoBox';

type VerifiedCredentialType = 'PID' | 'DIPLOMA' | 'SEAFARER' | 'TAXRESIDENCY';

export default function AdditionalInfoActions({
	applicationId,
	verifiedCredentials = [],
	requiredCredentials: _requiredCredentials = [],
}: {
	applicationId: string;
	verifiedCredentials?: Array<{
		credentialType: VerifiedCredentialType;
		status: string;
	}>;
	requiredCredentials?: string[];
}) {
	const router = useRouter();
	const [diploma, setDiploma] = useState(false);
	const [seafarer, setSeafarer] = useState(false);
	const [busy, setBusy] = useState<'provide' | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Check which credentials are already verified
	const hasDiploma = verifiedCredentials.some(
		(cred) => cred.credentialType === 'DIPLOMA' && cred.status === 'VERIFIED',
	);
	const hasSeafarer = verifiedCredentials.some(
		(cred) => cred.credentialType === 'SEAFARER' && cred.status === 'VERIFIED',
	);

	// Always allow submitting DIPLOMA and SEAFARER qualifications (they're always optional)
	// Only hide this section if BOTH are already verified
	const allQualificationsVerified = hasDiploma && hasSeafarer;

	const disabled = !diploma && !seafarer;

	const provideExtrasCrossDevice = async () => {
		setBusy('provide');
		try {
			const response = await fetch(`/api/applications/${applicationId}/verify-qualifications`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ diploma, seafarer, sameDeviceFlow: false }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			await response.json();

			// Navigate to dedicated QR extras page for cross-device flow
			// The verification data is now stored in the database
			router.push(`/applications/${applicationId}/qualifications`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't start the additional info flow.";
			toast.error(message);
			setBusy(null);
		}
	};

	const provideExtrasSameDevice = async () => {
		setBusy('provide');
		try {
			const response = await fetch(`/api/applications/${applicationId}/verify-qualifications`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ diploma, seafarer, sameDeviceFlow: true }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			const result = await response.json();

			// Redirect to same-device flow
			window.location.href = result.url;
			setBusy(null);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't start the additional info flow.";
			toast.error(message);
			setBusy(null);
		}
	};

	return (
		<Box>
			{/* Only show Additional Qualifications section if not all are verified */}
			{!allQualificationsVerified && (
				<>
					<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
						<AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
						<Typography variant="h6">Additional Qualifications (optional)</Typography>
					</Stack>

					<LogoBox />

					<Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
						Use your European Digital Identity Wallet to provide professional qualifications
					</Typography>

					<Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
						{!hasDiploma && (
							<FormControlLabel
								control={
									<Checkbox checked={diploma} onChange={(e) => setDiploma(e.target.checked)} />
								}
								label="Diploma"
							/>
						)}
						{!hasSeafarer && (
							<FormControlLabel
								control={
									<Checkbox checked={seafarer} onChange={(e) => setSeafarer(e.target.checked)} />
								}
								label="Seafarer Certificate"
							/>
						)}
					</Stack>

					<Stack spacing={1} sx={{ width: '100%' }}>
						{/* Only show Same Device button on mobile */}
						{mounted && isMobile && (
							<Button
								fullWidth
								variant="outlined"
								color="primary"
								startIcon={<AccountBalanceWalletOutlinedIcon />}
								disabled={disabled || busy !== null}
								onClick={provideExtrasSameDevice}
							>
								{busy === 'provide' ? 'Starting…' : 'Provide additional qualifications'}
							</Button>
						)}
						{/* Only show QR Code button on desktop */}
						{mounted && !isMobile && (
							<Button
								fullWidth
								variant="outlined"
								color="primary"
								startIcon={<QrCode2OutlinedIcon />}
								disabled={disabled || busy !== null}
								onClick={provideExtrasCrossDevice}
							>
								{busy === 'provide' ? 'Starting…' : 'Provide additional qualifications (QR Code)'}
							</Button>
						)}
					</Stack>
				</>
			)}
		</Box>
	);
}
