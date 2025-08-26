import React, { useContext, useState } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AuthContext } from 'components/contexts/AuthContext.jsx';
import { Titlebar } from 'components/ui/Titlebar.jsx';
import { Schedule } from './Schedule/Schedule.jsx';
import { PatientLists } from './PatientList/PatientList.jsx';
import { Login } from './Login/Login.jsx';
import { Patient } from './Patient/Patient.jsx';

export const App = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useContext(AuthContext)
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated)
  const handleLogin = () => { setIsLoggedIn(true); navigate(0) }
  const handleLogout = () => { logout(); setIsLoggedIn(false); navigate('/') }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        {isLoggedIn && <Titlebar onLogout={handleLogout} />}
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
            path="/list" 
            element={isLoggedIn ? <PatientLists /> : <Login setIsLoggedIn={handleLogin} />} 
          />
          <Route 
            path="/patient/:mrn/encounter/:enc" 
            element={isLoggedIn ? <Patient /> : <Login setIsLoggedIn={handleLogin} />} 
          />
          <Route path="*" render={() => <Navigate replace to="/" />} />
        </Routes>
    </LocalizationProvider>
  )
}
