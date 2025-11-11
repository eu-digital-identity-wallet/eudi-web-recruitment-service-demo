'use client';

import { Box, CardContent } from '@mui/material';

import AdditionalInfoActions from '@/components/atoms/AdditionalInfoActions';
import FinalizationActions from '@/components/atoms/FinalizationActions';
import CredentialStatusDisplay from '@/components/molecules/CredentialStatusDisplay';
import PersonIdentificationInfo from '@/components/molecules/PersonIdentificationInfo';
import ProfessionalQualificationsDisplay from '@/components/molecules/ProfessionalQualificationsDisplay';

import type { VerifiedCredentialData } from '@/components/types';

interface ApplicationFinalizationContentProps {
	applicationId: string;
	familyName?: string | null;
	givenName?: string | null;
	dateOfBirth?: Date | null;
	nationality?: string | null;
	email?: string | null;
	mobilePhone?: string | null;
	verifiedCredentials: VerifiedCredentialData[];
	professionalQualifications: VerifiedCredentialData[];
	allQualificationsVerified: boolean;
	jobTitle: string;
	companyName: string;
	requiredCredentials: string[];
}

/**
 * Application finalization content organism
 * Displays verified credentials, qualifications, and actions for finalizing the application
 */
export default function ApplicationFinalizationContent({
	applicationId,
	familyName,
	givenName,
	dateOfBirth,
	nationality,
	email,
	mobilePhone,
	verifiedCredentials,
	professionalQualifications,
	allQualificationsVerified,
	jobTitle,
	companyName,
	requiredCredentials,
}: ApplicationFinalizationContentProps) {
	return (
		<CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
					<PersonIdentificationInfo
						familyName={familyName}
						givenName={givenName}
						dateOfBirth={dateOfBirth}
						nationality={nationality}
						email={email}
						mobilePhone={mobilePhone}
					/>

					<CredentialStatusDisplay credentials={verifiedCredentials} />
				</Box>

				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					<ProfessionalQualificationsDisplay qualifications={professionalQualifications} />

					{/* Additional information */}
					{/* Only show box if not all qualifications are verified */}
					{!allQualificationsVerified ? (
						<Box
							sx={{
								p: 2,
								border: 1,
								borderColor: 'divider',
								borderRadius: 0,
								mb: 2,
							}}
						>
							<AdditionalInfoActions
								applicationId={applicationId}
								verifiedCredentials={verifiedCredentials.map((cred) => ({
									credentialType: cred.credentialType as
										| 'PID'
										| 'DIPLOMA'
										| 'SEAFARER'
										| 'TAXRESIDENCY',
									status: cred.status,
								}))}
								requiredCredentials={requiredCredentials}
							/>
						</Box>
					) : null}

					<FinalizationActions
						applicationId={applicationId}
						jobTitle={jobTitle}
						companyName={companyName}
					/>
				</Box>
			</Box>
		</CardContent>
	);
}
