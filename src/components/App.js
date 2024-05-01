import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppBar, Stack, TextField, IconButton, Toolbar, Typography, Box, Icon } from '@mui/material';
import { useRouter } from '../util/urlHelpers.js';

import { Schedule } from './schedule/Schedule.js';
import { PatientHome } from './patient/PatientHome.js';

export const NavBar = ({ ...props }) => {
  const onHandleClickRoute = useRouter()
  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} {...props}>
        <Toolbar variant="dense" style={{ width: '100%' }}>
          <Typography variant="h6" color="inherit" component="div">
            ProjectEHR
          </Typography>
          <IconButton color="inherit" onClick={() => onHandleClickRoute(`schedule`)}>
            <Icon>calendar_month</Icon>
          </IconButton>
          <TextField label="Search ..." variant="outlined" size="small" />
        </Toolbar>
      </AppBar>
      <Toolbar variant="dense" />
    </>
  )
}

export const App = ({ ...props }) => {
  return (
    <HashRouter>
      <Box sx={{ minHeight: "100vh", overflow: 'none' }} {...props}>
        <NavBar />
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
