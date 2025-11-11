import { Card } from '@mui/material';

import EmployeeContent from '@/components/organisms/EmployeeContent';
import EmployeeHeader from '@/components/organisms/EmployeeHeader';

import type { VerifiedCredentialData } from '@/components/types';

interface EmployeePageProps {
	application: {
		id: string;
		candidateFamilyName?: string | null;
		candidateGivenName?: string | null;
		candidateDateOfBirth?: string | null;
		candidateNationality?: string | null;
		candidateEmail?: string | null;
		candidateMobilePhone?: string | null;
		vacancy?: {
			title: string;
		} | null;
	};
	verifiedCredentials: VerifiedCredentialData[];
	professionalQualifications: VerifiedCredentialData[];
}

/**
 * Employee Page Component
 *
 * Purpose: Display employee credentials and provide issuance options
 *
 * This is a page-level component that:
 * - Receives data from the Next.js server component
 * - Composes organisms to create the employee credential page
 * - Shows PID, professional qualifications, credential status
 * - Provides employee credential issuance and optional tax residency
 */
export default function EmployeePage({
	application,
	verifiedCredentials,
	professionalQualifications,
}: EmployeePageProps) {
	const jobTitle = application.vacancy?.title ?? 'Position';
	const employeeName =
		application.candidateGivenName && application.candidateFamilyName
			? `${application.candidateGivenName} ${application.candidateFamilyName}`
			: 'Unknown';

	return (
		<main>
			<Card variant="outlined">
				<EmployeeHeader
					employeeName={employeeName}
					applicationId={application.id}
					jobTitle={jobTitle}
				/>

				<EmployeeContent
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
				/>
			</Card>
		</main>
	);
}
