import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppBar, IconButton, Toolbar, Typography, Box, Icon, Button } from '@mui/material';
import Login from './login/Login.js';
import { Schedule } from './schedule/Schedule.js';
import { PatientHome } from './patient/PatientHome.js';

export const NavBar = ({ onHandleClickRoute, onLogout }) => (
  <>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" color="inherit" component="div" style={{ marginRight: '8px' }}>
            ProjectEHR
          </Typography>
          <IconButton color="inherit" onClick={() => onHandleClickRoute('/schedule')}>
            <Icon>calendar_month</Icon>
          </IconButton>
        </Box>
        <Box>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
          <Button color="inherit" onClick={onLogout} style={{ marginLeft: '10px' }}>
            Secure
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Toolbar variant="dense" />
  </>
);

export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleClickRoute = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Update state to hide NavBar
    navigate('/'); // Redirect to the login page
  };

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'none' }}>
      {isLoggedIn && <NavBar onHandleClickRoute={handleClickRoute} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/schedule" element={isLoggedIn ? <Schedule /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/patient/:mrn" element={isLoggedIn ? <PatientHome /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </Box>
  );
};
