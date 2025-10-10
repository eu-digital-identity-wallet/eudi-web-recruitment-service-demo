import Image from "next/image";
import { Box } from "@mui/material";

export default function LogoBox() {
  return (
    <Box
      sx={{
        mb: 2,
        bgcolor: "white",
        p: 2,
        pb: "25px",
        border: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "row",
        gap: 3,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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
  );
}