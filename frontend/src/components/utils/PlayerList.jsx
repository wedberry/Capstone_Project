import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Home, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./PlayerList.css";

const PlayerList = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [coachData, setCoachData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the coach's data to get their sport
        const coachResponse = await fetch(`http://localhost:8000/api/users/get-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const coachData = await coachResponse.json();
        if (!coachData.exists) {
          navigate("/create-account");
          return;
        }

        if (coachData.role.toLowerCase() !== "coach") {
          navigate(`/${coachData.role.toLowerCase()}/dashboard`);
          return;
        }

        setCoachData(coachData);

        // Then get the team members
        const teamResponse = await fetch(`http://localhost:8000/api/coaches/team-members/${user.id}/`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const teamData = await teamResponse.json();
        if (teamData.error) {
          setError(teamData.error);
          return;
        }

        setTeamMembers(teamData.team_members);
      } catch (error) {
        setError("Failed to fetch team data");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, navigate]);

  const handlePlayerClick = (playerId) => {
    navigate(`/coach/player-profile/${playerId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="error-button" onClick={() => navigate("/coach/dashboard")}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="player-list-page">
      {/* Hero Section */}
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
              <h1>Team Members</h1>
              <p>View and manage your {coachData?.sport?.replace(/([A-Z])/g, ' $1').trim()} team</p>
            </div>
            <Button
              variant="ghost"
              className="home-button"
              onClick={() => navigate("/coach/dashboard")}
            >
              <Home size={20} />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="player-list-container">
        <div className="player-grid">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="action-card blue-card"
              onClick={() => handlePlayerClick(member.id)}
            >
              <div className="action-card-header">
                <div className="action-card-title-row">
                  <div className="action-card-title-content">
                    <div className="action-icon-container blue-icon">
                      <UserCircle />
                    </div>
                    <h3>{member.first_name} {member.last_name}</h3>
                  </div>
                  <div className="action-chevron">→</div>
                </div>
              </div>
              <p className="action-description">{member.email}</p>
              <p className="action-description">{member.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlayerList;