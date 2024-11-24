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
      main: '#dbf1ff', 
      contrastText: '#000000',
    },
    secondary: {
      main: '#64b5f6', 
      contrastText: '#000000',
    },
    background: {
      default: '#eef7ff', 
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    warning: {
      main: '#ff9800', 
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    action: {
      hover: '#90caf9',
    },
  },
  typography: {
    fontFamily: '"Segoe UI Light", "Segoe UI", sans-serif',
    fontSize: 12,
    allVariants: {
      color: '#000000',
      fontWeight: 300,
    },
    h1: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.1rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1.1rem',
      fontWeight: 300,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 300,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#42a5f5',
          color: '#000000',
          boxShadow: 'none',
          minHeight: '32px',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '32px !important',
          padding: '0 4px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '24px',
          padding: '4px 12px',
          textTransform: 'none',
          fontSize: '1rem',
          color: '#000000',
          backgroundColor: '#90caf9',
          marginRight: '2px',
          marginLeft: '2px',
          borderTopLeftRadius: '3px',
          borderTopRightRadius: '3px',
          borderTop: '1px solid #64b5f6',
          borderLeft: '1px solid #64b5f6',
          borderRight: '1px solid #64b5f6',
          '&.Mui-selected': {
            backgroundColor: '#eef7ff',
            color: '#000000',
          },
          '&:hover': {
            backgroundColor: '#83b9e6', 
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '24px',
          backgroundColor: '#e3f2fd',
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '2px 8px',
          fontSize: '1rem',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#FFFFFF',
          height: '24px',
        },
        head: {
          fontWeight: 500,
          backgroundColor: '#FFFFFF',
          color: '#000000',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#eef7ff',
          },
          '&:hover': {
            backgroundColor: '#90caf9',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          padding: '2px 8px',
          minHeight: '20px',
          color: '#000000',
          backgroundColor: '#e3f2fd',
          border: '1px solid #90caf9',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#90caf9',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '4px',
          color: '#000000',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e0e0e0',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: '2px',
          color: '#757575',
        },
      },
    },
  },
  shape: {
    borderRadius: 3,
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
