import "server-only";
import { notFound } from "next/navigation";
import { Container } from "@/server";
import { ApplicationService } from "@/server/services/ApplicationService";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import JobIcon from "@/components/atoms/JobIcon";
import VerificationPulse from "@/components/atoms/VerificationPulse";
import LogoBanner from "@/components/atoms/LogoBanner";
import ExtrasVerificationPoller from "@/components/atoms/ExtrasVerificationPoller";

export const dynamic = "force-dynamic";

export default async function ApplicationExtrasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const applicationService = Container.get(ApplicationService);
  const { id } = await params;

  const app = await applicationService.details(id);
  if (!app) return notFound();

  // Only show this page for verified applications
  if (app.status !== "VERIFIED") return notFound();

  // Get verified credentials to check if extras were requested
  const verifiedCredentials = await applicationService.getVerifiedCredentials(id);
  const extrasCredentials = verifiedCredentials.filter(
    (c) => (c.credentialType === "DIPLOMA" || c.credentialType === "SEAFARER") && c.status === "PENDING"
  );

  if (extrasCredentials.length === 0) return notFound();

  // Determine what was requested based on credentials
  let extrasCredentialType: string;
  const hasDiploma = extrasCredentials.some((c) => c.credentialType === "DIPLOMA");
  const hasSeafarer = extrasCredentials.some((c) => c.credentialType === "SEAFARER");

  if (hasDiploma && hasSeafarer) {
    extrasCredentialType = "BOTH";
  } else if (hasDiploma) {
    extrasCredentialType = "DIPLOMA";
  } else {
    extrasCredentialType = "SEAFARER";
  }

  const title = app.job?.title ?? "Application";

  // Format credential type for display
  const formatCredentialType = (type: string) => {
    switch (type) {
      case "BOTH":
        return "Diploma & Seafarer Certificate";
      case "DIPLOMA":
        return "Diploma";
      case "SEAFARER":
        return "Seafarer Certificate";
      default:
        return type;
    }
  };

  return (
    <main>
      <Card variant="outlined">
        <CardHeader
          avatar={<JobIcon title={title} />}
          title={
            <Stack spacing={0.5}>
              <Typography variant="h5" component="h1">
                Additional Credentials for {title}
              </Typography>
            </Stack>
          }
          subheader={
            <>
              <Typography variant="body2" color="text.secondary">
                Application ID: <strong>{app.id}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requesting: <strong>{formatCredentialType(app.extrasCredentialType)}</strong>
              </Typography>
            </>
          }
        />

        <CardContent sx={{ pt: 0, textAlign: "center", '&:last-child': { pb: 2 } }}>
          {/* QR Code */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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
              Open your EUDI Wallet app and scan this QR code to provide additional credentials
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderRadius: 1,
                display: "inline-block",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Image
                src={`/api/applications/qr-extras/${app.id}`}
                alt="Additional Credentials QR"
                width={340}
                height={340}
                style={{ display: "block" }}
                priority
                unoptimized
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              After scanning, your additional credentials will be verified and added to your application.
            </Typography>
          </Box>

          {/* Logo Banner with integrated loading */}
          <Box sx={{ mt: 2 }}>
            <LogoBanner>
              <VerificationPulse />
            </LogoBanner>
          </Box>

          {/* Poller triggers redirect to /applications/confirmation/[id] when status:true */}
          <Box sx={{ mt: 1 }}>
            <ExtrasVerificationPoller applicationId={app.id} />
          </Box>
        </CardContent>
      </Card>
    </main>
  );
}