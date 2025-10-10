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
import ApplicationVerificationPoller from "@/components/atoms/ApplicationVerificationPoller";
import VerificationPulse from "@/components/atoms/VerificationPulse";
import LogoBanner from "@/components/atoms/LogoBanner";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const applicationService = Container.get(ApplicationService);
  const { id } = await params;
  const app = await applicationService.details(id);
  if (!app) return notFound();

  // Only show this waiting room while not verified/issued
  if (app.status !== "CREATED") return notFound();

  const title = app.job?.title ?? "Application";

  return (
    <main>
      <Card
        variant="outlined"
      >
        <CardHeader
                  avatar={<JobIcon title={title} />}
                  title={
                    <Stack spacing={0.5}>
                      <Typography variant="h5" component="h1">
                        Application for {title}
                      </Typography>
                    </Stack>
                  }
                  subheader={
                    <>
                    <Typography variant="body2" color="text.secondary">
                        Application ID: <strong>{app.id}</strong>
                      </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Requesting: <strong>PID</strong>
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
              Open your EUDI Wallet app and scan this QR code to verify your identity
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
                src={`/api/applications/qr/${app.id}`}
                alt="Verification QR"
                width={340}
                height={340}
                style={{ display: "block" }}
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

          {/* Poller triggers redirect to /applications/confirmation/[id] when status:true */}
          <Box sx={{ mt: 1 }}>
            <ApplicationVerificationPoller applicationId={app.id} />
          </Box>
        </CardContent>
      </Card>
    </main>
  );
}
