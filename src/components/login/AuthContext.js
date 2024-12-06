import React, { createContext, useState } from 'react';
// Clear specific localStorage items on refresh
localStorage.removeItem('adminPassword'); // Removes only the admin password
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if a password is already set in localStorage
  const [isPasswordSet, setIsPasswordSet] = useState(() => {
    return !!localStorage.getItem('adminPassword'); // True if a password exists
  });

  const [enabledEncounters, setEnabledEncounters] = useState(() => {
    const storedEncounters = localStorage.getItem('enabledEncounters');
    // Parse stored encounters or initialize an empty object
    return storedEncounters ? JSON.parse(storedEncounters) : {};
  });
  
  const updateEncounters = (newEncounters) => {
    setEnabledEncounters((prev) => ({
      ...prev,
      ...newEncounters, // Merge new MRNs into the existing state
    }));
  };

  // Function to generate a random salt
  const generateSalt = () => {
    const array = new Uint8Array(16); 
    window.crypto.getRandomValues(array); 
    return Array.from(array)
      .map((byte) => byte.toString(16).padStart(2, '0')) // Convert to hexadecimal
      .join('');
  };

  // Function to hash a password using SHA-256 and a salt
  const hashPassword = async (password, salt) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password); // Combine salt and password
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Hash the salted password
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join(''); // Convert to hex string
  };

  // Function to set a new hashed password with a salt
  const setPassword = async (newPassword) => {
    const salt = generateSalt(); // Generate a random salt
    const hashedPassword = await hashPassword(newPassword, salt); // Hash the password with the salt
    localStorage.setItem('adminPassword', JSON.stringify({ salt, hash: hashedPassword })); // Store both salt and hash
    setIsPasswordSet(true);
  };

  // Function to verify the hashed password with the stored salt
  const verifyPassword = async (inputPassword) => {
    const storedData = localStorage.getItem('adminPassword');
    if (!storedData) {
      setPassword(inputPassword);
      return true;
    }

    const { salt, hash: storedHash } = JSON.parse(storedData); // Retrieve salt and stored hash
    const hashedInput = await hashPassword(inputPassword, salt); // Hash input with the stored salt
    return storedHash === hashedInput; // Compare the hashes
  };


  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPasswordSet,
        enabledEncounters,
        setPassword,
        verifyPassword,
        updateEncounters,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
