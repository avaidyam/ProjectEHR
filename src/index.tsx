import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material';
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
      <GlobalStyles styles={{
        html: { height: '100%', overflow: 'hidden', overscrollBehavior: 'none' },
        body: { height: '100%', overflow: 'hidden', overscrollBehavior: 'none' },
        '#root': { height: '100%', display: 'flex', flexDirection: 'column' }
      }} />
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
