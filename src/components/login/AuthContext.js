import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [globalEncounter, setGlobalEncounter] = useState(0); // Default encounter

  const login = (username, password) => {
    // For simplicity, hardcoding credentials for now
    if (username === 'ad' && password === 'ad') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setIsAuthenticated(true);

  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setGlobalEncounter(0); // Reset global encounter on logout
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        globalEncounter,
        setGlobalEncounter,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
