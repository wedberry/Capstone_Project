import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, ClipboardList, Settings, Activity } from "lucide-react";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./AthleteHome.css";

const CoachHome = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First check if user exists and get their role
        const checkResponse = await fetch(`http://localhost:8000/api/users/check-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const checkData = await checkResponse.json();
        
        if (!checkData.exists) {
          navigate("/create-account");
          return;
        }

        if (checkData.role.toLowerCase() !== "coach") {
          const path = `/${checkData.role.toLowerCase()}/dashboard`;
          navigate(path);
          return;
        }

        // If user is a coach, fetch their full data
        const userResponse = await fetch(`http://localhost:8000/api/users/get-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const userData = await userResponse.json();
        if (userData.exists) {
          setUserData(userData);
        } else {
          console.error("User data not found");
          navigate("/create-account");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/create-account");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="error-container">
        <p>Unable to load coach data</p>
        <button onClick={() => navigate("/create-account")}>Create Account</button>
      </div>
    );
  }

  return (
    <div className="athlete-dashboard">
      {/* Hero section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img
                src={tractionLogo}
                alt="Traction Logo"
                className="hero-logo-image"
              />
            </div>
            <div className="hero-text">
              <h1>Welcome back, {userData.first_name}!</h1>
              <p>Track your progress and manage your training schedule</p>
            </div>
          </div>
        </div>
      </div>


    {/* First Row of Cards to view the players on your team */}


      <div className="dashboard-container">
        {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          {/* View Team Card */}
          <div className="action-card blue-card" onClick={() => navigate("/coach/players")}>
            <div className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container blue-icon">
                    <Users />
                  </div>
                  <h3>View Team</h3>
                </div>
                <div className="action-chevron">→</div>
              </div>
            </div>
            <p className="action-description">View and manage your team members</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachHome;
