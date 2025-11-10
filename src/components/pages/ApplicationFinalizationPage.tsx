import { Card } from '@mui/material';

import ApplicationFinalizationContent from '@/components/organisms/ApplicationFinalizationContent';
import ApplicationHeader from '@/components/organisms/ApplicationHeader';

import type { VerifiedCredentialData } from '@/components/types';

interface ApplicationFinalizationPageProps {
	application: {
		id: string;
		candidateFamilyName?: string | null;
		candidateGivenName?: string | null;
		candidateDateOfBirth?: string | null;
		candidateNationality?: string | null;
		candidateEmail?: string | null;
		candidateMobilePhone?: string | null;
		updatedAt: Date;
		createdAt: Date;
		vacancy?: {
			title: string;
		} | null;
	};
	verifiedCredentials: VerifiedCredentialData[];
	professionalQualifications: VerifiedCredentialData[];
	allQualificationsVerified: boolean;
	requiredCredentials: string[];
}

/**
 * Application Finalization Page Component
 *
 * Purpose: Display verified PID data and provide options to request additional credentials or finalize
 *
 * This is a page-level component in the atomic design hierarchy that:
 * - Receives data from the Next.js server component
 * - Composes organisms to create the full page layout
 * - Handles no business logic, only presentation
 */
export default function ApplicationFinalizationPage({
	application,
	verifiedCredentials,
	professionalQualifications,
	allQualificationsVerified,
	requiredCredentials,
}: ApplicationFinalizationPageProps) {
	const title = application.vacancy?.title ?? 'Application';

	return (
		<main>
			<Card variant="outlined">
				<ApplicationHeader
					title={title}
					applicationId={application.id}
					verifiedAt={new Date(application.updatedAt ?? application.createdAt)}
				/>

				<ApplicationFinalizationContent
					applicationId={application.id}
					familyName={application.candidateFamilyName}
					givenName={application.candidateGivenName}
					dateOfBirth={
						application.candidateDateOfBirth ? new Date(application.candidateDateOfBirth) : null
					}
					nationality={application.candidateNationality}
					email={application.candidateEmail}
					mobilePhone={application.candidateMobilePhone}
					verifiedCredentials={verifiedCredentials}
					professionalQualifications={professionalQualifications}
					allQualificationsVerified={allQualificationsVerified}
					jobTitle={application.vacancy?.title ?? 'Position'}
					companyName="EUDI Demo Company"
					requiredCredentials={requiredCredentials}
				/>
			</Card>
		</main>
	);
}
