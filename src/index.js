import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';

import RootRouter from './RootRouter.js';

import './index.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const rootContainer = document.getElementById('root');
const rootNode = ReactDOM.createRoot(rootContainer);

rootNode.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RootRouter />
    </ThemeProvider>
  </React.StrictMode>
);
