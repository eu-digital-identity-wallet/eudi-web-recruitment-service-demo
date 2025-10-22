import 'server-only';
import BadgeIcon from '@mui/icons-material/Badge';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Card, CardContent, CardHeader, Grid, Stack, Typography } from '@mui/material';
import { Chip } from '@mui/material';
import { notFound } from 'next/navigation';

import AdditionalInfoActions from '@/components/atoms/AdditionalInfoActions';
import JobIcon from '@/components/atoms/JobIcon';
import { Container } from '@/server';
import { ApplicationService } from '@/server/services/ApplicationService';

function Field({ label, value }: { label: string; value?: string | null }) {
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

export const dynamic = 'force-dynamic';

export default async function ApplicationConfirmationPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const applicationService = Container.get(ApplicationService);
	const { id } = await params;
	if (!id) return notFound();

	const app = await applicationService.details(id);
	if (!app) return notFound();

	// Only allow access once the application is verified or issued
	if (app.status !== 'VERIFIED' && app.status !== 'ISSUED') return notFound();

	// Fetch verified credentials
	const verifiedCredentials = await applicationService.getVerifiedCredentials(id);

	const title = app.job?.title ?? 'Application';

	return (
		<main>
			<Card variant="outlined">
				<CardHeader
					avatar={<JobIcon title={title} />}
					title={
						<Stack spacing={0.5}>
							<Typography variant="h5" component="h1">
								Application for {title}
							</Typography>
						</Stack>
					}
					subheader={
						<>
							<Typography variant="body2" color="text.secondary">
								Application ID: <strong>{app.id}</strong>
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Verified on:{' '}
								<strong>
									{new Date(app.updatedAt ?? app.createdAt).toLocaleDateString('en-GB')}
									{' at '}
									{new Date(app.updatedAt ?? app.createdAt).toLocaleTimeString('en-GB', {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</strong>
							</Typography>
						</>
					}
				/>

				<CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
					<Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
							{/* Data received */}
							<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0 }}>
								<Typography variant="h6" sx={{ mb: 1.5 }}>
									Data received
								</Typography>
								{Boolean(app.candidateFamilyName) && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Family name" value={app.candidateFamilyName} />
									</Grid>
								)}

								{Boolean(app.candidateGivenName) && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Given name" value={app.candidateGivenName} />
									</Grid>
								)}

								{Boolean(app.candidateDateOfBirth) && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field
											label="Date of birth"
											value={new Date(app.candidateDateOfBirth!).toLocaleDateString('en-GB')}
										/>
									</Grid>
								)}

								{Boolean(app.candidateNationality) && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Nationality" value={app.candidateNationality} />
									</Grid>
								)}

								{Boolean(app.candidateEmail) && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Email" value={app.candidateEmail} />
									</Grid>
								)}

								{Boolean(app.candidateMobilePhone) && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Mobile" value={app.candidateMobilePhone} />
									</Grid>
								)}
							</Box>

							{/* Credential Status */}
							<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0 }}>
								<Typography variant="h6" sx={{ mb: 1.5 }}>
									Credential Status
								</Typography>

								<Grid sx={{ width: '100%', mb: 1 }}>
									<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
										Verified Credentials:
									</Typography>
									<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
										{verifiedCredentials
											.filter((cred) => cred.status === 'VERIFIED')
											.map((cred) => {
												let icon = <BadgeIcon />;
												let label: string = cred.credentialType;

												if (cred.credentialType === 'PID') {
													icon = <BadgeIcon />;
													label = 'PID (Person Identification)';
												} else if (cred.credentialType === 'DIPLOMA') {
													icon = <SchoolIcon />;
													label = 'Diploma';
												} else if (cred.credentialType === 'SEAFARER') {
													icon = <DirectionsBoatIcon />;
													label = 'Seafarer Certificate';
												}

												return (
													<Chip
														key={cred.id}
														icon={icon}
														label={label}
														color="success"
														size="small"
														variant="filled"
													/>
												);
											})}
									</Stack>
								</Grid>
							</Box>
						</Box>

						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
							{/* Additional information */}
							<Box
								sx={{
									p: 2,
									border: 1,
									borderColor: 'divider',
									borderRadius: 0,
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<AdditionalInfoActions applicationId={app.id} />
							</Box>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</main>
	);
}
