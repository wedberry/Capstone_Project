import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Home, UserCircle, Search } from "lucide-react";
import { Input } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./PlayerList.css";

const ViewAllAthletes = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [ trainerData, setTrainerData ] = useState("");
  const [ athletes, setAthletes ] = useState([]) 
  const [filteredAthletes, setFilteredAthletes ] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) On mount, fetch athletes
  useEffect(() => {
    async function fetchAthletes() {
      try {
        const resp = await axios.get("http://localhost:8000/api/trainers/fetchAllAthletes");
        setAthletes(resp.data);
      } catch (err) {
        console.error("Error fetching athletes:", err);
        alert("Failed to load athletes.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (!athletes || searchTerm.trim() === "") {
        setFilteredAthletes(athletes);
        return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = athletes.filter(athlete => 
        athlete?.first_name?.toLowerCase().includes(lowercasedSearch) || 
        athlete?.last_name?.toLowerCase().includes(lowercasedSearch) || 
        athlete?.sport?.toLowerCase().includes(lowercasedSearch)
    );

    setFilteredAthletes(filtered);
}, [searchTerm, athletes]);

  const handlePlayerClick = (playerId) => {
    console.log(playerId)
    navigate(`/manage-athlete/${playerId}`)
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
};

// Reset search
const handleClearSearch = () => {
    setSearchTerm("");
};

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading athletes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="error-button" onClick={() => navigate("/trainer/dashboard")}>
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
              <h1>Athletes</h1>
              <p>View and manage athletes</p>
            </div>
            <Button
              variant="ghost"
              className="home-button"
              onClick={() => navigate("/trainer/dashboard")}
            >
              <Home size={20} />
              Home
            </Button>
          </div>
        </div>
      </div>


      <div className="player-list-container">
        <div className="search-section">
            <CardHeader>
                <CardTitle>Athletes</CardTitle>
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by name, sport"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        {searchTerm && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleClearSearch}
                                className="clear-search-btn"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    <br></br>
                </div>
            </CardHeader>
        </div>
        <div className="player-grid">
          {filteredAthletes.map((member) => (
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

export default ViewAllAthletes;