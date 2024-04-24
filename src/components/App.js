import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppBar, IconButton, Toolbar, Typography, Box } from '@mui/material';
import { GridMenuIcon } from '@mui/x-data-grid';
import { useRouter } from '../util/urlHelpers.js';

import { Schedule } from './schedule/Schedule.js';
import { PatientHome } from './patient/PatientHome.js';

export const NavBar = ({ ...props }) => {
  const onHandleClickRoute = useRouter()
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => onHandleClickRoute(`schedule`)}
        >
          <GridMenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          EHR
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export const App = ({ ...props }) => {
  return (
    <HashRouter>
      <Box sx={{ minHeight: "100vh" }}>
        <NavBar />
        <Toolbar sx={{ marginBottom: -2 }} />
        <Routes>
          <Route path="/" Component={Schedule} />
          <Route path="/schedule/" Component={Schedule} />
          <Route path="/patient/:mrn" Component={PatientHome} />
          {/* add subsequent routes here, ie /schedule, /chart_review, etc  */}
        </Routes>
      </Box>
    </HashRouter>
  )
}
