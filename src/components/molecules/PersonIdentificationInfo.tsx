import BadgeIcon from '@mui/icons-material/Badge';
import { Box, Grid, Stack, Typography } from '@mui/material';

import Field from '@/components/atoms/Field';

interface PersonIdentificationInfoProps {
	familyName?: string | null;
	givenName?: string | null;
	dateOfBirth?: Date | null;
	nationality?: string | null;
	email?: string | null;
	mobilePhone?: string | null;
}

/**
 * Displays person identification information (PID) credentials
 * including name, date of birth, nationality, email, and phone.
 */
export default function PersonIdentificationInfo({
	familyName,
	givenName,
	dateOfBirth,
	nationality,
	email,
	mobilePhone,
}: PersonIdentificationInfoProps) {
	return (
		<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0 }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<BadgeIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Person Identification Information</Typography>
			</Stack>

			{familyName && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Family name" value={familyName} />
				</Grid>
			)}

			{givenName && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Given name" value={givenName} />
				</Grid>
			)}

			{dateOfBirth && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Date of birth" value={new Date(dateOfBirth).toLocaleDateString('en-GB')} />
				</Grid>
			)}

			{nationality && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Nationality" value={nationality} />
				</Grid>
			)}

			{email && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Email" value={email} />
				</Grid>
			)}

			{mobilePhone && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Mobile" value={mobilePhone} />
				</Grid>
			)}
		</Box>
	);
}
