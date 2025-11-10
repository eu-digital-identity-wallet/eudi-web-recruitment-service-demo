import { CardHeader, Stack, Typography } from '@mui/material';

import JobIcon from '@/components/atoms/JobIcon';

interface ApplicationHeaderProps {
	title: string;
	applicationId: string;
	verifiedAt: Date;
}

/**
 * Application header organism displaying job title, application ID, and verification timestamp
 */
export default function ApplicationHeader({
	title,
	applicationId,
	verifiedAt,
}: ApplicationHeaderProps) {
	return (
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
						Application ID: <strong>{applicationId}</strong>
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Verified on:{' '}
						<strong>
							{verifiedAt.toLocaleDateString('en-GB')}
							{' at '}
							{verifiedAt.toLocaleTimeString('en-GB', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</strong>
					</Typography>
				</>
			}
		/>
	);
}
