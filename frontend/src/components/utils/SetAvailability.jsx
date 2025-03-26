import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Home } from "lucide-react";

import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./SetAvailability.css"; // Make sure this file matches your styling

function SetAvailability() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Trainer info
  const [trainerName, setTrainerName] = useState("");

  // Days-of-week checkboxes
  const [daysOfWeek, setDaysOfWeek] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  // Time range
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // How many weeks ahead
  const [numWeeks, setNumWeeks] = useState(2);

  const handleCheckbox = (day) => {
    setDaysOfWeek((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in as a trainer.");
      return;
    }
    if (!trainerName) {
      alert("Please enter your name.");
      return;
    }

    // Gather selected days
    const selectedDays = Object.keys(daysOfWeek).filter((day) => daysOfWeek[day]);
    if (selectedDays.length === 0) {
      alert("Select at least one weekday.");
      return;
    }
    if (!startTime || !endTime) {
      alert("Please specify a start and end time.");
      return;
    }

    try {
      // In your backend, create an endpoint "bulk-set-availability"
      const resp = await axios.post("http://localhost:8000/api/trainers/bulk-set-availability/", {
        trainer_id: user.id,
        trainer_name: trainerName,
        selected_days: selectedDays,
        start_time: startTime,
        end_time: endTime,
        num_weeks: numWeeks,
      });
      alert(resp.data.message || "Availability set successfully!");
      
      // Reset form
      setTrainerName("");
      setDaysOfWeek({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      });
      setStartTime("");
      setEndTime("");
      setNumWeeks(2);
    } catch (error) {
      console.error("Failed to set availability:", error);
      alert("Error setting availability.");
    }
  };

  return (
    <div className="set-availability-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
            </div>
            <div className="hero-text">
              <h1>Set Your Availability</h1>
              <p>Choose when you're available for appointments</p>
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

      {/* Main Container */}
      <div className="availability-container">
        <Card>
          <CardHeader>
            <CardTitle>Set Availability (Bulk)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="trainer-form-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
              />
            </div>

            <div className="days-of-week-box">
              <p>Select Days of the Week:</p>
              {Object.keys(daysOfWeek).map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={daysOfWeek[day]}
                    onChange={() => handleCheckbox(day)}
                  />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>

            <div className="trainer-form-group">
              <label>Start Time:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="trainer-form-group">
              <label>End Time:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div className="trainer-form-group">
              <label># Weeks Ahead:</label>
              <input
                type="number"
                min="1"
                max="12"
                value={numWeeks}
                onChange={(e) => setNumWeeks(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit}>
              Save Availability
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SetAvailability;
