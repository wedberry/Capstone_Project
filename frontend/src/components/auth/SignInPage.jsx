import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import "./SignIn.css";

const SignInPage = () => {
  const { isSignedIn } = useUser(); // Clerk's authentication hook
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/athlete/dashboard");  // Redirect after login
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="sign-in-container">
      <div className="sign-in-content">
        <div className="welcome-text">
          <h1>Welcome to</h1>
          <h1>Traction</h1>
        </div>
        <SignIn />  {/* Clerk's Sign-In Component */}
      </div>
      <div className="right-column">
        <div className="bubble"></div>
      </div>
    </div>
  );
};

export default SignInPage;
