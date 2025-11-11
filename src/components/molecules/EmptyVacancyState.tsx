import { Box, Typography } from '@mui/material';

/**
 * Empty Vacancy State Molecule
 *
 * Purpose: Display empty state when no vacancies are available
 *
 * Used in: VacancyListPage
 */
export default function EmptyVacancyState() {
	return (
		<Box
			sx={{
				border: '1px dashed',
				borderColor: 'divider',
				borderRadius: 2,
				p: 4,
				textAlign: 'center',
				bgcolor: 'background.default',
			}}
		>
			<Typography variant="h6" sx={{ mb: 1 }}>
				No vacancies available
			</Typography>
			<Typography color="text.secondary">New roles will appear here—check back soon.</Typography>
		</Box>
	);
}
