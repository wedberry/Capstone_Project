import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import AthleteHome from "./components/dashboards/AthleteHome";
import TrainerHome from "./components/dashboards/TrainerHome";
import CoachHome from "./components/dashboards/CoachHome";
import "./components/auth/SignIn.css";


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Protected Routes (Require Authentication) */}
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

        {/* Redirect Logged-Out Users */}
        <Route
          path="/protected"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />

        {/* Default Route: Redirect to Sign-In */}
        <Route path="/" element={<SignInPage />} />
      </Routes>
    </Router>
  );
}

export default App;
