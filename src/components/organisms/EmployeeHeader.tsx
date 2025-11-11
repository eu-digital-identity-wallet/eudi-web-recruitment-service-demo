import { CardHeader, Typography } from '@mui/material';

import JobIcon from '@/components/atoms/JobIcon';

interface EmployeeHeaderProps {
	employeeName: string;
	applicationId: string;
	jobTitle: string;
}

/**
 * Employee page header organism
 * Displays employee name, application ID, and job title
 */
export default function EmployeeHeader({
	employeeName,
	applicationId,
	jobTitle,
}: EmployeeHeaderProps) {
	return (
		<CardHeader
			avatar={<JobIcon title={jobTitle} />}
			title={
				<Typography variant="h5" component="h1">
					Employee: {employeeName}
				</Typography>
			}
			subheader={
				<>
					<Typography variant="body2" color="text.secondary">
						Application ID: <strong>{applicationId}</strong>
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Position: <strong>{jobTitle}</strong>
					</Typography>
				</>
			}
		/>
	);
}
