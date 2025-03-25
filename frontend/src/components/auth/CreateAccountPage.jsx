import React from "react";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

const AccountCreationPage = () => {
  const { user, isLoaded } = useUser();
  const [ firstName, setFirstName ] = useState(user.firstName)
  const [ lastName, setLastName ] = useState(user.lastName)
  const [ email, setEmail ] = useState(user.primaryEmailAddress.emailAddress)
  const [ phone, setPhone ] = useState(user.phoneNumbers && user.phoneNumbers.length > 0 ? user.phoneNumbers[0].phoneNumber : "",)
  const [role, setRole] = useState("");
  const [sport, setSport] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({clerk_id: user.id,
        email: email,
        phone: phone,
        first_name: firstName,
        last_name: lastName,
        role: role,
        sport: sport,})

    const response = await fetch("http://localhost:8000/api/users/create-user/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email: email,

        phone: phone,

        first_name: firstName,
        last_name: lastName,
        role: role,
        sport: sport,

      }),
    });

    if (response.ok) {
      navigate("/athlete/dashboard");  // Redirect to dashboard after account creation
    } else {
      alert("Error creating account");
    }
  };

  useEffect(() => {
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

  if (!user) {
    navigate('/sign-in');
  }


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
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="username-password">
                    <label>Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <div className="username-password">
                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="username-password">
                    <label>Phone</label>
                    <input type="phone" value={phone} onChange={e => setPhone(e.target.value)} />
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
                         <option value="">Select a role</option>
                        <option value="baseball">Baseball</option>
                        <option value="mbasketball">Mens Basketball</option>
                        <option value="mgolf">Mens Golf</option>
                        <option value="mlax">Mens Lacrosse</option>
                        <option value="mrowing">Mens Rowing</option>
                        <option value="msailing">Mens Sailing</option>
                        <option value="msoccer">Mens Soccer</option>
                        <option value="mswim">Mens Swimming</option>
                        <option value="mtennis">Mens Tennis</option>
                        <option value="mski">Mens Waterski</option>

                        <option value="softball">Softball</option>
                        <option value="volleyball">Volleyball</option>
                        <option value="wbasketball">Womens Basketball</option>
                        <option value="wgolf">Womens Golf</option>
                        <option value="wlax">Womens Lacrosse</option>
                        <option value="wrowing">Womens Rowing</option>
                        <option value="wsailing">Womens Sailing</option>
                        <option value="wsoccer">Womens Soccer</option>
                        <option value="wswim">Womens Swimming</option>
                        <option value="wtennis">Womens Tennis</option>
                        <option value="wski">Womens Waterski</option> 
                    </select>
                  </div>
                  <div className="button-group">
                    <button type="button" onClick={() => setStep(1)} className="back-button">
                      Back
                    </button>
                    <button type="submit" className="login-button" onClick={(e) => handleSubmit(e)}>
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
