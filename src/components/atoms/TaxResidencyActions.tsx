'use client';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { toast } from 'react-toastify';

import LogoBox from './LogoBox';

export default function TaxResidencyActions({ applicationId }: { applicationId: string }) {
	const router = useRouter();
	const [busy, setBusy] = useState<'cross' | 'same' | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const provideTaxResidencyCrossDevice = async () => {
		setBusy('cross');
		try {
			const response = await fetch(`/api/applications/${applicationId}/verify-tax-residency`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taxResidency: true, sameDeviceFlow: false }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			await response.json();

			// Navigate to tax residency QR code page
			router.push(`/applications/${applicationId}/tax-residency`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't start tax residency verification.";
			toast.error(message);
			setBusy(null);
		}
	};

	const provideTaxResidencySameDevice = async () => {
		setBusy('same');
		try {
			const response = await fetch(`/api/applications/${applicationId}/verify-tax-residency`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taxResidency: true, sameDeviceFlow: true }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			const result = await response.json();

			// Try deep link; detect failure (no handler) by lack of backgrounding
			let opened = false;
			const onVisibility = () => {
				if (document.hidden) opened = true;
			};
			document.addEventListener('visibilitychange', onVisibility, { once: true });

			window.location.href = result.url;

			// If the page didn't background, show a hint
			setTimeout(() => {
				document.removeEventListener('visibilitychange', onVisibility);
				if (!opened) {
					toast.error('No wallet handled the link. Try the QR Code option.');
					setBusy(null);
				}
			}, 1500);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't start tax residency verification.";
			toast.error(message);
			setBusy(null);
		}
	};

	return (
		<Box>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<AccountBalanceIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Tax Residency (optional)</Typography>
			</Stack>

			<LogoBox />

			<Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
				Use your European Digital Identity Wallet to provide tax residency attestation
			</Typography>

			<Stack spacing={1} alignItems="center">
				{/* Only show Same Device button on mobile */}
				{mounted && isMobile && (
					<Button
						fullWidth
						variant="outlined"
						color="primary"
						startIcon={<AccountBalanceWalletOutlinedIcon />}
						disabled={busy !== null}
						onClick={provideTaxResidencySameDevice}
					>
						{busy === 'same' ? 'Starting…' : 'Provide Tax Residency'}
					</Button>
				)}
				{/* Only show QR Code button on desktop */}
				{mounted && !isMobile && (
					<Button
						fullWidth
						variant="outlined"
						color="primary"
						startIcon={<QrCode2OutlinedIcon />}
						disabled={busy !== null}
						onClick={provideTaxResidencyCrossDevice}
					>
						{busy === 'cross' ? 'Starting…' : 'Provide Tax Residency (QR Code)'}
					</Button>
				)}
			</Stack>
		</Box>
	);
}
