import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#003680' },
    secondary: { main: '#FEB902',contrastText: '#000000' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#333333', secondary: '#666666' },
  },
  typography: {
      fontFamily: "Roboto, Arial, sans-serif",
      h1: { fontSize: "1.5rem", fontWeight: 700, color: "#000000" },
      h2: { fontSize: "1rem", fontWeight: 600, color: "#000000" },
      body1: { fontSize: "1rem", color: "#000000" },
      button: { textTransform: "none" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (t) => ({
          body: { minWidth: "412px" },
          h1: t.typography.h1,
          h2: t.typography.h2,
          p: t.typography.body1,
        }),
      },
      MuiAppBar: { styleOverrides: { root: { backgroundColor: '#003680', boxShadow: 'none', borderBottom: '1px solid #dddddd' } } },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: '4px', padding: '10px 20px',  appearance: 'none',
          WebkitAppearance: 'none',
          backgroundClip: 'padding-box', },
          contained: {
            '&:hover': {
              backgroundColor: '#FEB902',
              
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            },
            '&:active': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.26)',
            },
          },
          containedPrimary: { backgroundColor: '#0070C2', color: '#fff', '&:hover': { backgroundColor: '#003680' } },
        },
      },
      MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          transition: "box-shadow .2s ease",
          "&:hover": { borderColor: "primary.light" },
          // keep outlined border from changing color on hover (optional)
          "&.MuiPaper-outlined": { borderColor: "rgba(0,0,0,0.12)" },
          "&.MuiPaper-outlined:hover": {   boxShadow:"0px 10px 24px rgba(0, 54, 128, 0.18)"}
          
        },
      },
    },
      
      MuiTypography: { styleOverrides: { h5: { fontSize: '1.3rem', fontWeight: 600, color: '#000' } } },
    },
});
