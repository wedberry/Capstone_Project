import React from 'react';
import { Link } from 'react-router-dom';

const SignUpBox = () => {
  return (
    <div className="sign-up-container">
      <p className="no-acc-text">Don't have an account?</p>
      <Link to="/register" className="sign-up-link">
        Create Account
      </Link>
    </div>
  );
};

export default SignUpBox; 