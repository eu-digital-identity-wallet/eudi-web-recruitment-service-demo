'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { toast } from 'react-toastify';

import LogoBox from './LogoBox';

export default function EmployeeIssuanceActions({ applicationId }: { applicationId: string }) {
	const [busy, setBusy] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const issueEmployeeCredential = async (mode: 'cross-device' | 'same-device') => {
		setBusy(true);
		try {
			const response = await fetch(`/api/applications/${applicationId}/issue-employee-id`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			const result = await response.json();

			if (mode === 'cross-device') {
				// Navigate to the QR code page
				window.location.href = `/applications/${applicationId}/employee-qr`;
			} else {
				// Same device - open the credential offer URL directly
				if (result.offerUrl) {
					// Try deep link; detect failure (no handler) by lack of backgrounding
					let opened = false;
					const onVisibility = () => {
						if (document.hidden) opened = true;
					};
					document.addEventListener('visibilitychange', onVisibility, { once: true });

					window.location.href = result.offerUrl;

					// If the page didn't background, show a hint
					setTimeout(() => {
						document.removeEventListener('visibilitychange', onVisibility);
						if (!opened) {
							toast.error('No wallet handled the link. Try the Cross-Device (QR Code) option.');
							setBusy(false);
						}
					}, 1500);
				} else {
					throw new Error('No offer URL received');
				}
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Couldn't issue employee credential.";
			toast.error(message);
			setBusy(false);
		}
	};

	return (
		<Box>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Employee ID</Typography>
			</Stack>

			<LogoBox />

			<Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
				Issue your employee ID for <strong>EUDI Demo Company</strong>
			</Typography>

			<Stack spacing={1} alignItems="center">
				{/* Only show Same Device button on mobile */}
				{mounted && isMobile && (
					<Button
						fullWidth
						variant="contained"
						color="success"
						startIcon={
							busy ? (
								<CircularProgress size={20} color="inherit" />
							) : (
								<AccountBalanceWalletOutlinedIcon />
							)
						}
						disabled={busy}
						onClick={() => issueEmployeeCredential('same-device')}
					>
						{busy ? 'Issuing…' : 'Issue Employee ID'}
					</Button>
				)}
				{/* Only show QR Code button on desktop */}
				{mounted && !isMobile && (
					<Button
						fullWidth
						variant="outlined"
						color="success"
						startIcon={
							busy ? <CircularProgress size={20} color="inherit" /> : <QrCode2OutlinedIcon />
						}
						disabled={busy}
						onClick={() => issueEmployeeCredential('cross-device')}
					>
						{busy ? 'Issuing…' : 'Issue Employee ID (QR Code)'}
					</Button>
				)}
			</Stack>
		</Box>
	);
}
