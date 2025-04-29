import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, UserCircle, Calendar, Clock, FileText, MapPin, Activity } from "lucide-react";
import { Button } from "../ui/button";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./AppointmentDetails.css";

const AppointmentDetails = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { appt_id } = useParams()
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // First get the coach's data to get their sport
        const response = await fetch(`http://localhost:8000/api/trainers/get-appointment-details/${appt_id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const apptData = await response.json();

        console.log(apptData)

        setAppointment(apptData);

      } catch (error) {
        setError("Failed to fetch appointment");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAppointment();
    }
  }, [user, navigate]);

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return { day: 'N/A', month: 'N/A', fullDate: 'N/A' };
    
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };
    
// Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Convert "HH:MM:SS" format to "HH:MM AM/PM"
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString; // Return original if parsing fails
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Appointment Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="error-button" onClick={() => navigate("/athlete/dashboard")}>
          Return to Dashboard
        </button>
      </div>
    );
  }


  const formattedDate = appointment?.date ? formatDate(appointment.date) : { day: 'N/A', month: 'N/A', fullDate: 'N/A' };
  const formattedTime = appointment?.time ? formatTime(appointment.time) : 'N/A';

  const handleCancel = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/trainers/cancel-appointment/${appt_id}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Appointment canceled successfully!");
        navigate("/athlete/dashboard");  // Go back to dashboard
      } else {
        const data = await response.json();
        alert(`Failed to cancel appointment: ${data.error}`);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("An unexpected error occurred.");
    }
  };
  
  const handleReschedule = () => {
    navigate(`/athlete/reschedule/${appt_id}`, { state: { appointment } });
  };
  
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
              <h1>Appointment Details</h1>
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

      <div className="appointment-details-container">
        {appointment && (
          <div className="appointment-card">
            <div className="appointment-header">
              <h2> Your appointment</h2>
              <p className="appointment-subtitle">View and manage your scheduled appointment</p>
            </div>
            
            <div className="appointment-body">
              {/* Calendar Display */}
              <div className="calendar-display">
                <div className="calendar-month">{formattedDate.month}</div>
                <div className="calendar-day">{formattedDate.day}</div>
              </div>
              
              {/* Appointment Details */}
              <div className="details-container">
                <div className="detail-row">
                  <div className="detail-icon">
                    <UserCircle size={20} />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Trainer</div>
                    <div className="detail-value">{appointment.trainer_name}</div>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-icon">
                    <Activity size={20} />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Appointment Type</div>
                    <div className="detail-value">{appointment.appointment_type || 'Training Session'}</div>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Date</div>
                    <div className="detail-value">{formattedDate.fullDate}</div>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-icon">
                    <Clock size={20} />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Time</div>
                    <div className="detail-value">{formattedTime}</div>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="appointment-notes">
                    <div className="notes-label">Notes</div>
                    <div className="notes-content">{appointment.notes}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="action-buttons">
            <button className="action-button cancel-button" onClick={handleCancel}>
                 Cancel Appointment
            </button>
            <button className="action-button reschedule-button" onClick={handleReschedule}>
                  Reschedule
           </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentDetails;