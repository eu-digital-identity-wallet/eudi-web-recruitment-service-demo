import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';

interface VacancyDescriptionProps {
	description: string;
}

/**
 * Vacancy description molecule
 * Displays job description with bullet points if present
 */
export default function VacancyDescription({ description }: VacancyDescriptionProps) {
	// Parse bullets if the description uses "•"
	const parts = description
		.split('•')
		.map((s) => s.trim())
		.filter(Boolean);
	const hasBullets = parts.length > 1;

	return (
		<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0, width: '100%' }}>
			<Typography variant="h6" sx={{ mb: 2 }}>
				Job Description
			</Typography>
			{!hasBullets ? (
				<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
					{description}
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
	);
}
