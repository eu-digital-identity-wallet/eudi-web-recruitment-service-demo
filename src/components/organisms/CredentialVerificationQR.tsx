'use client';

import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';

import LogoBanner from '@/components/atoms/LogoBanner';
import VerificationPulse from '@/components/atoms/VerificationPulse';

import type { ReactNode } from 'react';

interface CredentialVerificationQRProps {
	applicationId: string;
	title: string;
	description: string;
	icon: ReactNode;
	qrEndpoint: string;
	poller: ReactNode;
}

/**
 * Credential Verification QR Organism
 * Reusable component for displaying QR codes for credential verification
 * Used for qualifications, tax residency, and other verification flows
 */
export default function CredentialVerificationQR({
	applicationId: _applicationId,
	title,
	description,
	icon,
	qrEndpoint,
	poller,
}: CredentialVerificationQRProps) {
	return (
		<>
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
				<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
					{icon}
					<Typography variant="h6">{title}</Typography>
				</Stack>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{description}
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
						src={qrEndpoint}
						alt={`${title} QR Code`}
						width={340}
						height={340}
						style={{ display: 'block' }}
						priority
						unoptimized
					/>
				</Box>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					After verification, you will be automatically redirected to continue your application.
				</Typography>
			</Box>

			{/* Logo Banner with integrated loading */}
			<Box sx={{ mt: 2 }}>
				<LogoBanner>
					<VerificationPulse />
				</LogoBanner>
			</Box>

			{/* Poller */}
			<Box sx={{ mt: 1 }}>{poller}</Box>
		</>
	);
}
