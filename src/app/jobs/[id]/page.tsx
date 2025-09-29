import "server-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import { jobService } from "@/server";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import JobIcon from "@/components/atoms/JobIcon";

import ApplySameDeviceButton from "@/components/atoms/ApplySameDeviceButton";
import ApplyCrossDeviceButton from "@/components/atoms/ApplyCrossDeviceButton";

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await jobService.get(id);
  if (!job) notFound();

  // Render bullets nicely if the description uses "•"
  const raw = job.description ?? "";
  const parts = raw.split("•").map((s) => s.trim()).filter(Boolean);
  const hasBullets = parts.length > 1;

  return (
    <main>
      {/* Back link */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBackIosNewRoundedIcon fontSize="small" />}
          variant="text"
        >
          Back to Jobs
        </Button>
      </Box>

      <Card
        variant="outlined"
         
      > 
        <CardHeader
                avatar={<JobIcon title={job.title} />}
                title={
                  <Stack spacing={0.5}>
                    <Typography variant="h5" component="h1">
                      {job.title}
                    </Typography>
                  </Stack>
                }
                subheader={
                  <>
                  <Typography variant="body2" color="text.secondary">
                      Published on: <strong>{new Date(job.createdAt).toLocaleDateString()}</strong>
                    </Typography>
                  </> 
                }
              />
         

        <Divider />

        <CardContent sx={{ pt: 3 }}>
          {/* Company intro (first sentence before bullets if any) */}
          {!hasBullets ? (
            <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
              {raw}
            </Typography>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {parts[0]}
              </Typography>

              <List dense sx={{ pl: 1 }}>
                {parts.slice(1).map((item, idx) => (
                  <ListItem key={idx} disableGutters sx={{ alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: "8px" }}>
                      <FiberManualRecordIcon sx={{fontSize:'12px;'}} />
                    </ListItemIcon>
                    <ListItemText
                      
                      primary={item}
                    />
                  </ListItem>
                ))}
              </List>
              <Chip color="primary" variant="outlined" label="Diploma (optional)" /> {"  "}
              <Chip color="primary" variant="outlined" label="Seafarer Certificate (optional)" />
            </>
          )}
          
        </CardContent>

        <CardActions
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
        <ApplySameDeviceButton jobId={id} />
        <ApplyCrossDeviceButton jobId={id} />
        </CardActions>
      </Card>
    </main>
  );
}
