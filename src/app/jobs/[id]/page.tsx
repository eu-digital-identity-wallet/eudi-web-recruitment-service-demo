import 'server-only';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ApplyCrossDeviceButton from '@/components/atoms/ApplyCrossDeviceButton';
import ApplySameDeviceButton from '@/components/atoms/ApplySameDeviceButton';
import JobIcon from '@/components/atoms/JobIcon';
import LogoBox from '@/components/atoms/LogoBox';
import { Container } from '@/server';
import { JobService } from '@/server/services/JobService';

export const dynamic = 'force-dynamic';

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const jobService = Container.get(JobService);
	const { id } = await params;
	const job = await jobService.get(id);
	if (!job) notFound();

	// Render bullets nicely if the description uses "•"
	const raw = job.getDescription() ?? '';
	const parts = raw
		.split('•')
		.map((s) => s.trim())
		.filter(Boolean);
	const hasBullets = parts.length > 1;

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
							<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0, width: '100%' }}>
								<Typography variant="h6" sx={{ mb: 2 }}>
									Job Description
								</Typography>
								{!hasBullets ? (
									<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
										{raw}
									</Typography>
								) : (
									<>
										<Typography variant="body1" sx={{ mb: 2 }}>
											{parts[0]}
										</Typography>

										<List dense sx={{ pl: 1 }}>
											{parts.slice(1).map((item, idx) => (
												<ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start' }}>
													<ListItemIcon sx={{ minWidth: 28, mt: '8px' }}>
														<FiberManualRecordIcon sx={{ fontSize: 12 }} />
													</ListItemIcon>
													<ListItemText primary={item} />
												</ListItem>
											))}
										</List>
									</>
								)}
							</Box>
						</Box>

						{/* Apply Section */}
						<Box sx={{ flex: 1, display: 'flex' }}>
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
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 1, textAlign: 'center' }}
								>
									Use your European Digital Identity Wallet to apply for this position securely
								</Typography>

								{job.getRequiredCredentials() !== 'NONE' &&
									job.getRequiredCredentials() !== 'PID' && (
										<Box sx={{ mb: 2 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
												Optional Credentials:
											</Typography>
											<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
												{(job.getRequiredCredentials() === 'DIPLOMA' ||
													job.getRequiredCredentials() === 'BOTH') && (
													<Chip color="primary" variant="outlined" label="Diploma (optional)" />
												)}
												{(job.getRequiredCredentials() === 'SEAFARER' ||
													job.getRequiredCredentials() === 'BOTH') && (
													<Chip
														color="primary"
														variant="outlined"
														label="Seafarer Certificate (optional)"
													/>
												)}
											</Stack>
										</Box>
									)}

								<Stack spacing={2}>
									<ApplySameDeviceButton jobId={id} />
									<ApplyCrossDeviceButton jobId={id} />
								</Stack>
							</Box>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</main>
	);
}
