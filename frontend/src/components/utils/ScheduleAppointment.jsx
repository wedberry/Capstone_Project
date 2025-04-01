import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Home, Calendar } from "lucide-react";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./ScheduleAppointment.css";

function ScheduleAppointment() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Trainer & date states
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [slots, setSlots] = useState([]);     
  const [mergedSlots, setMergedSlots] = useState([]); 

  // For mini-calendar
  const [displayedMonth, setDisplayedMonth] = useState(selectedDate.getMonth());
  const [displayedYear, setDisplayedYear] = useState(selectedDate.getFullYear());

  // Appointment type
  const [appointmentType, setAppointmentType] = useState("treatment");
  
  // CHANGED: Store the selected slot & user notes
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // 1) On mount, fetch trainers
  useEffect(() => {
    async function fetchTrainers() {
      try {
        const resp = await axios.get("http://localhost:8000/api/trainers/list");
        setTrainers(resp.data);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        alert("Failed to load trainers.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrainers();
  }, []);

  // 2) Whenever trainer+date changes, fetch raw 15-min slots
  useEffect(() => {
    if (!selectedTrainer || !selectedDate) return;

    async function fetchAvailability() {
      try {
        const dateString = selectedDate.toISOString().split("T")[0];
        const resp = await axios.get(
          `http://localhost:8000/api/trainers/availabilities?trainer_id=${selectedTrainer}&date=${dateString}`
        );
        setSlots(resp.data);
      } catch (err) {
        console.error("Error fetching availability:", err);
        alert("Failed to load availability.");
      }
    }
    fetchAvailability();
  }, [selectedTrainer, selectedDate]);

  // 3) Merge consecutive 15-min slots for 30-min types
  useEffect(() => {
    if (!slots.length) {
      setMergedSlots([]);
      return;
    }

    const sorted = [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (appointmentType === "medical_clearance") {
      setMergedSlots(sorted);
      return;
    }

    let combined = [];
    let i = 0;
    while (i < sorted.length) {
      const current = sorted[i];
      if (i + 1 < sorted.length) {
        const next = sorted[i + 1];
        if (next.start_time === current.end_time) {
          const combinedSlot = {
            id: current.id,
            date: current.date,
            trainer_id: current.trainer_id,
            trainer_name: current.trainer_name,
            start_time: current.start_time,
            end_time: next.end_time,
          };
          combined.push(combinedSlot);
          i += 2;
          continue;
        }
      }
      i += 1;
    }
    setMergedSlots(combined);
  }, [slots, appointmentType]);

  // 4) Book the chosen slot with notes
  const handleBook = async () => {
    if (!selectedSlot) {
      alert("Please select a time slot first.");
      return;
    }
    console.log("Booking availability")
    console.log({
        slot_id: selectedSlot.id,
        athlete_id: user.id,
        appointment_type: appointmentType,
        notes,
    })
    try {
      await axios.post("http://localhost:8000/api/trainers/book-availability/", {
        slot_id: selectedSlot.id,
        athlete_id: user.id,
        appointment_type: appointmentType,
        notes, // send the notes
      });
      alert("Appointment booked!");
      // reset states
      setSelectedSlot(null);
      setNotes("");
      navigate("/athlete/dashboard");
    } catch (err) {
      console.error("Error booking slot:", err);
      alert("Failed to book slot.");
    }
  };

  function formatSlotTime(timeStr) {
    const [hour, minute] = timeStr.split(":");
    let hh = parseInt(hour, 10);

    const ampm = hh >= 12 ? "pm" : "am";
    hh = hh % 12 || 12;

    return `${hh}:${minute} ${ampm}`;
  }

  // Instead of auto booking, we pick a slot to store in state
  function TimeSlotButton({ slot }) {
    const [isHover, setIsHover] = useState(false);

    const style = {
      position: "relative",
      zIndex: 9999,
      pointerEvents: "auto",
      backgroundColor: isHover ? "#91c2ff" : "#2a70ff",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "0.75rem 1rem",
      fontSize: "0.9rem",
      fontWeight: "bold",
      cursor: "pointer",
      textAlign: "center",
      margin: 0,
      transition: "background-color 0.2s, transform 0.1s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    };

    return (
      <button
        style={style}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => {
          setSelectedSlot(slot);  // CHANGED: just pick the slot, not book
        }}
      >
        {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)}
      </button>
    );
  }

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
              <img
                src={tractionLogo}
                alt="Traction Logo"
                className="hero-logo-image"
              />
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
            <div className="appointment-layout">
              {/* Left column: trainer select, appt type, miniCalendar */}
              <div className="left-column">
                <label className="trainer-label">
                  Select Trainer:
                  <select
                    className="trainer-select"
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                  >
                    <option value="">-- Choose Trainer --</option>
                    {trainers.map((t) => (
                      <option key={t.clerk_id} value={t.clerk_id}>
                        {t.first_name} {t.last_name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="appointment-type-group">
                  <label>Appointment Type:</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <option value="injury_consultation">Injury Consultation (30 min)</option>
                    <option value="treatment">Treatment (30 min)</option>
                    <option value="medical_clearance">Medical Clearance (15 min)</option>
                  </select>
                </div>

                <MiniCalendar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  displayedMonth={displayedMonth}
                  setDisplayedMonth={setDisplayedMonth}
                  displayedYear={displayedYear}
                  setDisplayedYear={setDisplayedYear}
                />
              </div>

              {/* Right column: time slot grid */}
              <div className="right-column">
                {!selectedTrainer && (
                  <p>Please choose a trainer.</p>
                )}

                {selectedTrainer && mergedSlots.length === 0 && (
                  <p>No available slots for the chosen date.</p>
                )}

                {selectedTrainer && mergedSlots.length > 0 && (
                  <div className="time-slot-grid">
                    {mergedSlots.map((slot, idx) => (
                      <TimeSlotButton key={idx} slot={slot} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ADDED: Display selected slot info & notes field */}
            {selectedSlot && (
              <div className="confirm-section">
                <h3>Confirm Your Appointment</h3>
                <p>
                  You selected: 
                  <strong> {formatSlotTime(selectedSlot.start_time)} - {formatSlotTime(selectedSlot.end_time)}</strong>
                  , on <strong>{selectedSlot.date}</strong>
                </p>
                <label>
                  Notes (why are you scheduling?):
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  />
                </label>
                <Button className="confirm-button"
            
                  onClick={handleBook}
                >
                  Confirm Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// The MiniCalendar is the same as you provided, ensuring handlePrevMonth/handleNextMonth are declared inside

function MiniCalendar({
  displayedYear,
  displayedMonth,
  setDisplayedMonth,   
  setDisplayedYear,    
  selectedDate,
  setSelectedDate,
}) {
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(displayedYear, displayedMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarCells.push(null); 
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function isSelected(day) {
    if (!day) return false;
    const testDate = new Date(displayedYear, displayedMonth, day);
    return (
      selectedDate.getFullYear() === testDate.getFullYear() &&
      selectedDate.getMonth() === testDate.getMonth() &&
      selectedDate.getDate() === testDate.getDate()
    );
  }

  function handleDayClick(day) {
    if (!day) return;
    const newDate = new Date(displayedYear, displayedMonth, day);
    setSelectedDate(newDate);
  }

  function handlePrevMonth() {
    let newMonth = displayedMonth - 1;
    let newYear = displayedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setDisplayedMonth(newMonth);
    setDisplayedYear(newYear);
  }

  function handleNextMonth() {
    let newMonth = displayedMonth + 1;
    let newYear = displayedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setDisplayedMonth(newMonth);
    setDisplayedYear(newYear);
  }

  return (
    <div className="mini-calendar-wrapper">
      <div className="calendar-header">
        <button className="arrow-btn" onClick={handlePrevMonth}>
          &#8249;
        </button>
        <span className="month-label">
          {new Date(displayedYear, displayedMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {displayedYear}
        </span>
        <button className="arrow-btn" onClick={handleNextMonth}>
          &#8250;
        </button>
      </div>

      <div className="weekday-row">
        {weekdayLabels.map((label) => (
          <div key={label} className="weekday-label">
            {label}
          </div>
        ))}
      </div>

      <div className="calendar-days-grid">
        {calendarCells.map((day, index) => {
          const selected = isSelected(day);
          return (
            <div
              key={index}
              className={`day-cell ${selected ? "selected-day" : ""} ${
                day ? "" : "empty-cell"
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScheduleAppointment;
