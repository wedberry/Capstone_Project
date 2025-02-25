import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import "./SignIn.css";

const SignInPage = () => {
  return (
    <div className="sign-in-container">
      <div className="sign-in-content">
        <div className="welcome-text">
          <h1>Welcome to</h1>
          <h1>Traction</h1>
        </div>
        <SignIn />  {/* Only Sign-In should be here */}
      </div>
      <div className="right-column">
        <div className="bubble"></div>
      </div>
    </div>
  );
};

export default SignInPage;
