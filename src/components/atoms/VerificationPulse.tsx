'use client';

import { Box, Stack, Typography, keyframes } from '@mui/material';

const ripple = keyframes`
  0%   { transform: scale(0.9); opacity: .9; }
  50%  { transform: scale(1.05); opacity: .5; }
  100% { transform: scale(0.9); opacity: .9; }
`;

export default function VerificationPulse() {
	return (
		<Stack
			direction="row"
			alignItems="center"
			spacing={2}
			sx={{ mt: 1.25 }}
			role="status"
			aria-live="polite"
			aria-label="Waiting for verification from EUDI Wallet"
		>
			<Typography variant="body2" color="text.secondary">
				Waiting for verification from EUDI Wallet
			</Typography>
			<Box
				sx={{
					position: 'relative',
					width: 32,
					height: 32,
					borderRadius: '50%',
					bgcolor: 'secondary.main',
					boxShadow: 2,
					animation: `${ripple} 1.4s ease-in-out infinite`,
					'@media (prefers-reduced-motion: reduce)': {
						animation: 'none',
					},
				}}
			/>
		</Stack>
	);
}
