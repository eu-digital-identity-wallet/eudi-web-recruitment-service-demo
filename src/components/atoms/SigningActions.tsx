'use client';

import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Box, Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { toast } from 'react-toastify';

import LogoBanner from './LogoBanner';
import SigningStatusPoller from './SigningStatusPoller';
import VerificationPulse from './VerificationPulse';

export default function SigningActions({
	applicationId,
	jobTitle,
}: {
	applicationId: string;
	jobTitle: string;
}) {
	const [mode, setMode] = useState<'selection' | 'cross-device' | 'same-device'>('selection');
	const [busy, setBusy] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const startCrossDevice = async () => {
		setBusy(true);
		try {
			setMode('cross-device');
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't start cross-device signing.";
			toast.error(message);
			setBusy(false);
		}
	};

	const startSameDevice = async () => {
		setBusy(true);
		try {
			// Fetch the signing URL
			const response = await fetch(`/api/applications/${applicationId}/sign-contract`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			const data = await response.json();

			// Redirect to the signing URL
			if (data.signingUrl) {
				window.location.href = data.signingUrl;
			} else {
				throw new Error('No signing URL returned');
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't start same-device signing.";
			toast.error(message);
			setBusy(false);
		}
	};

	if (mode === 'cross-device') {
		return (
			<Box>
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
						Open your EUDI Wallet app and scan this QR code to sign the employment contract with
						your qualified electronic signature (QES)
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
							src={`/api/applications/${applicationId}/qr-contract-signing`}
							alt="Document Signing QR"
							width={340}
							height={340}
							style={{ display: 'block' }}
							priority
							unoptimized
						/>
					</Box>
				</Box>

				{/* Logo Banner with integrated loading */}
				<Box sx={{ mt: 2 }}>
					<LogoBanner>
						<VerificationPulse />
					</LogoBanner>
				</Box>

				{/* Status Poller */}
				<Box sx={{ mt: 1 }}>
					<SigningStatusPoller applicationId={applicationId} />
				</Box>
			</Box>
		);
	}

	// Selection mode - show two buttons
	return (
		<Box>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
				Sign your contact with EUDI Demo Company for the position of <strong>{jobTitle}</strong>{' '}
				with EU Wallet.
			</Typography>

			<Stack spacing={2} alignItems="center">
				{/* Only show QR Code button on desktop */}
				{mounted && !isMobile && (
					<Button
						fullWidth
						variant="outlined"
						color="primary"
						startIcon={<QrCodeIcon />}
						disabled={busy}
						onClick={startCrossDevice}
					>
						Sign contract (Cross Device)
					</Button>
				)}
				{/* Only show Same Device button on mobile */}
				{mounted && isMobile && (
					<Button
						fullWidth
						variant="contained"
						color="primary"
						startIcon={<PhoneAndroidIcon />}
						disabled={busy}
						onClick={startSameDevice}
					>
						{busy ? 'Starting…' : 'Sign contract (Same Device)'}
					</Button>
				)}
			</Stack>
		</Box>
	);
}
