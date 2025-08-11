import React, { useContext, useState } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { Box } from '../components/ui/Core.jsx';
import { PatientLists } from './PatientList/PatientList.jsx';
import { AuthContext } from '../components/contexts/AuthContext.jsx';
import { Titlebar } from '../components/ui/Titlebar.jsx';
import Login from './Login/Login.jsx';
import { PatientHome } from './Patient/Patient.jsx';
import { OrderProvider } from '../components/contexts/OrdersContext.jsx';
import { Schedule } from './Schedule/Schedule.jsx';

// Main App Component
export const App = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useContext(AuthContext)
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated)
  const handleLogin = () => { setIsLoggedIn(true); navigate(0) }
  const handleLogout = () => { logout(); setIsLoggedIn(false); navigate('/') }
  return (
    <OrderProvider>
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
            element={isLoggedIn ? <PatientHome /> : <Login setIsLoggedIn={handleLogin} />} 
          />
          <Route path="*" render={() => <Navigate replace to="/" />} />
        </Routes>
    </OrderProvider>
  )
}
