'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Box, Chip, Stack, Typography } from '@mui/material';

import ApplyCrossDeviceButton from '@/components/atoms/ApplyCrossDeviceButton';
import ApplySameDeviceButton from '@/components/atoms/ApplySameDeviceButton';
import LogoBox from '@/components/atoms/LogoBox';

interface VacancyApplicationSectionProps {
	vacancyId: string;
	requiredCredentials: string[];
}

/**
 * Vacancy application section organism
 * Displays EUDI wallet integration and application buttons
 */
export default function VacancyApplicationSection({
	vacancyId,
	requiredCredentials,
}: VacancyApplicationSectionProps) {
	// Filter out basic credentials (NONE, PID)
	const optionalCredentials = requiredCredentials.filter(
		(cred) => cred !== 'NONE' && cred !== 'PID',
	);

	return (
		<Box
			sx={{
				p: 2,
				border: 1,
				borderColor: 'divider',
				borderRadius: 0,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				width: '100%',
			}}
		>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
				<AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Apply for this position</Typography>
			</Stack>
			<LogoBox />
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
				Use your European Digital Identity Wallet to apply for this position securely
			</Typography>

			{optionalCredentials.length > 0 && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						Optional Credentials:
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
						{optionalCredentials.includes('DIPLOMA') && (
							<Chip color="primary" variant="outlined" label="Diploma (optional)" />
						)}
						{optionalCredentials.includes('SEAFARER') && (
							<Chip color="primary" variant="outlined" label="Seafarer Certificate (optional)" />
						)}
					</Stack>
				</Box>
			)}

			<Stack spacing={2}>
				<ApplySameDeviceButton jobId={vacancyId} />
				<ApplyCrossDeviceButton jobId={vacancyId} />
			</Stack>
		</Box>
	);
}
