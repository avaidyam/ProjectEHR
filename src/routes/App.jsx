import React, { useContext, useState, useEffect } from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { Box } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { DatabaseProvider } from 'components/contexts/PatientContext';
import { AuthContext } from 'components/contexts/AuthContext';
import { Titlebar } from 'components/ui/Titlebar';
import { Schedule } from './Schedule/Schedule';
import { PatientLists } from './PatientList/PatientList';
import { Login } from './Login/Login';
import { Patient } from './Patient/Patient';
import { Snapboard } from './Snapboard/Snapboard';

export const App = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useContext(AuthContext)
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated)
  const handleLogin = () => { setIsLoggedIn(true); navigate(0) }
  const handleLogout = () => { logout(); setIsLoggedIn(false); navigate('/') }

  useEffect(() => {
    let lastRightClickTime = 0;

    const handleContextMenu = (e) => {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastRightClickTime;

      if (timeDiff < 300) {
        // Double right click - allow system menu, hide functionality
        lastRightClickTime = 0;
        e.stopPropagation();
      } else {
        // Single right click - prevent system menu, allow functionality
        e.preventDefault();
        lastRightClickTime = currentTime;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatabaseProvider>
        <ErrorBoundary fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>⚠️ Something went wrong</Box>}>
          {isLoggedIn && <Titlebar onLogout={handleLogout} />}
        </ErrorBoundary>
        <ErrorBoundary fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>⚠️ Something went wrong</Box>}>
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Navigate replace to="/schedule" /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/schedule"
              element={isLoggedIn ? <Schedule /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/schedule/:department"
              element={isLoggedIn ? <Schedule /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/schedule/:department/:date"
              element={isLoggedIn ? <Schedule /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/list"
              element={isLoggedIn ? <PatientLists /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/list/:listId"
              element={isLoggedIn ? <PatientLists /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/patient/:mrn"
              element={isLoggedIn ? <Patient /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/patient/:mrn/encounter/:enc"
              element={isLoggedIn ? <Patient /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/snapboard"
              element={isLoggedIn ? <Snapboard /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/snapboard/:department"
              element={isLoggedIn ? <Snapboard /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route
              path="/snapboard/:department/:date"
              element={isLoggedIn ? <Snapboard /> : <Login setIsLoggedIn={handleLogin} />}
            />
            <Route path="*" render={() => <Navigate replace to="/" />} />
          </Routes>
        </ErrorBoundary>
      </DatabaseProvider>
    </LocalizationProvider>
  )
}
