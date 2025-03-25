import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

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
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading trainers...</p>;
  }

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
      <Card>
        <CardHeader>
          <CardTitle>Schedule an Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Select a Trainer:{" "}
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                style={{ padding: "0.4rem" }}
              >
                <option value="">-- Choose Trainer --</option>
                {trainers.map((trainer) => (
                    <option key={trainer.clerk_id} value={trainer.clerk_id}>
                        {trainer.first_name} {trainer.last_name} {/* Concatenate first name and last name */}
                    </option>
                    ))}
              </select>
            </label>
          </div>

          {selectedTrainer && slots.length === 0 && (
            <p>No available slots for that trainer at this time.</p>
          )}
          {slots.length > 0 && (
            <div style={{ display: "grid", gap: "1rem" }}>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <p><strong>Date:</strong> {slot.date}</p>
                    <p><strong>Time:</strong> {slot.start_time} - {slot.end_time}</p>
                    <p><strong>Trainer:</strong> {slot.trainer_name}</p> {/* changed here */}
                  </div>
                  <Button onClick={() => handleBook(slot.id)}>Book</Button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
            <Button variant="outline" onClick={() => navigate("/athlete/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScheduleAppointment;