'use client';

import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SchoolIcon from '@mui/icons-material/School';
import { Chip, Stack, Typography } from '@mui/material';

import type { CredentialType } from '@/server/domain/types';

interface CredentialRequirementChipsProps {
	requiredCredentials: CredentialType;
	variant?: 'outlined' | 'filled';
	size?: 'small' | 'medium';
}

export default function CredentialRequirementChips({
	requiredCredentials,
	variant = 'outlined',
	size = 'medium',
}: CredentialRequirementChipsProps) {
	if (requiredCredentials === 'NONE' || requiredCredentials === 'PID') {
		return null;
	}

	const showDiploma = requiredCredentials === 'DIPLOMA' || requiredCredentials === 'BOTH';
	const showSeafarer = requiredCredentials === 'SEAFARER' || requiredCredentials === 'BOTH';

	return (
		<Stack direction="row" spacing={1} alignItems="center">
			<Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
				Required:
			</Typography>

			{showDiploma && (
				<Chip icon={<SchoolIcon />} label="Diploma" variant={variant} color="primary" size={size} />
			)}

			{showSeafarer && (
				<Chip
					icon={<DirectionsBoatIcon />}
					label="Seafarer Certificate"
					variant={variant}
					color="primary"
					size={size}
				/>
			)}
		</Stack>
	);
}
