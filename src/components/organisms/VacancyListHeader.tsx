import { Box, Divider, Typography } from '@mui/material';

/**
 * Vacancy List Header Organism
 *
 * Purpose: Display page header for vacancy board listing
 *
 * Used in: VacancyListPage
 */
export default function VacancyListHeader() {
	return (
		<>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h1" component="h1" sx={{ mb: 1 }}>
					Available Vacancies
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Browse current openings and start your application in a few clicks.
				</Typography>
			</Box>

			<Divider sx={{ my: 3 }} />
		</>
	);
}
