'use client';

import ReceiptIcon from '@mui/icons-material/Receipt';
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface IssueReceiptButtonProps {
	applicationId: string;
	onSuccess: (offerUrl: string) => void;
}

export default function IssueReceiptButton({ applicationId, onSuccess }: IssueReceiptButtonProps) {
	const [loading, setLoading] = useState(false);

	const handleIssueReceipt = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/applications/${applicationId}/issue-receipt`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to issue receipt');
			}

			toast.success('Receipt credential issued successfully!');
			onSuccess(data.offerUrl);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to issue receipt';
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant="contained"
			color="primary"
			startIcon={loading ? <CircularProgress size={20} /> : <ReceiptIcon />}
			onClick={handleIssueReceipt}
			disabled={loading}
			fullWidth
		>
			{loading ? 'Issuing Receipt...' : 'Issue Application Receipt'}
		</Button>
	);
}
