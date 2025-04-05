import { createTheme } from '@mui/material/styles';

// Create a theme instance without using problematic imports
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff4757', // Main brand color
      light: '#ff6b81',
      dark: '#c5283d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2f3542',
      light: '#57606f',
      dark: '#1e272e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;
