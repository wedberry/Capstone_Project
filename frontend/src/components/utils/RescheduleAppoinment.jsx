import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../ui/button";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./ScheduleAppointment.css";

function RescheduleAppointment() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { state } = useLocation();
  const currentAppointment = state?.appointment;

  const [selectedDate, setSelectedDate] = useState(() => {
    if (currentAppointment?.date) {
      return currentAppointment.date;
    }
    return new Date().toISOString().split("T")[0]; // today
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState(currentAppointment?.notes || "");

  useEffect(() => {
    if (!currentAppointment?.trainer_id || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/trainers/availabilities?trainer_id=${currentAppointment.trainer_id}&date=${selectedDate}`
        );

        const now = new Date();
        const filteredSlots = res.data.filter((slot) => {
          const slotTime = new Date(`${slot.date}T${slot.start_time}`);
          return slotTime > now;
        });

        setAvailableSlots(filteredSlots);
      } catch (err) {
        console.error("Error fetching availability:", err);
        alert("Failed to load available slots.");
      }
    };

    fetchSlots();
  }, [currentAppointment?.trainer_id, selectedDate]);

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return alert("Please choose a time slot.");

    try {
      await axios.put("http://localhost:8000/api/trainers/reschedule-appointment/", {
        appointment_id: currentAppointment.id,
        new_slot_ids: [selectedSlot.id],
        athlete_id: user.id,
        appointment_type: currentAppointment.appointment_type,
        notes,
      });
      alert("Appointment successfully rescheduled!");
      navigate("/athlete/dashboard");
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert("Rescheduling failed.");
    }
  };

  return (
    <div className="schedule-appointment">
      {/* Header */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-logo">
            <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
          </div>
          <div className="hero-text">
            <h1>Reschedule Your Appointment</h1>
            <p>Select a new time with your trainer</p>
           
          </div>
        </div>
      </div>

      {/* Reschedule content */}
      <div className="schedule-container">
        <h2 className="section-title">Pick a New Day</h2>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedSlot(null);
            setSelectedDate(e.target.value);
          }}
          className="date-picker"
          style={{ marginBottom: "1rem", padding: "0.5rem", fontSize: "1rem" }}
        />

        <h3 style={{ marginBottom: "1rem" }}>Available Time Slots for {selectedDate}</h3>
        {availableSlots.length === 0 ? (
          <p>No available slots for this date.</p>
        ) : (
          <div className="time-slot-grid">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                className={`time-slot-button ${selectedSlot?.id === slot.id ? "selected" : ""}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {formatTime(slot.start_time)}
              </button>
            ))}
          </div>
        )}

        {selectedSlot && (
          <div className="confirm-section">
            <h3>Confirm New Time</h3>
            <p>
              New Time: <strong>{formatTime(selectedSlot.start_time)}</strong> on{" "}
              <strong>{selectedSlot.date}</strong>
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
            <Button onClick={handleReschedule} className="confirm-button" style={{ marginTop: "1rem" }}>
              Confirm Reschedule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RescheduleAppointment;
