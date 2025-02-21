import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Component LoginForm
const LoginForm = () => {
  // Establishes navigation towards different pages
  const navigate = useNavigate();

  // Establishes use state for form data username and password
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });


  // Handles any changes done to the form while
  // Keeping track of the intial
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // On submit of the form, Directs to correct page
  // Based on our database... Probably use okta verify
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // TODO: Add your authentication logic here
      console.log('Login attempt with:', formData);
      
      // After successful login, redirect based on role
      // Need to figure out how to grab from database and check
      const userRole = 'athlete'; 
    
      switch(userRole) {
        case 'athlete':
          navigate('/athlete/dashboard');
          break;
        case 'trainer':
          navigate('/trainer/dashboard');
          break;
        case 'coach':
          navigate('/coach/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Returns all data and crafts page logisitics
  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit}>
        <div className="username-password">
          <label htmlFor="username">USERNAME</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required placeholder="ROLLINS EMAIL"/>
        </div>
        <div className="username-password">
          <label htmlFor="password">PASSWORD</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="PASSWORD"/>
        </div>
        <button type="submit" className="login-button">LOG IN</button>
      </form>
    </div>
  );
};

export default LoginForm; 