'use client';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import DrawIcon from '@mui/icons-material/Draw';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	Stack,
	Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { createLogger } from '@/core/infrastructure/logging/Logger';

import TaxResidencyActions from './TaxResidencyActions';

const logger = createLogger('FinalizationActions');

export default function FinalizationActions({
	applicationId,
	jobTitle,
	companyName,
}: {
	applicationId: string;
	jobTitle: string;
	companyName: string;
}) {
	const router = useRouter();
	const [busy, setBusy] = useState<'sign' | 'finalise' | null>(null);
	const [contractStatus, setContractStatus] = useState<
		'loading' | 'not_signed' | 'signing' | 'signed'
	>('loading');
	const [dialogOpen, setDialogOpen] = useState(false);

	// Check contract signing status on mount
	useEffect(() => {
		const checkContractStatus = async () => {
			try {
				const response = await fetch(`/api/applications/${applicationId}/sign-contract-status`);
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
				logger.error('Failed to check contract status', error as Error);
				setContractStatus('not_signed');
			}
		};

		checkContractStatus();
	}, [applicationId]);

	const openFinalizeDialog = () => {
		setDialogOpen(true);
	};

	const closeFinalizeDialog = () => {
		setDialogOpen(false);
	};

	const signContract = async () => {
		setDialogOpen(false);
		setBusy('sign');
		try {
			// Initiate contract signing
			const response = await fetch(`/api/applications/${applicationId}/sign-contract`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `HTTP ${response.status}`);
			}

			await response.json();

			// Navigate to signing page
			router.push(`/applications/${applicationId}/sign-contract`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Couldn't start contract signing.";
			toast.error(message);
			setBusy(null);
		}
	};

	const finalise = async () => {
		setBusy('finalise');
		try {
			// Navigate to employee credential page
			router.push(`/applications/${applicationId}/employee`);
		} catch {
			toast.error("Couldn't finalise the application.");
			setBusy(null);
		}
	};

	return (
		<Box>
			<Stack spacing={2} alignItems="center">
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
						onClick={openFinalizeDialog}
					>
						Finalise your application
					</Button>
				) : contractStatus === 'signing' ? (
					<Button
						fullWidth
						variant="outlined"
						color="warning"
						startIcon={<DrawIcon />}
						onClick={() => router.push(`/applications/${applicationId}/sign-contract`)}
					>
						Continue signing contract
					</Button>
				) : (
					<>
						<Button
							fullWidth
							variant="contained"
							color="success"
							startIcon={<AccountBalanceWalletOutlinedIcon />}
							disabled={busy !== null}
							onClick={finalise}
						>
							{busy === 'finalise' ? 'Issuing…' : 'Issue Employee ID'}
						</Button>

						{/* Tax Residency section - only shown after contract is signed */}
						<Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
							OR
						</Typography>

						<Box
							sx={{
								p: 2,
								border: 1,
								borderColor: 'divider',
								borderRadius: 1,
								bgcolor: 'grey.50',
							}}
						>
							<TaxResidencyActions applicationId={applicationId} />
						</Box>
					</>
				)}
			</Stack>

			{/* Finalization Dialog */}
			<Dialog open={dialogOpen} onClose={closeFinalizeDialog} maxWidth="sm" fullWidth>
				<DialogTitle>Your application was successfully finalised</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 3 }}>
						You may now sign your contact with {companyName} for the position of{' '}
						<strong>{jobTitle}</strong>.
					</DialogContentText>
					<Stack spacing={2}>
						<Button
							fullWidth
							variant="contained"
							color="primary"
							startIcon={<DrawIcon />}
							onClick={signContract}
							disabled={busy === 'sign'}
						>
							{busy === 'sign' ? 'Starting…' : 'Sign contract'}
						</Button>
					</Stack>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
