import { PatientLists } from './PatientList/PatientList.jsx';
import { AuthContext } from '../components/contexts/AuthContext.jsx';
import { AppBar, Box, Button, Icon, IconButton, Toolbar, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';

import { Titlebar } from '../components/ui/Titlebar.jsx';
import Login from './Login/Login.jsx';
import { PatientHome } from './Patient/Patient.jsx';
import { OrderProvider } from '../components/contexts/OrdersContext.jsx';
import { Schedule } from './Schedule/Schedule.jsx';

// Main App Component
export const App = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated); // Tracks login status

  // Handles navigation between routes
  const handleClickRoute = (route) => {
    navigate(route); // Redirect to the chosen route
  };

  // Logs out and resets state
  const handleLogout = () => {
    logout()
    setIsLoggedIn(false); // Hide NavBar
    navigate('/'); // Redirect to the login page
  };

  // Handles department selection and navigates to the schedule page
  const handleLogin = (department) => {
    setIsLoggedIn(true)
    navigate(0)
  };

  return (
    <OrderProvider>
      <Box sx={{ }}>
        {isLoggedIn && (
          <Titlebar onHandleClickRoute={handleClickRoute} onLogout={handleLogout} />
        )}
        <Routes>
          <Route path="/" element={
            isLoggedIn ? (
                <Navigate replace to="/schedule" />
              ) : (
                <Login setIsLoggedIn={handleLogin} />
              )
          } />
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
