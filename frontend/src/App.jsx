import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

// Public/Auth Pages
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import ClerkPage from "./components/auth/ClerkView";
import CreateAccountPage from "./components/auth/CreateAccountPage";

// Athlete Pages
import AthleteHome from "./components/dashboards/AthleteHome";
import ScheduleAppointment from "./components/utils/ScheduleAppointment";

// Trainer Pages
import TrainerHome from "./components/dashboards/TrainerHome";
import SetAvailability from "./components/utils/SetAvailability"; // <-- ADDED THIS IMPORT

// Coach Page
import CoachHome from "./components/dashboards/CoachHome";

// Other Utils
import CreateTreatmentPlan from "./components/utils/CreateTreatmentPlan";

// ProtectedRoute utility (checks if user exists)
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
    if (user) {
      checkUserExists();
    }
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
        <Route path="/clerk-view" element={<ClerkPage />} />

        {/* Account Creation Route */}
        <Route path="/create-account" element={<CreateAccountPage />} />

        {/* 🔐 Athlete Routes */}
        <Route
          path="/athlete/dashboard"
          element={
            <SignedIn>
              <AthleteHome />
            </SignedIn>
          }
        />
        <Route
          path="/athlete/schedule-appointment"
          element={
            <SignedIn>
              <ScheduleAppointment />
            </SignedIn>
          }
        />

        {/* 🔐 Trainer Routes */}
        <Route
          path="/trainer/dashboard"
          element={
            <SignedIn>
              <TrainerHome />
            </SignedIn>
          }
        />
        <Route
          path="/trainer/set-availability"
          element={
            <SignedIn>
              <SetAvailability />
            </SignedIn>
          }
        />

        {/* 🔐 Coach Routes */}
        <Route
          path="/coach/dashboard"
          element={
            <SignedIn>
              <CoachHome />
            </SignedIn>
          }
        />

        {/* Example for Create Treatment Plan (not wrapped in SignedIn, but you can if you want) */}
        <Route
          path="/create-treatment-plan"
          element={<CreateTreatmentPlan />}
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
