"use client";

import { useState } from "react";
import {
  Box, Button, Checkbox, FormControlLabel, Stack, Typography,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { toast } from "react-toastify";

export default function AdditionalInfoActions({ applicationId }: { applicationId: string }) {
  const [diploma, setDiploma] = useState(false);
  const [seafarer, setSeafarer] = useState(false);
  const [busy, setBusy] = useState<"provide" | "finalise" | null>(null);

  const disabled = !diploma && !seafarer;

  const provideExtras = async () => {
    setBusy("provide");
    try {
      // TODO: hit your API to request the extra docs
      // await fetch(`/api/applications/${applicationId}/extras`, { method: "POST", body: JSON.stringify({ diploma, seafarer }) });
      toast.success("We’ll request the selected documents in your wallet."+applicationId);
    } catch {
      toast.error("Couldn’t start the additional info flow.");
    } finally {
      setBusy(null);
    }
  };

  const finalize = async () => {
    setBusy("finalise");
    try {
      // If you already have the issuance route:
      // await fetch(`/api/applications/issue-confirmation/${applicationId}`, { method: "POST" });
      toast.success("Finalising your application…"+applicationId);
    } catch {
      toast.error("Couldn’t finalise the application.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Box sx={{  mt: { xs: 3, lg: 0 }  }}>
      <Typography variant="h6"  >
        Additional information (optional)
      </Typography>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <FormControlLabel
          control={<Checkbox checked={diploma} onChange={(e) => setDiploma(e.target.checked)} />}
          label="Diploma"
        />
        <FormControlLabel
          control={<Checkbox checked={seafarer} onChange={(e) => setSeafarer(e.target.checked)} />}
          label="Seafarer Certificate"
        />
      </Stack>

      <Stack spacing={2} alignItems="center">
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<AccountBalanceWalletOutlinedIcon />}
          disabled={disabled || busy !== null}
          onClick={provideExtras}
          
        >
          {busy === "provide" ? "Starting…" : "Provide additional information"}
        </Button>

        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<AccountBalanceWalletOutlinedIcon />}
          disabled={busy !== null}
          onClick={finalize}
        >
          {busy === "finalise" ? "Finalising…" : "Finalise your job application"}
        </Button>
      </Stack>
    </Box>
  );
}
