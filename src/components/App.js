import { PatientLists } from '../routes/app/patients-list.jsx';
import { AuthContext } from './login/AuthContext';
import { AppBar, Box, Button, Icon, IconButton, Toolbar, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Login from './login/Login.js';
import { PatientHome } from './patient/PatientHome.js';
import { OrderProvider } from './patient/tabs/orders/OrdersContext.js';
import { Schedule } from './schedule/Schedule.js';

export const NavBar = ({ onHandleClickRoute, onLogout }) => {
  return (
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
            <IconButton color="inherit" onClick={() => onHandleClickRoute('/patients-list')}>
              <Icon>people</Icon>
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
};

// Main App Component
export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks login status

  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  // Handles navigation between routes
  const handleClickRoute = (route) => {
    navigate(route); // Redirect to the chosen route
  };

  // Logs out and resets state
  const handleLogout = () => {
    setIsLoggedIn(false); // Hide NavBar
    navigate('/'); // Redirect to the login page
  };

  // Handles department selection and navigates to the schedule page
  const handleLogin = (department) => {
    setIsLoggedIn(true)
    navigate('/schedule');
  };

  return (
    <OrderProvider>
      <Box sx={{ minHeight: '100vh', overflow: 'none' }}>
        {isLoggedIn && (
          <NavBar onHandleClickRoute={handleClickRoute} onLogout={handleLogout} />
        )}
        <Routes>
          <Route path="/" element={<Login setIsLoggedIn={handleLogin} />} />
          <Route
            path="/schedule"
            element={
              isLoggedIn ? (
                <Schedule />
              ) : (
                <Login setIsLoggedIn={handleLogin} />
              )
            }
          />
          <Route
            path="/patient/:mrn/encounter/:enc"
            element={
              isLoggedIn ? (
                <PatientHome />
              ) : (
                <Login setIsLoggedIn={handleLogin} />
              )
            }
          />
          <Route
            path="/patients-list"
            element={
              isLoggedIn ? (
                <PatientLists />
              ) : (
                <Login setIsLoggedIn={handleLogin} />
              )
            }
          />
        </Routes>
      </Box>
    </OrderProvider>
  );
};
