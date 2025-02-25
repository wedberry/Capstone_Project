import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpBox = () => {
  return (
    <div className="sign-up-box">
      <SignUp />
    </div>
  );
};

export default SignUpBox;