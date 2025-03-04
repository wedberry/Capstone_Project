import React, { useEffect } from "react";  // Import React and useEffect
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import CreateAccountPage from "./components/auth/CreateAccountPage";
import AthleteHome from "./components/dashboards/AthleteHome";
import TrainerHome from "./components/dashboards/TrainerHome";
import CoachHome from "./components/dashboards/CoachHome";

const ProtectedRoute = ({ element }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const checkUserExists = async () => {
    const response = await fetch(`http://localhost:8000/api/users/check-user/${user.id}`);
    const data = await response.json();

    if (!data.exists) {
      navigate("/create-account");
    }
  };

  React.useEffect(() => {
    if (user) checkUserExists();
  }, [user]);

  return user ? element : null;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔓 Public Routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Account Creation Route */}
        <Route path="/create-account" element={<CreateAccountPage />} />

        {/* 🔐 Protected Routes (Require Authentication) */}
        <Route
          path="/athlete/dashboard"
          element={
            <SignedIn>
              <AthleteHome />
            </SignedIn>
          }
        />
        <Route
          path="/trainer/dashboard"
          element={
            <SignedIn>
              <TrainerHome />
            </SignedIn>
          }
        />
        <Route
          path="/coach/dashboard"
          element={
            <SignedIn>
              <CoachHome />
            </SignedIn>
          }
        />

        {/* 🚫 Redirect Logged-Out Users to Sign-In */}
        <Route
          path="/protected"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />

        {/* 🔀 Default Route - Redirect to Sign-In */}
        <Route path="/" element={<SignInPage />} />
      </Routes>
    </Router>
  );
}

export default App;
