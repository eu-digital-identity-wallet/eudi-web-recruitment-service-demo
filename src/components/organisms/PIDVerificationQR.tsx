'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';

import LogoBanner from '@/components/atoms/LogoBanner';
import VerificationPulse from '@/components/atoms/VerificationPulse';

import type { ReactNode } from 'react';

interface PIDVerificationQRProps {
	applicationId: string;
	qrEndpoint: string;
	poller: ReactNode;
}

/**
 * PID Verification QR Organism
 *
 * Purpose: Display QR code for PID verification
 *
 * Used in: ApplicationPage (PID verification waiting room)
 */
export default function PIDVerificationQR({
	applicationId: _applicationId,
	qrEndpoint,
	poller,
}: PIDVerificationQRProps) {
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
				<Typography variant="h6" sx={{ mb: 1 }}>
					Scan with EUDI Wallet
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Open your EUDI Wallet app and scan this QR code to verify your identity
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
						alt="Verification QR"
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

			{/* Poller */}
			<Box sx={{ mt: 1 }}>{poller}</Box>
		</>
	);
}
