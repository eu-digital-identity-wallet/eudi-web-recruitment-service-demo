import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Box, Grid, Stack, Typography } from '@mui/material';

import Field from '@/components/atoms/Field';

interface TaxResidencyDisplayProps {
	name?: string | null;
	address?: string | null;
	dateOfBirth?: string | null;
	identificationNumber?: string | null;
	taxpayerType?: string | null;
	startDateOfResidency?: string | null;
	endDateOfResidency?: string | null;
}

/**
 * Displays tax residency attestation information
 * from the verified TAXRESIDENCY credential
 */
export default function TaxResidencyDisplay({
	name,
	address,
	dateOfBirth,
	identificationNumber,
	taxpayerType,
	startDateOfResidency,
	endDateOfResidency,
}: TaxResidencyDisplayProps) {
	return (
		<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0 }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<AccountBalanceIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Tax Residency (optional)</Typography>
			</Stack>

			{name && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Name" value={name} />
				</Grid>
			)}

			{dateOfBirth && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Date of birth" value={new Date(dateOfBirth).toLocaleDateString('en-GB')} />
				</Grid>
			)}

			{address && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Address" value={address} />
				</Grid>
			)}

			{identificationNumber && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Identification number" value={identificationNumber} />
				</Grid>
			)}

			{taxpayerType && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field label="Taxpayer type" value={taxpayerType} />
				</Grid>
			)}

			{startDateOfResidency && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field
						label="Residency start date"
						value={new Date(startDateOfResidency).toLocaleDateString('en-GB')}
					/>
				</Grid>
			)}

			{endDateOfResidency && (
				<Grid sx={{ width: '100%', mb: 1 }}>
					<Field
						label="Residency end date"
						value={new Date(endDateOfResidency).toLocaleDateString('en-GB')}
					/>
				</Grid>
			)}
		</Box>
	);
}
