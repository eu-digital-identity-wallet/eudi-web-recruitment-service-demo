'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Alert,
	AlertTitle,
	Stack,
	Link,
} from '@mui/material';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';

interface CredentialOfferDisplayProps {
	offerUrl: string;
}

export default function CredentialOfferDisplay({ offerUrl }: CredentialOfferDisplayProps) {
	const [copied, setCopied] = useState(false);

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(offerUrl);
			setCopied(true);
			toast.success('Credential offer URL copied to clipboard!');
			setTimeout(() => setCopied(false), 3000);
		} catch {
			toast.error('Failed to copy URL');
		}
	};

	return (
		<Card variant="outlined" sx={{ mt: 3 }}>
			<CardContent>
				<Alert severity="success" sx={{ mb: 3 }}>
					<AlertTitle>Receipt Credential Issued!</AlertTitle>
					Your application receipt credential is ready. Scan the QR code or use the deep link to add
					it to your EUDI wallet.
				</Alert>

				<Stack spacing={3}>
					{/* QR Code */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							p: 3,
							bgcolor: 'background.default',
							borderRadius: 2,
						}}
					>
						<Typography variant="h6" sx={{ mb: 2 }}>
							Scan with EUDI Wallet
						</Typography>
						<Box
							sx={{
								p: 2,
								bgcolor: 'white',
								borderRadius: 1,
								display: 'inline-block',
							}}
						>
							<QRCode value={offerUrl} size={256} level="M" />
						</Box>
					</Box>

					{/* Deep Link Button */}
					<Box>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
							Or use the deep link:
						</Typography>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
							<Button
								component={Link}
								href={offerUrl}
								variant="outlined"
								color="primary"
								fullWidth
								sx={{ flex: 1 }}
							>
								Open in EUDI Wallet
							</Button>
							<Button
								variant="outlined"
								startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
								onClick={handleCopyUrl}
								color={copied ? 'success' : 'primary'}
								sx={{ minWidth: { sm: 'fit-content' } }}
							>
								{copied ? 'Copied!' : 'Copy URL'}
							</Button>
						</Stack>
					</Box>

					{/* URL Display */}
					<Box
						sx={{
							p: 2,
							bgcolor: 'grey.50',
							borderRadius: 1,
							wordBreak: 'break-all',
						}}
					>
						<Typography variant="caption" color="text.secondary">
							Credential Offer URL:
						</Typography>
						<Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
							{offerUrl}
						</Typography>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}
