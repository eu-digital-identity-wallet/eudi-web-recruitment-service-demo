import 'server-only';

import { Box, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import JobIcon from '@/components/atoms/JobIcon';
import LogoBanner from '@/components/atoms/LogoBanner';
import SigningStatusPoller from '@/components/atoms/SigningStatusPoller';
import VerificationPulse from '@/components/atoms/VerificationPulse';
import { Container } from '@/server';
import { ApplicationRepository } from '@/server/repositories/ApplicationRepository';
import { SignedDocumentRepository } from '@/server/repositories/SignedDocumentRepository';

export const dynamic = 'force-dynamic';

export default async function SignContractPage({ params }: { params: Promise<{ id: string }> }) {
	try {
		const applicationRepo = Container.get(ApplicationRepository);
		const signedDocumentRepo = Container.get(SignedDocumentRepository);

		const { id } = await params;
		const app = await applicationRepo.findByIdWithJob(id);

		if (!app) return notFound();

		// Check if there's a signing session
		const signedDoc = await signedDocumentRepo.findLatestByApplicationId(id);

		if (!signedDoc || signedDoc.status !== 'PENDING') {
			return notFound();
		}

		// Note: We don't fetch documentContent here to avoid ArrayBuffer detachment issues
		// The actual document is served via the /api/documents/[state] endpoint

		const title = app.job?.title ?? 'Application';

		return (
			<main>
				<Card variant="outlined">
					<CardHeader
						avatar={<JobIcon title={title} />}
						title={
							<Stack spacing={0.5}>
								<Typography variant="h5" component="h1">
									Sign Employment Contract
								</Typography>
							</Stack>
						}
						subheader={
							<>
								<Typography variant="body2" color="text.secondary">
									Application ID: <strong>{app.id}</strong>
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Document: <strong>{signedDoc.documentLabel}</strong>
								</Typography>
							</>
						}
					/>

					<CardContent sx={{ pt: 0, textAlign: 'center', '&:last-child': { pb: 2 } }}>
						{/* QR Code */}
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								p: 2,
								border: 1,
								borderColor: 'divider',
								borderRadius: 0,
							}}
						>
							<Typography variant="h6" sx={{ mb: 1 }}>
								Scan with EUDI Wallet
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Open your EUDI Wallet app and scan this QR code to sign the employment contract with
								your qualified electronic signature (QES)
							</Typography>
							<Box
								sx={{
									p: 2,
									bgcolor: 'white',
									borderRadius: 1,
									display: 'inline-block',
									border: '1px solid',
									borderColor: 'divider',
								}}
							>
								<Image
									src={`/api/applications/qr-sign/${app.id}`}
									alt="Document Signing QR"
									width={340}
									height={340}
									style={{ display: 'block' }}
									priority
									unoptimized
								/>
							</Box>
						</Box>

						{/* Logo Banner with integrated loading */}
						<Box sx={{ mt: 2 }}>
							<LogoBanner>
								<VerificationPulse />
							</LogoBanner>
						</Box>

						{/* Status Poller */}
						<Box sx={{ mt: 1 }}>
							<SigningStatusPoller applicationId={app.id} />
						</Box>
					</CardContent>
				</Card>
			</main>
		);
	} catch (error) {
		console.error('[SignContractPage] Error loading signing page:', error);
		return notFound();
	}
}
