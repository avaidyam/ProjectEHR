import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { App } from './routes/App.jsx'; 
import { AuthProvider } from './components/contexts/AuthContext.jsx';

const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
