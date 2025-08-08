import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { App } from './components/App.js';
import { AuthProvider } from './components/login/AuthContext.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme({
  palette: {
    //mode: 'dark',
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HashRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
