import { Box, Typography } from '@mui/material';

interface FieldProps {
	label: string;
	value?: string | null;
}

/**
 * Displays a labeled field with a value in a styled box.
 * Returns null if no value is provided.
 */
export default function Field({ label, value }: FieldProps) {
	if (!value) return null;

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 2,
				p: 1.5,
				borderRadius: 1,
				bgcolor: 'grey.50',
			}}
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" fontWeight={600} color="text.primary">
				{value}
			</Typography>
		</Box>
	);
}
