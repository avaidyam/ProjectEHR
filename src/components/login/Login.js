import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.js'; // Adjust the path as needed
import './Login.css';
import logo from './Logo.png'; // Import the EPIC logo image

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use context for login functionality

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password); // Call the AuthContext login function
    setIsLoggedIn(true); // Reintroduce this to update App.js state
    navigate('/schedule'); // Redirect to the schedule page
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
      </div>
    </div>
  );
};

export default Login;
