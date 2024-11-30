import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.js';
import './Login.css';
import logo from './Logo.png'; // Import the EPIC logo image
import ConfigureDialog from './ConfigureDialog'; // Import the dialog component
import { Button } from '@mui/material';
import schedule from '../../util/data/schedule.json'; // Import the schedule JSON file for mrns

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, verifyPassword, updateEncounters, enabledEncounters } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state

  const [patients, setPatients] = useState([]); // State to store the extracted patients
  const encountersPerPatient = 2; // Predefined encounters per patient
  
    // Extract unique MRNs from schedule.json
    useEffect(() => {
      const uniqueMRNs = Array.from(new Set(schedule.appts.map((appt) => appt.patient.mrn)));
      setPatients(uniqueMRNs); // Set patients as a unique array of MRNs
    }, []);

    useEffect(() => {
      // Check if enabledEncounters is empty
      if (Object.keys(enabledEncounters).length === 0 && patients.length > 0) {
    
        const defaultEncounters = {};
        patients.forEach((mrn) => {
          defaultEncounters[mrn] = 0; // Default Encounter 0
        });
    
        updateEncounters(defaultEncounters);
    
      }
    }, [enabledEncounters, patients, updateEncounters]);
    

  

  // Handle login submission
  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password); // Authenticate user
    setIsLoggedIn(true); // Update parent state
    navigate('/schedule'); // Redirect to schedule page
  };

  // Handle password validation flow
  const handlePasswordValidation = async () => {
    const enteredPassword = prompt('Enter the administrator password:');
    if (!enteredPassword) {
      alert('No password entered. Access denied.');
      return false;
    }

    const isValid = await verifyPassword(enteredPassword);
    if (isValid) {
      // alert('Password verified successfully.');
      return true;
    } else {
      alert('Incorrect password. Access denied.');
      return false;
    }
  };

  // Open the configuration dialog after password validation
  const handleConfigure = async () => {
    const isAuthorized = await handlePasswordValidation(); // Validate password first
    if (isAuthorized) {
      setIsModalOpen(true); // Open the configuration modal if authorized
    }
  };

  // Close the configuration dialog
  const handleCloseDialog = () => {
    setIsModalOpen(false);
  };

  // Handle submitting the selected encounters
  const handleSubmitEncounters = (selectedEncounters) => {
    updateEncounters(selectedEncounters);
    handleCloseDialog(); 
  };

  return (
    <div className="login-container">
      <div className="background-image" />
      <div className="logo-container">
        <img src={logo} alt="EPIC Systems Logo" className="login-logo" />
      </div>
      <div className="login-box">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User ID"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="login-button">Log In</button>
        </form>
        <div className="login-footer">
          <a href="/forgot-password" className="login-link">Forgot Password?</a>
        </div>
        <div className="login-footer">
          <Button variant="contained" onClick={handleConfigure}>
            Configure
          </Button>
        </div>
      </div>

      {/* Configure Dialog Component */}
      <ConfigureDialog
        open={isModalOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitEncounters}
        patients={patients}
        encountersPerPatient={encountersPerPatient}
      />
    </div>
  );
};

export default Login;
