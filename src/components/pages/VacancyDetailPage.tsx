import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { Box, Button, Card, CardHeader, CardContent, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import JobIcon from '@/components/atoms/JobIcon';
import VacancyDescription from '@/components/molecules/VacancyDescription';
import VacancyApplicationSection from '@/components/organisms/VacancyApplicationSection';

interface VacancyDetailPageProps {
	vacancy: {
		id: string;
		title: string;
		description: string;
		createdAt: Date;
		requiredCredentials: string[];
	};
}

/**
 * Vacancy Detail Page Component
 *
 * Purpose: Display full vacancy details and provide application options
 *
 * This is a page-level component that:
 * - Shows complete job description
 * - Displays required/optional credentials
 * - Provides same-device and cross-device application flows
 */
export default function VacancyDetailPage({ vacancy }: VacancyDetailPageProps) {
	return (
		<main>
			{/* Back link */}
			<Box sx={{ mb: 2 }}>
				<Button
					component={Link}
					href="/"
					startIcon={<ArrowBackIosNewRoundedIcon fontSize="small" />}
					variant="text"
				>
					Back to Jobs
				</Button>
			</Box>

			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={vacancy.title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								{vacancy.title}
							</Typography>
						</Stack>
					}
					subheader={
						<Typography variant="body2" color="text.secondary">
							Published on: <strong>{vacancy.createdAt.toLocaleDateString('en-GB')}</strong>
						</Typography>
					}
				/>

				<CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', lg: 'row' },
							gap: 3,
							alignItems: 'stretch',
						}}
					>
						{/* Job Description Section */}
						<Box sx={{ flex: 1, display: 'flex' }}>
							<VacancyDescription description={vacancy.description} />
						</Box>

						{/* Apply Section */}
						<Box sx={{ flex: 1, display: 'flex' }}>
							<VacancyApplicationSection
								vacancyId={vacancy.id}
								requiredCredentials={vacancy.requiredCredentials}
							/>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</main>
	);
}
