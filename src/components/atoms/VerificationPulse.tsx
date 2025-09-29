"use client";

import { Box, Stack, Typography, keyframes } from "@mui/material";

const ripple = keyframes`
  0%   { transform: scale(0.9); opacity: .9; }
  50%  { transform: scale(1.05); opacity: .5; }
  100% { transform: scale(0.9); opacity: .9; }
`;

export default function VerificationPulse() {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
      <Box
        sx={{
          position: "relative",
          width: 48,
          height: 48,
          borderRadius: "50%",
          bgcolor: "secondary.main",
          boxShadow: 3,
          animation: `${ripple} 1.4s ease-in-out infinite`,
        }}
      />
      <Typography variant="body2" color="text.secondary">
        Waiting for verification…
      </Typography>
    </Stack>
  );
}
