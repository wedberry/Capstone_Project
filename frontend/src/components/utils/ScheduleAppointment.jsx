import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, Calendar, Home } from "lucide-react";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./ScheduleAppointment.css";

function ScheduleAppointment() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const resp = await axios.get("http://localhost:8000/api/trainers/list");
        console.log(resp.data)
        setTrainers(resp.data);
      } catch (error) {
        console.error("Error fetching trainers list:", error);
        alert("Failed to load trainer list.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (!selectedTrainer) return;
    async function fetchAvailability() {
      console.log(selectedTrainer)
      try {
        const resp = await axios.get(
          `http://localhost:8000/api/trainers/availabilities?trainer_id=${selectedTrainer}`
        );
        // ex: resp.data = [{ id, trainer_id, trainer_name, date, start_time, end_time, is_booked }, ...]
        setSlots(resp.data);
      } catch (error) {
        console.error("Error fetching availability:", error);
        alert("Failed to load availability.");
      }
    }
    fetchAvailability();
  }, [selectedTrainer]);

  const handleBook = async (slotId) => {
    if (!user) {
      alert("You must be logged in.");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/trainers/book-availability/", {
        slot_id: slotId,
        athlete_id: user.id,
      });
      alert("Appointment booked!");
      navigate("/athlete/dashboard");
    } catch (error) {
      console.error("Error booking slot:", error);
      alert("Failed to book slot.");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading trainers...</p>
      </div>
    );
  }

  return (
    <div className="schedule-appointment">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
            </div>
            <div className="hero-text">
              <h1>Schedule an Appointment</h1>
              <p>Book a session with your preferred trainer</p>
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

      <div className="schedule-container">
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <select
                className="trainer-select"
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
              >
                <option value="">-- Choose Trainer --</option>
                {trainers.map((trainer) => (
                  <option key={trainer.clerk_id} value={trainer.clerk_id}>
                    {trainer.first_name} {trainer.last_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTrainer && slots.length === 0 && (
              <p>No available slots for that trainer at this time.</p>
            )}
            
            {slots.length > 0 && (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <div key={slot.id} className="slot-item">
                    <div className="slot-info">
                      <span className="slot-date">{slot.date}</span>
                      <span className="slot-time">{slot.start_time} - {slot.end_time}</span>
                      <span className="slot-trainer">with {slot.trainer_name}</span>
                    </div>
                    <Button onClick={() => handleBook(slot.id)}>Book</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ScheduleAppointment;