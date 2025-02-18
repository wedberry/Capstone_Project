import React from 'react';
import LoginForm from './LoginForm';
// SignIn Component grabing loginForm structure
const SignIn = () => {
  return (
    <div className="sign-in-container">
      <div className="sign-in-content">
        <div className="welcome-text">
          <h1>Welcome to</h1>
          <h1>Traction</h1>
        </div>
        <LoginForm />
      </div>
      <div className="right-column">
        <div className="bubble"></div>
      </div>
    </div>
  );
};

export default SignIn; 