import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';

import EmptyVacancyState from '@/components/molecules/EmptyVacancyState';
import VacancyCard from '@/components/molecules/VacancyCard';
import VacancyListHeader from '@/components/organisms/VacancyListHeader';

interface VacancyListPageProps {
	vacancies: {
		id: string;
		title: string;
		description: string;
		createdAt: Date;
		requiredCredentials: string[];
	}[];
}

/**
 * Vacancy List Page Component
 *
 * Purpose: Display listing of all available vacancies
 *
 * This page displays:
 * - Page header with title and description
 * - Grid of vacancy cards
 * - Empty state when no vacancies
 */
export default function VacancyListPage({ vacancies }: VacancyListPageProps) {
	return (
		<main>
			<VacancyListHeader />

			<Grid container spacing={3}>
				{vacancies.map((vacancy) => (
					<Grid component={Box} key={vacancy.id}>
						<VacancyCard vacancy={vacancy} />
					</Grid>
				))}

				{vacancies.length === 0 && (
					<Grid component={Box}>
						<EmptyVacancyState />
					</Grid>
				)}
			</Grid>
		</main>
	);
}
