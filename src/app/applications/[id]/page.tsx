import "server-only";
import { notFound } from "next/navigation";
import { applicationService } from "@/server";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import JobIcon from "@/components/atoms/JobIcon";
import ApplicationVerificationPoller from "@/components/atoms/ApplicationVerificationPoller";
import VerificationPulse from "@/components/atoms/VerificationPulse";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
                    </>                    
                  }
                />

        <Divider />

        <CardContent sx={{ pt: 4, textAlign: "center" }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Scan this QR code with your EUDI Wallet to continue verification.
          </Typography>

          {/* Big QR */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/applications/qr/${app.id}`}
            alt="Verification QR"
            style={{
              width: 340,
              height: 340,
              margin: "0 auto",
              display: "block",
            }}
          />

          {/* Visual feedback while polling */}
          <VerificationPulse />

          {/* Poller triggers redirect to /applications/confirmation/[id] when status:true */}
          <Box sx={{ mt: 1 }}>
            <ApplicationVerificationPoller applicationId={app.id} />
          </Box>
        </CardContent>
      </Card>
    </main>
  );
}
