import { Box, Container } from "@mui/material";
import { Fragment } from "react";
import { ToastContainer } from "react-toastify";
import Header from "../organisms/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <Fragment>
    <ToastContainer />
    <Header />
    <Box sx={{ bgcolor: "white", pb: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
        {children}
      </Container>
    </Box>
  </Fragment>
);

export default AppLayout;
