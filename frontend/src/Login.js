import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "./Login.css"; // Ensure you have this CSS file for styling

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <SignIn />
      </div>
      <div className="image-box">
        <img src="/your-image-path.jpg" alt="Athlete Artwork" />
      </div>
    </div>
  );
};

export default Login;
