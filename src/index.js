import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { App } from './routes/App.js'; 
import { AuthProvider } from './components/contexts/AuthContext.js';

const theme = createTheme({
  palette: {
    //mode: 'dark',
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
