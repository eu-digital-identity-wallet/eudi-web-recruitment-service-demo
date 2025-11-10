'use client';

import { Box, Typography, Divider } from '@mui/material';
import { useState } from 'react';

import CredentialOfferDisplay from '@/components/atoms/CredentialOfferDisplay';
import IssueEmployeeIdButton from '@/components/atoms/IssueEmployeeIdButton';

interface ReceiptIssuanceSectionProps {
	applicationId: string;
	initialOfferUrl?: string | null;
}

export default function ReceiptIssuanceSection({
	applicationId,
	initialOfferUrl,
}: ReceiptIssuanceSectionProps) {
	const [offerUrl, setOfferUrl] = useState<string | null>(initialOfferUrl || null);

	if (offerUrl) {
		return <CredentialOfferDisplay offerUrl={offerUrl} />;
	}

	return (
		<Box sx={{ mt: 3 }}>
			<Divider sx={{ mb: 3 }} />
			<Typography variant="h6" sx={{ mb: 2 }}>
				Get Your Application Receipt
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				Issue a verifiable application receipt credential to your EUDI wallet. This credential
				proves that you have successfully submitted your application.
			</Typography>
			<IssueEmployeeIdButton applicationId={applicationId} onSuccess={setOfferUrl} />
		</Box>
	);
}
