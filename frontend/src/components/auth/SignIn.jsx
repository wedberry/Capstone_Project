import React from 'react';
import LoginForm from './LoginForm';
import SignUpBox from './SignUpBox';
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
        <div className="sign-up-container">
          <SignUpBox />
        </div>
      </div>
      <div className="right-column">
        <div className="bubble"></div>
      </div>
    </div>
  );
};

export default SignIn; 