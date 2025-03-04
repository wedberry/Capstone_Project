import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Import the Auth context

const RegisterForm = () => {
  const { login } = useAuth(); // Access the login function from context
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'athlete',
    password1: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Basic form validation
    if (formData.password1 !== formData.password2) {
        setFieldErrors({
          ...fieldErrors,
          password2: "Passwords don't match"
        });
        return;
    }

    try {
        // Get CSRF token from cookies
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];


        console.log("Sending registration data:", {
            username: formData.username,
            email: formData.email,
            role: formData.role,
            password1: formData.password1,
            password2: formData.password2
            });

        const response = await axios.post(
            'http://localhost:8000/api/users/register/', 
            formData,
            {
                headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
                }
            }
        );
        
        console.log("Registration full_response:", response);
        // Redirect to MFA setup

        if (response.status === 201 || response.status === 200) { // Assuming 201 is returned on successful registration
            
            console.log("Registration token:", response.data.token);
            if (response.data.token) {
                await login({user: {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    ...response.data.user
                  },
                  accessToken: response.data.token
                });

                navigate('/mfa-setup');
            } else {
                setError('Registration successful but no authentication token received');
              }
            }

        } catch (err) {
            console.error("Registration error:", err.response?.data || err);
            
            // Handle different error formats
            if (err.response?.data?.field_errors) {
              setFieldErrors(err.response.data.field_errors);
            } else if (err.response?.data?.errors) {
              // Alternative API error format
              const errors = {};
              for (const [key, value] of Object.entries(err.response.data.errors)) {
                errors[key] = Array.isArray(value) ? value[0] : value;
              }
              setFieldErrors(errors);
            } else if (err.response?.data?.detail) {
              // DRF style errors
              setError(err.response.data.detail);
            } else {
              setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
          }
        };
      

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="athlete">Athlete</option>
            <option value="trainer">Trainer</option>
            <option value="coach">Coach</option>
          </select>
          {fieldErrors.role && <div className="field-error">{fieldErrors.role}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password1">Password</label>
          <input
            type="password"
            id="password1"
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            required
          />
          {fieldErrors.password1 && <div className="field-error">{fieldErrors.password1}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
          {fieldErrors.password2 && <div className="field-error">{fieldErrors.password2}</div>}
        </div>
        
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      
      <p>Already have an account? <a href="/login">Log in</a></p>
    </div>
  );
};

export default RegisterForm;
