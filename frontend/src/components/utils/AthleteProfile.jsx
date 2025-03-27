import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Home, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./Profile.css";


// I think the best way to do this. Probably should pull from backend but whatever
const SPORT_CHOICES = [
  { value: 'baseball', label: 'Baseball' },
  { value: 'mbasketball', label: 'Mens Basketball' },
  { value: 'mgolf', label: 'Mens Golf' },
  { value: 'mlax', label: 'Mens Lacrosse' },
  { value: 'mrowing', label: 'Mens Rowing' },
  { value: 'msailing', label: 'Mens Sailing' },
  { value: 'msoccer', label: 'Mens Soccer' },
  { value: 'mswim', label: 'Mens Swimming' },
  { value: 'mtennis', label: 'Mens Tennis' },
  { value: 'mski', label: 'Mens Waterski' },
  { value: 'softball', label: 'Softball' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'wbasketball', label: 'Womens Basketball' },
  { value: 'wgolf', label: 'Womens Golf' },
  { value: 'wlax', label: 'Womens Lacrosse' },
  { value: 'wrowing', label: 'Womens Rowing' },
  { value: 'wsailing', label: 'Womens Sailing' },
  { value: 'wsoccer', label: 'Womens Soccer' },
  { value: 'wswim', label: 'Womens Swimming' },
  { value: 'wtennis', label: 'Womens Tennis' },
  { value: 'wski', label: 'Womens Waterski' },
];

// Normal states got from other dashboards
const AthleteProfile = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [athleteData, setAthleteData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    sport: '',
  });

  // Fetches
  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/get-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const data = await response.json();
        if (!data.exists) {
          navigate("/create-account");
          return;
        }

        if (data.role.toLowerCase() !== "athlete") {
          navigate(`/${data.role.toLowerCase()}/dashboard`);
          return;
        }

        setAthleteData(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          sport: data.sport || '',
        });
      } catch (error) {
        setError("Failed to fetch athlete data");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAthleteData();
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log("isEditing changed to:", isEditing);
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/users/update-user/${user.id}/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setAthleteData(prev => ({ ...prev, ...formData }));
        setIsEditing(false);
        setError(null);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Failed to update profile");
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Button onClick={() => navigate("/athlete/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="athlete-profile-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
            </div>
            <div className="hero-text">
              <h1>Athlete Profile</h1>
              <p>Manage your personal information and credentials</p>
            </div>
            <Button
              variant="ghost"
              className="home-button"
              onClick={() => navigate("/athlete/dashboard")}
            >
              <Home size={20} />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="profile-container">
        <Card className="profile-card">
          <CardHeader>
            <div className="profile-header">
              <div className="profile-avatar">
                <UserCircle size={80} />
              </div>
              <div className="profile-title">
                <h2>{athleteData?.first_name} {athleteData?.last_name}</h2>
                <p className="profile-subtitle">{athleteData?.sport} Athlete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="form-actions">
              {!isEditing && (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                >
                  Edit Profile
                </Button>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sport">Sport</label>
                  <select
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="sport-select"
                  >
                    <option value="">Select a sport</option>
                    {SPORT_CHOICES.map((sport) => (
                      <option key={sport.value} value={sport.value}>
                        {sport.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                {isEditing && (
                  <>
                    <Button 
                      type="submit" 
                      className="save-button"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          first_name: athleteData.first_name || '',
                          last_name: athleteData.last_name || '',
                          email: athleteData.email || '',
                          phone: athleteData.phone || '',
                          sport: athleteData.sport || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteProfile;