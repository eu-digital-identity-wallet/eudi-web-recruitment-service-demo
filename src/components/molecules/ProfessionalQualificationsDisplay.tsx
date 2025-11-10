import WorkIcon from '@mui/icons-material/Work';
import { Box, Grid, Stack, Typography } from '@mui/material';

import Field from '@/components/atoms/Field';

import type { VerifiedCredentialData } from '@/components/types';

interface ProfessionalQualificationsDisplayProps {
	qualifications: VerifiedCredentialData[];
}

/**
 * Displays professional qualifications (Diploma, Seafarer, Tax Residency)
 * with their respective credential data fields.
 */
export default function ProfessionalQualificationsDisplay({
	qualifications,
}: ProfessionalQualificationsDisplayProps) {
	if (qualifications.length === 0) {
		return null;
	}

	const formatDate = (dateValue: unknown): string => {
		const dateStr =
			typeof dateValue === 'object' && dateValue !== null && 'value' in dateValue
				? String((dateValue as { value: unknown }).value)
				: String(dateValue);

		try {
			const date = new Date(dateStr);
			return date.toLocaleDateString('en-GB');
		} catch {
			return dateStr;
		}
	};

	const getFormattedCapacities = (credentialData: Record<string, unknown>): string | null => {
		const capacities = credentialData.capacities;

		if (!capacities) {
			return null;
		}

		interface CapacityItem {
			capacity_code?: string;
		}

		// Handle array format (extract capacity_code from each item)
		if (Array.isArray(capacities)) {
			const codes = capacities
				.map((item: unknown) => {
					if (typeof item === 'object' && item !== null && 'capacity_code' in item) {
						const capacityItem = item as CapacityItem;
						return capacityItem.capacity_code || '';
					}
					return '';
				})
				.filter((code) => code !== '');

			return codes.length > 0 ? codes.join(', ') : null;
		}

		// Handle string or other formats
		return String(capacities);
	};

	return (
		<Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 0, mb: 2 }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<WorkIcon sx={{ color: 'primary.main' }} />
				<Typography variant="h6">Professional Qualifications</Typography>
			</Stack>

			{qualifications.map((cred) => {
				const credData = cred.credentialData;
				const credType = cred.credentialType;

				return (
					<Box key={cred.id} sx={{ mb: 2 }}>
						<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
							{credType === 'DIPLOMA' && 'Diploma'}
							{credType === 'SEAFARER' && 'Seafarer Certificate'}
							{credType === 'TAXRESIDENCY' && 'Tax Residency'}
						</Typography>

						{/* DIPLOMA fields */}
						{credType === 'DIPLOMA' && (
							<>
								{credData.identifier && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Identifier" value={String(credData.identifier)} />
									</Grid>
								)}

								{credData.scoped_affiliation && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Scoped Affiliation" value={String(credData.scoped_affiliation)} />
									</Grid>
								)}
							</>
						)}

						{/* SEAFARER fields */}
						{credType === 'SEAFARER' && (
							<>
								{credData.document_number && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Document Number" value={String(credData.document_number)} />
									</Grid>
								)}

								{credData.given_name && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Given Name" value={String(credData.given_name)} />
									</Grid>
								)}

								{credData.family_name && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Family Name" value={String(credData.family_name)} />
									</Grid>
								)}

								{credData.birth_date && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Date of Birth" value={formatDate(credData.birth_date)} />
									</Grid>
								)}

								<Field label="Capacities" value={getFormattedCapacities(credData)} />

								{credData.issue_date && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Issue Date" value={formatDate(credData.issue_date)} />
									</Grid>
								)}

								{credData.expiry_date && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Expiry Date" value={formatDate(credData.expiry_date)} />
									</Grid>
								)}

								{credData.issuing_authority && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Issuing Authority" value={String(credData.issuing_authority)} />
									</Grid>
								)}

								{credData.issuing_country && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Issuing Country" value={String(credData.issuing_country)} />
									</Grid>
								)}
							</>
						)}

						{/* TAXRESIDENCY fields */}
						{credType === 'TAXRESIDENCY' && (
							<>
								{credData.identifier && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Identifier" value={String(credData.identifier)} />
									</Grid>
								)}

								{credData.scoped_affiliation && (
									<Grid sx={{ width: '100%', mb: 1 }}>
										<Field label="Scoped Affiliation" value={String(credData.scoped_affiliation)} />
									</Grid>
								)}
							</>
						)}
					</Box>
				);
			})}
		</Box>
	);
}
