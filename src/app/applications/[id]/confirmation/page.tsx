import "server-only";
import { notFound } from "next/navigation";
import { applicationService } from "@/server";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import JobIcon from "@/components/atoms/JobIcon";
import AdditionalInfoActions from "@/components/atoms/AdditionalInfoActions";


function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 1.5,
        borderRadius: 1,
        bgcolor: "grey.50",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}

export const dynamic = "force-dynamic";

export default async function ApplicationConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const app = await applicationService.details(id);
  if (!app) return notFound();

  // Only allow access once the application is verified (or issued)
  if (app.status !== "VERIFIED") return notFound();

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
                Verified on: <strong>
                              {new Date(app.updatedAt ?? app.createdAt).toLocaleDateString()}
                              {' at '} 
                              {new Date(app.updatedAt ?? app.createdAt).toLocaleTimeString()}
                            </strong>
              </Typography>
            
            </>
            
          }
        />

        <Divider />

        <CardContent sx={{ pt: 3 }}>
          <Grid container columns={12}  sx={{ mb: 1,width: '100%' }}>
            <Grid sx={{
                      flexBasis: { xs: "100%", lg: '50%' },
                      maxWidth: { xs: "100%", lg: '50%' },
                      paddingRight: { xs: 0, lg: '2rem' }
                    }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Data received
              </Typography>
              {Boolean(app.candidateFamilyName) && (
                <Grid sx={{ width: '100%', mb:1 }} >
                  <Field label="Family name" value={app.candidateFamilyName} />
                </Grid>
              )}

              {Boolean(app.candidateGivenName) && (
                <Grid sx={{ width: '100%' , mb:1}} >
                  <Field label="Given name" value={app.candidateGivenName} />
                </Grid>
              )}

              {Boolean(app.candidateDateOfBirth) && (
                <Grid sx={{ width: '100%' , mb:1}} >
                  <Field label="Date of birth" value={app.candidateDateOfBirth} />
                </Grid>
              )}

              {Boolean(app.candidateNationality) && (
                <Grid sx={{ width: '100%', mb:1 }} >
                  <Field label="Nationality" value={app.candidateNationality} />
                </Grid>
              )}

              {Boolean(app.candidateEmail) && (
                <Grid sx={{ width: '100%', mb:1 }} >
                  <Field label="Email" value={app.candidateEmail} />
                </Grid>
              )}

              {Boolean(app.candidateMobilePhone) && (
                <Grid sx={{ width: '100%', mb:1 }} >
                  <Field label="Mobile" value={app.candidateMobilePhone} />
                </Grid>
              )}
            </Grid>

            <Grid sx={{
                      flexBasis: { xs: "100%", lg: "50%" },
                      maxWidth: { xs: "100%", lg: "50%" },
                    }}>
              <AdditionalInfoActions applicationId={app.id} />
            </Grid>

          </Grid>
            
        </CardContent>
      </Card>
    </main>
  );
}
