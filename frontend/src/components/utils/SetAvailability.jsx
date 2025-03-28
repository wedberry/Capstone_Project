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

  // Trainer name & default name from Clerk user
  const [trainerName, setTrainerName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ""
  );

  // Start/End time & weeks ahead
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [numWeeks, setNumWeeks] = useState(2);

  /**
   * Generate 15-min increments from 7:00 (hour=7) up to 20:00 (8:00 pm).
   * The snippet ensures we do not go beyond "20:00".
   */
  const timeOptions = [];
  for (let hour = 7; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 15) {
      // If it's 20:xx and xx>0, skip (so we only get "20:00" at the end).
      if (hour === 20 && min > 0) break;

      const hrStr = String(hour).padStart(2, "0");
      const minStr = String(min).padStart(2, "0");
      timeOptions.push(`${hrStr}:${minStr}`); // e.g. "07:00", "07:15", "07:30"...
    }
  }

  // Helper to display times in 12-hour format with am/pm
  function formatTo12Hour(timeStr) {
    // timeStr is "HH:MM" => "h:MM am/pm"
    const [hour, minute] = timeStr.split(":");
    let hh = parseInt(hour, 10);
    const ampm = hh >= 12 ? "pm" : "am";
    hh = hh % 12 || 12;
    return `${hh}:${minute} ${ampm}`;
  }

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
      const resp = await axios.post("http://localhost:8000/api/trainers/bulk-set-availability/", {
        trainer_id: user.id,
        trainer_name: trainerName,
        selected_days: selectedDays,
        start_time: startTime,  // e.g. "07:15" in 24h
        end_time: endTime,      // e.g. "15:00" in 24h
        num_weeks: numWeeks,
      });
      alert(resp.data.message || "Availability set successfully!");

      // Reset the form
      setTrainerName(user ? `${user.firstName} ${user.lastName}` : "");
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
              <img
                src={tractionLogo}
                alt="Traction Logo"
                className="hero-logo-image"
              />
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

            {/* Start Time Dropdown (7am -> 8pm) */}
            <div className="trainer-form-group">
              <label>Start Time:</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="">-- Select Start --</option>
                {timeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {formatTo12Hour(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* End Time Dropdown (7am -> 8pm) */}
            <div className="trainer-form-group">
              <label>End Time:</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">-- Select End --</option>
                {timeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {formatTo12Hour(opt)}
                  </option>
                ))}
              </select>
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

            <Button onClick={handleSubmit}>Save Availability</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SetAvailability;
