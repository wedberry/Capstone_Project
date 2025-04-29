import React, { useEffect } from "react";  // Import React and useEffect
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

// Public/Auth Pages
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import ClerkPage from "./components/auth/ClerkView"
import CreateAccountPage from "./components/auth/CreateAccountPage";

// Athlete Pages
import AthleteHome from "./components/dashboards/AthleteHome";
import ScheduleAppointment from "./components/utils/ScheduleAppointment";
import AthleteProfile from "./components/utils/AthleteProfile";
import AthleteNotification from "./components/utils/AthleteNotification";
import ViewStatus from "./components/utils/ViewStatus";
import AppointmentDetails from "./components/utils/AppointmentDetails";

// Trainer Pages
import TrainerHome from "./components/dashboards/TrainerHome";
import CreateTreatmentPlan from "./components/utils/CreateTreatmentPlan";
import BroseTreatmentPlans from "./components/utils/BrowseTreatmentPlans";
import EditTreatmentPlan from "./components/utils/EditTreatmentPlan";
import SetAvailability from "./components/utils/SetAvailability";
import TrainerProfile from "./components/utils/TrainerProfile";
import ViewAllAthletes from "./components/utils/ViewAllAthletes";
import ManageAthlete from "./components/utils/ManageAthletePage";

// Coach Pages
import CoachHome from "./components/dashboards/CoachHome";
import PlayerList from "./components/utils/PlayerList";
import CoachProfile from "./components/utils/CoachProfile";
import Message from "./components/utils/Message";
import Notifications from "./components/utils/Notifications";
import ViewPlayerStatus from "./components/utils/ViewPlayerStatus";

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
        <Route path="/clerk-view" element={<ClerkPage />} />

        {/* Account Creation Route */}
        <Route path="/create-account" element={<CreateAccountPage />} />

        {/* 🔐 Protected Routes (Require Authentication) */}
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

        <Route
          path="/athlete/profile"
          element={
            <SignedIn>
              <AthleteProfile />
            </SignedIn>
          }
        />
        <Route
          path="/athlete/notifications"
          element={
            <SignedIn>
              <AthleteNotification />
            </SignedIn>
          }
        />

        <Route
          path="/athlete/view-status"
          element={
            <SignedIn>
                <ViewStatus />
            </SignedIn>
          }
        />

        <Route 
          path="/appointment-details/:appt_id" 
            element={
              <SignedIn>
                <AppointmentDetails />
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
          path="/create-treatment-plan/:assigning?/:athlete_id?" 
          element={
            <SignedIn>
              <CreateTreatmentPlan />
            </SignedIn>
            } 
          />

        <Route 
          path="/browse-treatment-plans" 
          element={
            <SignedIn>
              <BroseTreatmentPlans />
            </SignedIn>
            } 
          />

        <Route 
          path="/edit-treatment-plan/:treatment_plan_id" 
            element={
              <SignedIn>
                <EditTreatmentPlan />
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

        <Route
          path="/trainer/profile"
          element={
            <SignedIn>
              <TrainerProfile />
            </SignedIn>
          }
        />

        <Route
          path="/trainer/view-athletes"
          element={
            <SignedIn>
              <ViewAllAthletes />
            </SignedIn>
          }
        />

        <Route 
          path="/manage-athlete/:athlete_id" 
            element={
              <SignedIn>
                <ManageAthlete />
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

        <Route
          path="/coach/players"
          element={
            <SignedIn>
              <PlayerList />
            </SignedIn>
          }
        />

        <Route
          path="/coach/profile"
          element={
            <SignedIn>
              <CoachProfile />
            </SignedIn>
          }
        />
        <Route 
          path="/coach/messages"
          element={
            <SignedIn>
              <Message />
            </SignedIn>
          }
        />

        <Route 
          path="/coach/notifications"
          element={
            <SignedIn>
              <Notifications />
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
        <Route 
          path="/coach/view-player-status/:player_id"
          element={
            <SignedIn>
              <ViewPlayerStatus />
            </SignedIn>
          }
        />

        {/* 🔀 Default Route - Redirect to Sign-In */}
        <Route path="/" element={<SignInPage />} />
      </Routes>
    </Router>
  );
}

export default App;
