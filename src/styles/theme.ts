import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    warning: {
      main: '#ff9800',
    },
  },
  typography: {
    fontSize: 16,
    button: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          fontSize: '1.1rem',
        },
        sizeSmall: {
          minHeight: '40px',
        },
        sizeLarge: {
          minHeight: '56px',
          fontSize: '1.2rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '1200px !important', // タブレット向けの幅
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          fontWeight: 'bold',
          minHeight: '60px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginBottom: '8px',
        },
        label: {
          fontSize: '1rem',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            fontSize: '1.3rem',
          },
        },
      },
    },
  },
});