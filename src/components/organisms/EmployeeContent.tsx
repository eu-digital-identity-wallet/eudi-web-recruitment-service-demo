'use client';

import { Box, CardContent } from '@mui/material';

import EmployeeIssuanceActions from '@/components/atoms/EmployeeIssuanceActions';
import TaxResidencyActions from '@/components/atoms/TaxResidencyActions';
import CredentialStatusDisplay from '@/components/molecules/CredentialStatusDisplay';
import PersonIdentificationInfo from '@/components/molecules/PersonIdentificationInfo';
import ProfessionalQualificationsDisplay from '@/components/molecules/ProfessionalQualificationsDisplay';
import TaxResidencyDisplay from '@/components/molecules/TaxResidencyDisplay';

import type { VerifiedCredentialData } from '@/components/types';

interface EmployeeContentProps {
	applicationId: string;
	familyName?: string | null;
	givenName?: string | null;
	dateOfBirth?: Date | null;
	nationality?: string | null;
	email?: string | null;
	mobilePhone?: string | null;
	verifiedCredentials: VerifiedCredentialData[];
	professionalQualifications: VerifiedCredentialData[];
}

/**
 * Employee page content organism
 * Displays employee information, credentials, and issuance actions
 */
export default function EmployeeContent({
	applicationId,
	familyName,
	givenName,
	dateOfBirth,
	nationality,
	email,
	mobilePhone,
	verifiedCredentials,
	professionalQualifications,
}: EmployeeContentProps) {
	// Find verified TAXRESIDENCY credential
	const taxResidencyCredential = verifiedCredentials.find(
		(vc) => vc.credentialType === 'TAXRESIDENCY' && vc.status === 'VERIFIED',
	);

	// Extract tax residency data from credentialData
	const taxResidencyData = taxResidencyCredential?.credentialData as
		| {
				name?: string;
				address?: string;
				date_of_birth?: string;
				identification_number?: string;
				taxpayer_type?: string;
				start_date_of_residency_requested_period?: string;
				end_date_of_residency_requested_period?: string;
		  }
		| undefined;

	return (
		<CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
				{/* LEFT COLUMN */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
					<PersonIdentificationInfo
						familyName={familyName}
						givenName={givenName}
						dateOfBirth={dateOfBirth}
						nationality={nationality}
						email={email}
						mobilePhone={mobilePhone}
					/>

					<ProfessionalQualificationsDisplay qualifications={professionalQualifications} />

					<CredentialStatusDisplay credentials={verifiedCredentials} />
				</Box>

				{/* RIGHT COLUMN */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
					{/* Employee Issuance */}
					<Box
						sx={{
							p: 2,
							border: 1,
							borderColor: 'divider',
							borderRadius: 0,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<EmployeeIssuanceActions applicationId={applicationId} />
					</Box>

					{/* Tax Residency (optional) */}
					{taxResidencyData ? (
						<TaxResidencyDisplay
							name={taxResidencyData.name}
							address={taxResidencyData.address}
							dateOfBirth={taxResidencyData.date_of_birth}
							identificationNumber={taxResidencyData.identification_number}
							taxpayerType={taxResidencyData.taxpayer_type}
							startDateOfResidency={taxResidencyData.start_date_of_residency_requested_period}
							endDateOfResidency={taxResidencyData.end_date_of_residency_requested_period}
						/>
					) : (
						<Box
							sx={{
								p: 2,
								border: 1,
								borderColor: 'divider',
								borderRadius: 0,
								bgcolor: 'grey.50',
							}}
						>
							<TaxResidencyActions applicationId={applicationId} />
						</Box>
					)}
				</Box>
			</Box>
		</CardContent>
	);
}
