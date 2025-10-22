'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

import LogoBox from './LogoBox';

export default function AdditionalInfoActions({ applicationId }: { applicationId: string }) {
	const [diploma, setDiploma] = useState(false);
	const [seafarer, setSeafarer] = useState(false);
	const [busy, setBusy] = useState<'provide' | 'finalise' | null>(null);

	const disabled = !diploma && !seafarer;

	const provideExtrasCrossDevice = async () => {
		setBusy('provide');
		try {
			const response = await fetch(`/api/applications/${applicationId}/extras`, {
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
			window.location.href = `/applications/${applicationId}/extras`;
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
			const response = await fetch(`/api/applications/${applicationId}/extras`, {
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

	const finalize = async () => {
		setBusy('finalise');
		try {
			// Navigate to employee credential page
			window.location.href = `/applications/${applicationId}/employee`;
		} catch {
			toast.error("Couldn't finalise the application.");
			setBusy(null);
		}
	};

	return (
		<Box>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Additional information (optional)</Typography>
			</Stack>

			<LogoBox />

			<Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
				Use your European Digital Identity Wallet to provide additional credentials securely
			</Typography>

			<Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
				<FormControlLabel
					control={<Checkbox checked={diploma} onChange={(e) => setDiploma(e.target.checked)} />}
					label="Diploma"
				/>
				<FormControlLabel
					control={<Checkbox checked={seafarer} onChange={(e) => setSeafarer(e.target.checked)} />}
					label="Seafarer Certificate"
				/>
			</Stack>

			<Stack spacing={2} alignItems="center">
				<Stack spacing={1} sx={{ width: '100%' }}>
					<Button
						fullWidth
						variant="outlined"
						color="primary"
						startIcon={<AccountBalanceWalletOutlinedIcon />}
						disabled={disabled || busy !== null}
						onClick={provideExtrasCrossDevice}
					>
						{busy === 'provide' ? 'Starting…' : 'Provide additional information (Cross Device)'}
					</Button>
					<Button
						fullWidth
						variant="outlined"
						color="primary"
						startIcon={<AccountBalanceWalletOutlinedIcon />}
						disabled={disabled || busy !== null}
						onClick={provideExtrasSameDevice}
					>
						{busy === 'provide' ? 'Starting…' : 'Provide additional information (Same Device)'}
					</Button>
				</Stack>

				<Typography variant="body2" color="text.secondary">
					OR
				</Typography>

				<Button
					fullWidth
					variant="contained"
					color="secondary"
					startIcon={<AccountBalanceWalletOutlinedIcon />}
					disabled={busy !== null}
					onClick={finalize}
				>
					{busy === 'finalise' ? 'Finalising…' : 'Finalise your job application'}
				</Button>
			</Stack>
		</Box>
	);
}
