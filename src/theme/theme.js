import { createTheme } from '@mui/material/styles';

const crimsonRed = {
  main: '#DC143C',
  light: '#FF6B8B',
  dark: '#B22222',
  contrastText: '#FFFFFF',
};

export const getTheme = (mode) => createTheme({
palette: {
    mode,
    primary: crimsonRed,
    secondary: {
      main: '#2D3748',
      light: '#4A5568',
      dark: '#1A202C',
    },
    background: {
      default: mode === 'light' ? '#F7FAFC' : '#1A202C',
      paper: mode === 'light' ? '#FFFFFF' : '#2D3748',
    },
    sidebar: {
      main: mode === 'light' ? '#B22222' : '#111827',
      contrastText: '#FFFFFF',
    },
    stats: {
      totalVehicles: mode === 'light'
        ? 'linear-gradient(135deg, #a2d9ff, #66b2ff)'
        : 'linear-gradient(135deg, #1e3a5f, #1c2d4b)',
      newUsers: mode === 'light'
        ? 'linear-gradient(135deg, #d4b5ff, #b388ff)'
        : 'linear-gradient(135deg, #4b2d5f, #3a1e4b)',
      purchaseOrders: mode === 'light'
        ? 'linear-gradient(135deg, #ffe29f, #ffcc70)'
        : 'linear-gradient(135deg, #5a472d, #4b3a1c)',
      messages: mode === 'light'
        ? 'linear-gradient(135deg, #ffb3b3, #ff8c8c)'
        : 'linear-gradient(135deg, #5a2d2d, #4b1c1c)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});
