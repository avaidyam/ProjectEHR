import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppBar, IconButton, Toolbar, Typography, Box, Icon, Button } from '@mui/material';
import Login from './login/Login.js';
import { Schedule } from './schedule/Schedule.js';
import { PatientHome } from './patient/PatientHome.js';
import Department from './department/Department.js'; // Import Department page
import { OrderProvider } from './patient/tabs/orders/OrdersContext.js'; // Import the OrderProvider

// Navigation Bar Component
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

// Main App Component
export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks login status
  const [isDepartmentSelected, setIsDepartmentSelected] = useState(false); // Tracks department selection
  const navigate = useNavigate();

  // Handles navigation between routes
  const handleClickRoute = (route) => {
    navigate(route);
  };

  // Logs out and resets state
  const handleLogout = () => {
    setIsLoggedIn(false); // Hide NavBar
    setIsDepartmentSelected(false); // Reset department selection
    navigate('/'); // Redirect to the login page
  };

  // Handles department selection and navigates to the schedule page
  const handleDepartmentSelect = (department) => {
    if (department) {
      // console.log('Selected Department:', department);
      setIsDepartmentSelected(true); // Show NavBar after department is selected
      navigate('/schedule');
    }
  };

  return (
    <OrderProvider>
      <Box sx={{ minHeight: '100vh', overflow: 'none' }}>
        {isLoggedIn && isDepartmentSelected && (
          <NavBar onHandleClickRoute={handleClickRoute} onLogout={handleLogout} />
        )}
        <Routes>
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route
            path="/schedule"
            element={
              isLoggedIn && isDepartmentSelected ? (
                <Schedule />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/department"
            element={
              isLoggedIn ? (
                <Department onDepartmentSelect={handleDepartmentSelect} />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/patient/:mrn"
            element={
              isLoggedIn && isDepartmentSelected ? (
                <PatientHome />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
        </Routes>
      </Box>
    </OrderProvider>
  );
};
