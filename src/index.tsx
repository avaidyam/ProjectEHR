import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import 'util/helpers.js';

import { App } from './routes/App.jsx'; 
import { AuthProvider } from './components/contexts/AuthContext.jsx';

const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
});
// document.body.style.overflow = "hidden"
ReactDOM.createRoot(document.getElementById('root')!).render(
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
