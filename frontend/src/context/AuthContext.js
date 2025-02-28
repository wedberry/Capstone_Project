import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('jwt') || ''); // Load JWT from local storage
  const [user, setUser] = useState(null);

  // Check if the user is logged in when the app loads
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (credentials) => {
    // Make a request to Django OTP backend (authentication)
    const response = await fetch('http://localhost:8000/api/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const userData = await response.json();
    if (response.ok) { // Check if login was successful
      setUser(userData); // Store user data if login is successful
      setAccessToken(userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('jwt', userData.token); 
    } else {
      throw new Error(userData.message || 'Login failed. Please try again.'); // Handle errors
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(''); // Clear the access token
    localStorage.removeItem('user'); // Remove user data from local storage
    localStorage.removeItem('jwt'); // Remove JWT from local storage
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
