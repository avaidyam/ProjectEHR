import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppBar, IconButton, Toolbar, Typography, Box, Icon } from '@mui/material';
import Login from './login/Login.js';
import { Schedule } from './schedule/Schedule.js';
import { PatientHome } from './patient/PatientHome.js';
import { OrderProvider } from './patient/tabs/orders/OrdersContext.js'; // Import the OrderProvider

export const NavBar = ({ onHandleClickRoute }) => (
  <>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense" style={{ width: '100%' }}>
        <Typography variant="h6" color="inherit" component="div">
          ProjectEHR
        </Typography>
        <IconButton color="inherit" onClick={() => onHandleClickRoute('/schedule')}>
          <Icon>calendar_month</Icon>
        </IconButton>
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
    <OrderProvider>
    <Box sx={{ minHeight: '100vh', overflow: 'none' }}>
      {isLoggedIn && <NavBar onHandleClickRoute={handleClickRoute} />}
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/schedule" element={isLoggedIn ? <Schedule onLogout={handleLogout} /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/patient/:mrn" element={isLoggedIn ? <PatientHome /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </Box>
    </OrderProvider>
  );
};