import 'server-only';

import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Divider,
	Stack,
	Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';

import CredentialRequirementChips from '@/components/atoms/CredentialRequirementChips';
import JobIcon from '@/components/atoms/JobIcon';
import { Container } from '@/server';
import { JobService } from '@/server/services/JobService';

export const dynamic = 'force-dynamic';

export default async function JobBoardPage() {
	const jobService = Container.get(JobService);
	const jobs = await jobService.list();

	return (
		<main>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h1" component="h1" sx={{ mb: 1 }}>
					Available Jobs
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Browse current openings and start your application in a few clicks.
				</Typography>
			</Box>

			<Divider sx={{ my: 3 }} />

			<Grid container spacing={3}>
				{jobs.map((job) => (
					<Grid component={Box} key={job.getId()}>
						<Card variant="outlined">
							<CardHeader
								avatar={<JobIcon title={job.getTitle()} />}
								title={
									<Stack spacing={0.5}>
										<Typography variant="h5" component="h1">
											{job.getTitle()}
										</Typography>
									</Stack>
								}
								subheader={
									<>
										<Typography variant="body2" color="text.secondary">
											Published on:{' '}
											<strong>{new Date(job.getCreatedAt()).toLocaleDateString('en-GB')}</strong>
										</Typography>
									</>
								}
							/>

							<CardContent sx={{ pt: 0 }}>
								<Typography variant="body1" sx={{ mb: 2 }}>
									{job.getDescription() ?? 'No description provided.'}
								</Typography>
								<CredentialRequirementChips
									requiredCredentials={job.getRequiredCredentials() || 'NONE'}
									size="small"
								/>
							</CardContent>

							<CardActions
								sx={{
									px: 2,
									pb: 2,
									pt: 0,
									display: 'flex',
									justifyContent: 'flex-end', // ⬅️ push to the right
								}}
							>
								<Button
									component={Link}
									href={`/jobs/${job.getId()}`}
									variant="contained"
									color="secondary"
								>
									View details
								</Button>
							</CardActions>
						</Card>
					</Grid>
				))}

				{jobs.length === 0 && (
					<Grid component={Box}>
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
							<Typography color="text.secondary">
								New roles will appear here—check back soon.
							</Typography>
						</Box>
					</Grid>
				)}
			</Grid>
		</main>
	);
}
