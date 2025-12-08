'use client';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ApplySameDeviceButton({ jobId }: { jobId: string }) {
	const [pending, setPending] = useState(false);

	const onClick = async () => {
		if (pending) return;
		setPending(true);

		try {
			const res = await fetch('/api/applications/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ jobId, sameDevice: true }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const { url } = (await res.json()) as { url: string };

			// Try deep link; detect failure (no handler) by lack of backgrounding
			let opened = false;
			const onVisibility = () => {
				if (document.hidden) opened = true;
			};
			document.addEventListener('visibilitychange', onVisibility, { once: true });

			window.location.href = url;

			// If the page didn't background, show a hint
			setTimeout(() => {
				document.removeEventListener('visibilitychange', onVisibility);
				if (!opened) {
					toast.error('No wallet handled the link. Try the QR (cross-device) option.');
					setPending(false);
				}
			}, 1500);
		} catch {
			toast.error("Couldn't open the wallet link. Try the QR (cross-device) option.");
			setPending(false);
		}
	};

	return (
		<Button
			onClick={onClick}
			disabled={pending}
			variant="contained"
			color="secondary" // your yellow/orange
			startIcon={!pending ? <AccountBalanceWalletOutlinedIcon /> : undefined}
		>
			{pending ? <CircularProgress size={20} /> : 'Apply'}
		</Button>
	);
}
