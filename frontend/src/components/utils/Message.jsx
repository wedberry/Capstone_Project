import React, { useState } from 'react'
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import { Button } from "../ui/button";
import { Home, UserCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useUser } from "@clerk/clerk-react";
import axios from 'axios';
import "./Message.css";

const Message = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:8000/api/system/send-message/', {
        clerk_id: user.id,
        recipient_type: selectedType,
        content: messageText
      });

      if (response.data.success) {
        setSuccess(true);
        setMessageText('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="message-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
            </div>
            <div className="hero-text">
              <h1>Send a Message</h1>
              <p>Choose who you want to message</p>
            </div>
            <Button
              variant="ghost"
              className="home-button"
              onClick={() => navigate("/coach/dashboard")}
            >
              <Home size={20} />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="message-container">
        <div className="type-selector">
          <Button
            variant={selectedType === "athlete" ? "default" : "outline"}
            onClick={() => setSelectedType("athlete")}
            className="type-button"
          >
            <UserCircle size={20} className="button-icon" />
            Message Athletes
          </Button>
          <Button
            variant={selectedType === "trainer" ? "default" : "outline"}
            onClick={() => setSelectedType("trainer")}
            className="type-button"
          >
            <Users size={20} className="button-icon" />
            Message Trainers
          </Button>
        </div>

        {selectedType && (
          <div className="message-card">
            <div className="message-header">
              <h2>Message {selectedType === "athlete" ? "Athletes" : "Trainers"}</h2>
            </div>
            <div className="message-content">
              <form onSubmit={handleSubmit} className="message-form">
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Send a message..."
                    rows={15}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Message sent successfully!</div>}
                <div className="form-actions">
                  <Button 
                    type="submit" 
                    className="send-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;