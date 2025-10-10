import Image from "next/image";
import { Box } from "@mui/material";

interface LogoBannerProps {
  children?: React.ReactNode;
}

export default function LogoBanner({ children }: LogoBannerProps) {
  return (
    <Box
      sx={{
        bgcolor: "white",
        pt: 0,
        pl: 4.5,
        pr: 3,
        pb: 1.25,
        border: 1,
        borderColor: "divider",
        borderRadius: 0,
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" },
        gap: { xs: 0, md: 3 },
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: 3, alignItems: "center" }}>
        <Image
          src="/logo-european-commission.svg"
          alt="European Commission"
          width={180}
          height={80}
          priority
          style={{ objectFit: "contain", marginLeft: "-16px" }}
        />
        <Box
          sx={{ width: "2px", height: "26px", bgcolor: "primary.main", marginTop: "20px" }}
        />
        <Image
          src="/eudi-wallet-official.svg"
          alt="EU Digital Identity Wallet"
          width={140}
          height={50}
          priority
          style={{ objectFit: "contain", marginTop: "33px" }}
        />
      </Box>
      {children && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {children}
        </Box>
      )}
    </Box>
  );
}