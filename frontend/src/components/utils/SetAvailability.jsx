import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

// Example UI components (adjust to your style)
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

function SetAvailability() {
  const { user } = useUser();

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
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <Card>
        <CardHeader>
          <CardTitle>Set Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Trainer Name */}
            <div>
              <label htmlFor="trainer-name" style={{ marginRight: "0.5rem" }}>
                Your Name:
              </label>
              <input
                id="trainer-name"
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="avail-date" style={{ marginRight: "0.5rem" }}>
                Date:
              </label>
              <input
                id="avail-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="start-time" style={{ marginRight: "0.5rem" }}>
                Start Time:
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="end-time" style={{ marginRight: "0.5rem" }}>
                End Time:
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit} style={{ marginTop: "1rem" }}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SetAvailability;