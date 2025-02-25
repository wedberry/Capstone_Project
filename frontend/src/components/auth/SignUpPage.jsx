import React from 'react';
import { SignUp } from "@clerk/clerk-react";
import "./SignIn.css";


const SignUpPage = () => {
  return (
    <div className="sign-in-container">
      <div className="sign-in-content">
        <div className="welcome-text">
          <h1>Create your account</h1>
        </div>
        <SignUp />  {/* Only Sign-Up should be here */}
      </div>
      <div className="right-column">
        <div className="bubble"></div>
      </div>
    </div>
  );
};

export default SignUpPage;