import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Stack,
	Typography,
} from '@mui/material';
import Link from 'next/link';

import CredentialRequirementChips from '@/components/atoms/CredentialRequirementChips';
import JobIcon from '@/components/atoms/JobIcon';

interface VacancyCardProps {
	vacancy: {
		id: string;
		title: string;
		description: string;
		createdAt: Date;
		requiredCredentials: string[];
	};
}

/**
 * Vacancy Card Molecule
 *
 * Purpose: Display individual vacancy card with title, description, credentials, and action button
 *
 * Used in: VacancyListPage
 */
export default function VacancyCard({ vacancy }: VacancyCardProps) {
	return (
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

			<CardContent sx={{ pt: 0 }}>
				<Typography variant="body1" sx={{ mb: 2 }}>
					{vacancy.description || 'No description provided.'}
				</Typography>
				<CredentialRequirementChips
					requiredCredentials={
						vacancy.requiredCredentials.length > 0 ? vacancy.requiredCredentials.join(',') : 'NONE'
					}
					size="small"
				/>
			</CardContent>

			<CardActions
				sx={{
					px: 2,
					pb: 2,
					pt: 0,
					display: 'flex',
					justifyContent: 'flex-end',
				}}
			>
				<Button
					component={Link}
					href={`/vacancies/${vacancy.id}`}
					variant="contained"
					color="secondary"
				>
					View details
				</Button>
			</CardActions>
		</Card>
	);
}
