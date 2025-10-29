'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import DrawIcon from '@mui/icons-material/Draw';
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	Typography,
	CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import LogoBox from './LogoBox';

export default function AdditionalInfoActions({ applicationId }: { applicationId: string }) {
	const [diploma, setDiploma] = useState(false);
	const [seafarer, setSeafarer] = useState(false);
	const [taxResidency, setTaxResidency] = useState(false);
	const [busy, setBusy] = useState<'provide' | 'sign' | 'finalise' | null>(null);
	const [contractStatus, setContractStatus] = useState<
		'loading' | 'not_signed' | 'signing' | 'signed'
	>('loading');

	const disabled = !diploma && !seafarer && !taxResidency;

	// Check contract signing status on mount
	useEffect(() => {
		const checkContractStatus = async () => {
			try {
				const response = await fetch(`/api/applications/signing-status/${applicationId}`);
				if (response.ok) {
					const data = await response.json();
					if (data.status === 'SIGNED') {
						setContractStatus('signed');
					} else if (data.status === 'PENDING') {
						setContractStatus('signing');
					} else {
						setContractStatus('not_signed');
					}
				} else {
					setContractStatus('not_signed');
				}
			} catch (error) {
				console.error('Failed to check contract status:', error);
				setContractStatus('not_signed');
			}
		};

		checkContractStatus();
	}, [applicationId]);

	const signContract = async () => {
		setBusy('sign');
		try {
			// Initiate document signing
			const response = await fetch(`/api/applications/${applicationId}/sign-document`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			await response.json();

			// Navigate to signing page
			window.location.href = `/applications/${applicationId}/sign-contract`;
		} catch (error) {
			const message = error instanceof Error ? error.message : "Couldn't start contract signing.";
			toast.error(message);
			setBusy(null);
		}
	};

	const provideExtrasCrossDevice = async () => {
		setBusy('provide');
		try {
			const response = await fetch(`/api/applications/${applicationId}/extras`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ diploma, seafarer, taxResidency, sameDeviceFlow: false }),
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
				body: JSON.stringify({ diploma, seafarer, taxResidency, sameDeviceFlow: true }),
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
				<FormControlLabel
					control={
						<Checkbox checked={taxResidency} onChange={(e) => setTaxResidency(e.target.checked)} />
					}
					label="Tax Residency"
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

				{contractStatus === 'loading' ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
						<CircularProgress size={24} />
					</Box>
				) : contractStatus === 'not_signed' ? (
					<Button
						fullWidth
						variant="contained"
						color="secondary"
						startIcon={<DrawIcon />}
						disabled={busy !== null}
						onClick={signContract}
					>
						{busy === 'sign' ? 'Starting…' : 'Sign your contract'}
					</Button>
				) : contractStatus === 'signing' ? (
					<Button
						fullWidth
						variant="outlined"
						color="warning"
						startIcon={<DrawIcon />}
						onClick={() => (window.location.href = `/applications/${applicationId}/sign-contract`)}
					>
						Continue signing contract
					</Button>
				) : (
					<Button
						fullWidth
						variant="contained"
						color="success"
						startIcon={<AccountBalanceWalletOutlinedIcon />}
						disabled={busy !== null}
						onClick={finalize}
					>
						{busy === 'finalise' ? 'Issuing…' : 'Issue Employee ID'}
					</Button>
				)}
			</Stack>
		</Box>
	);
}
