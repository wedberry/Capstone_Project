import React from "react";
import { SignIn } from "@clerk/clerk-react";

const LoginForm = () => {
  return (
    <div className="login-form-container">
      <SignIn />
    </div>
  );
};

export default LoginForm;
