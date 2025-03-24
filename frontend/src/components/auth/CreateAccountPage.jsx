import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css"; // Reuse existing styles
import React from "react";

const AccountCreationPage = () => {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState("");
  const [sport, setSport] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Move useEffect to top level
  React.useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Return null if not authenticated
  if (!user) {
    return null;
  }

  const userData = {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.primaryEmailAddress?.emailAddress || "",
    phone:
      user.phoneNumbers && user.phoneNumbers.length > 0
        ? user.phoneNumbers[0].phoneNumber
        : "",
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "Athlete":
        return "/athlete/dashboard";
      case "Trainer":
        return "/trainer/dashboard";
      case "Coach":
        return "/coach/dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate(getDashboardPath(role));

    /* Backend communication code (commented out for testing)
    const phoneNumber = userData.phone ? parseInt(userData.phone.replace(/\D/g, '')) : 1234567890;

    const response = await fetch("http://localhost:8000/api/users/create-user/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email: userData.email,
        phone: phoneNumber,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: role.toLowerCase(),
        sport: sport,
        username: user.id
      }),
    });

    if (response.ok) {
      navigate(getDashboardPath(role));
    } else {
      const errorData = await response.json();
      console.error('Error creating account:', errorData);
      alert("Error creating account: " + JSON.stringify(errorData));
    }
    */
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-content">
        <div className="welcome-text">
          <h1>Complete Your Profile</h1>
          {step === 1 && <p>Verify your information before proceeding</p>}
          {step === 2 && <p>Choose your role and sport</p>}
        </div>

        <div className="login-form-container">
          {step === 1 && (
            <div className="verification-step">
              <div className="username-password">
                <label>First Name</label>
                <input type="text" value={userData.firstName} disabled />
              </div>
              <div className="username-password">
                <label>Last Name</label>
                <input type="text" value={userData.lastName} disabled />
              </div>
              <div className="username-password">
                <label>Email</label>
                <input type="email" value={userData.email} disabled />
              </div>
              <div className="username-password">
                <label>Phone</label>
                <input type="tel" value={userData.phone || "Not provided"} disabled />
              </div>
              <button className="login-button" onClick={() => setStep(2)}>
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="username-password">
                <label>Select Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  required
                  className="w-full p-3 border rounded-md"
                >
                  <option value="">Select a role</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Coach">Coach</option>
                </select>
              </div>
              <div className="username-password">
                <label>Select Sport</label>
                <select 
                  value={sport} 
                  onChange={(e) => setSport(e.target.value)} 
                  required
                  className="w-full p-3 border rounded-md"
                >
                  <option value="">Select a sport</option>
                  <option value="Lacrosse">Lacrosse</option>
                  <option value="Baseball">Baseball</option>
                  <option value="Waterski">Waterski</option>
                  <option value="Volleyball">Volleyball</option>
                </select>
              </div>
              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="back-button">
                  Back
                </button>
                <button type="submit" className="login-button">
                  Complete Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="right-column">
        <div className="bubble"></div>
      </div>
    </div>
  );
};

export default AccountCreationPage;
