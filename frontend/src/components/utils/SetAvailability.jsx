import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Home } from "lucide-react";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./SetAvailability.css";

function SetAvailability() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [trainerName, setTrainerName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in as a trainer to set availability.");
      return;
    }
    if (!trainerName || !date || !startTime || !endTime) {
      alert("Please fill out all fields, including your name.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/trainers/set-availability/", {
        trainer_id: user.id,        // Clerk user ID
        trainer_name: trainerName,  // The name trainer typed
        date,
        start_time: startTime,
        end_time: endTime
      });
      alert("Availability Set!");
      // Optional: Clear the form
      setTrainerName("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error(error);
      alert("Failed to set availability.");
    }
  };

  return (
    <div className="set-availability">
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

      <div className="availability-container">
        <Card>
          <CardHeader>
            <CardTitle>Set Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <label htmlFor="trainer-name">Your Name:</label>
              <input
                id="trainer-name"
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="avail-date">Date:</label>
              <input
                id="avail-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="start-time">Start Time:</label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="end-time">End Time:</label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit}>Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SetAvailability;