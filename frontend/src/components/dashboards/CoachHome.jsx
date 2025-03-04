import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CoachHome = () => {
  const { user } = useUser();
  const [isRegistered, setIsRegistered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const response = await fetch(`http://localhost:8000/api/users/check-user/${user.id}`, {
        method: "GET",
        credentials: "include", // Allow cookies (if needed)
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      if (!data.exists) {
        navigate("/create-account");
      } else if (data.role !== "Coach") {
        // Fixed syntax here
        const path = `/${data.role}Home`;
        navigate(path);
      } else {
        setIsRegistered(true);
      }
    };
  
    checkUser();
  }, [user, navigate]);

  if (isRegistered === null) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>You are logged in as a Coach.</p>
    </div>
  );
};

export default CoachHome;
