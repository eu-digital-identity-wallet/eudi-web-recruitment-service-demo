import "server-only";
import Link from "next/link";
import { jobService } from "@/server";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import JobIcon from "@/components/atoms/JobIcon";

export default async function JobBoardPage() {
  const jobs = await jobService.list();

  return (
    <main>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
          Available Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse current openings and start your application in a few clicks.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid component={Box}  key={job.id}>
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

              <CardContent sx={{ pt: 0 }}>
                <Typography variant="body1">
                  {job.description ?? "No description provided."}
                </Typography>
              </CardContent>

              <CardActions sx={{
                    px: 2,
                    pb: 2,
                    pt: 0,
                    display: "flex",
                    justifyContent: "flex-end",   // ⬅️ push to the right
                  }}>
                <Button
                  component={Link}
                  href={`/jobs/${job.id}`}
                  variant="contained"
                  color="secondary"
                  
                >
                  View details
                </Button>
                
              </CardActions>
            </Card>
          </Grid>
        ))}

        {jobs.length === 0 && (
          <Grid component={Box}   >
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                bgcolor: "background.default",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No vacancies available
              </Typography>
              <Typography color="text.secondary">
                New roles will appear here—check back soon.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </main>
  );
}
