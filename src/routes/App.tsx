import * as React from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { Box } from '@mui/material'
import { TemporalRootProvider } from 'mui-temporal-pickers';
import { DatabaseProvider } from 'components/contexts/PatientContext';
import { AuthContext } from 'components/contexts/AuthContext';
import { Titlebar } from 'components/ui/Titlebar';
import { Schedule } from './Schedule/Schedule';
import { PatientLists } from './PatientList/PatientList';
import { Login } from './Login/Login';
import { Patient } from './Patient/Patient';
import { Snapboard } from './Snapboard/Snapboard';

// Temporary interfaces for existing JS contexts/components
interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

export const App: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = React.useContext(AuthContext) as AuthContextType
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(isAuthenticated)

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate(0);
  }

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/');
  }

  React.useEffect(() => {
    let lastRightClickTime = 0;

    const handleContextMenu: EventListener = (e) => {
      const currentTime = Temporal.Now.instant().epochMilliseconds;
      const timeDiff = currentTime - lastRightClickTime;

      if (timeDiff < 300) {
        // Double right click - allow system menu, hide functionality
        lastRightClickTime = 0;
        // e.stopPropagation() is not always enough for contextmenu, but preserving logic
        e.stopPropagation?.();
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
    <TemporalRootProvider>
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
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </ErrorBoundary>
      </DatabaseProvider>
    </TemporalRootProvider>
  )
}
