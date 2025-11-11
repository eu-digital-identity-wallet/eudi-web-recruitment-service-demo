import BadgeIcon from '@mui/icons-material/Badge';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Box, Chip, Grid, Stack, Typography } from '@mui/material';

import type { VerifiedCredentialData } from '@/components/types';

interface CredentialStatusDisplayProps {
	credentials: VerifiedCredentialData[];
}

/**
 * Displays verified credentials as chips with appropriate icons.
 * Only shows credentials that have been successfully verified.
 */
export default function CredentialStatusDisplay({ credentials }: CredentialStatusDisplayProps) {
	const getCredentialIcon = (type: string) => {
		switch (type) {
			case 'PID':
				return <BadgeIcon />;
			case 'DIPLOMA':
				return <SchoolIcon />;
			case 'SEAFARER':
				return <DirectionsBoatIcon />;
			default:
				return <BadgeIcon />;
		}
	};

	const getCredentialLabel = (type: string) => {
		switch (type) {
			case 'PID':
				return 'PID (Person Identification)';
			case 'DIPLOMA':
				return 'Diploma';
			case 'SEAFARER':
				return 'Seafarer Certificate';
			default:
				return type;
		}
	};

	const verifiedCredentials = credentials.filter((cred) => cred.status === 'VERIFIED');

	return (
		<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0 }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<VerifiedUserIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Credential Status</Typography>
			</Stack>

			<Grid sx={{ width: '100%', mb: 1 }}>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
					Verified Credentials:
				</Typography>
				<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
					{verifiedCredentials.map((cred) => (
						<Chip
							key={cred.id}
							icon={getCredentialIcon(cred.credentialType)}
							label={getCredentialLabel(cred.credentialType)}
							color="success"
							size="small"
							variant="filled"
						/>
					))}
				</Stack>
			</Grid>
		</Box>
	);
}
