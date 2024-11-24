import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { App } from './components/App.js'; 
import { AuthProvider } from './components/login/AuthContext.js';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // EPIC's bright blue
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#90caf9', // Lighter blue for secondary elements
      light: '#bbdefb',
      dark: '#64b5f6',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f9ff', // Light blue-tinted background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    warning: {
      main: '#ff9800', // Orange for alerts/warnings
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Arial", sans-serif',
    fontSize: 12, // EPIC uses smaller font sizes
    h1: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.8rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '32px',
          padding: '6px 12px',
          textTransform: 'none',
          fontSize: '0.8rem',
          backgroundColor: '#bbdefb',
          marginRight: '1px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          '&.Mui-selected': {
            backgroundColor: '#FFFFFF',
            color: '#000000',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '32px',
          backgroundColor: '#bbdefb',
        },
        indicator: {
          display: 'none', // EPIC doesn't use bottom indicators
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2196f3',
          boxShadow: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '40px !important',
          padding: '0 8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.8rem',
          padding: '4px 8px',
          minHeight: '24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          borderRadius: '2px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '4px 8px',
          fontSize: '0.8rem',
          borderBottom: '1px solid #e0e0e0',
        },
        head: {
          fontWeight: 500,
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
  shape: {
    borderRadius: 2,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
