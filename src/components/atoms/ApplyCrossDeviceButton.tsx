'use client';

import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import { Button, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ApplyCrossDeviceButton({ jobId }: { jobId: string }) {
	const [pending, setPending] = useState(false);
	const router = useRouter();

	const onClick = async () => {
		if (pending) return;
		setPending(true);

		try {
			const res = await fetch('/api/applications/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ jobId, sameDevice: false }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const { applicationId } = (await res.json()) as { applicationId: string };
			router.push(`/applications/${applicationId}`);
		} catch {
			toast.error('Failed to start cross-device flow.');
			setPending(false);
		}
	};

	return (
		<Button
			onClick={onClick}
			disabled={pending}
			variant="outlined"
			color="primary"
			startIcon={!pending ? <QrCode2OutlinedIcon /> : undefined}
		>
			{pending ? <CircularProgress size={20} /> : 'Apply'}
		</Button>
	);
}
