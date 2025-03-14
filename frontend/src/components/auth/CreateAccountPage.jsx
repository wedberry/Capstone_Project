import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AccountCreationPage = () => {
  const { user } = useUser();
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/api/users/create-user/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email: user.primaryEmailAddress.emailAddress,

        phone: user.phoneNumbers && user.phoneNumbers.length > 0 
        ? user.phoneNumbers[0].phoneNumber 
        : "",

        first_name: user.firstName,
        last_name: user.lastName,
        role: role,
      }),
    });

    if (response.ok) {
      navigate("/athlete/dashboard");  // Redirect to dashboard after account creation
    } else {
      alert("Error creating account");
    }
  };

  return (
    <div>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Select Role:
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select a role</option>
            <option value="Athlete">Athlete</option>
            <option value="Trainer">Trainer</option>
            <option value="Coach">Coach</option>
          </select>
        </label>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default AccountCreationPage;
