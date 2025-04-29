import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Bell, UserCircle, Home } from "lucide-react";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./AthleteNotification.css";

const AthleteNotification = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/system/get-notifications/${user.id}/`);
        setNotifications(response.data.notifications);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch notifications');
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="notification-loading">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-error">
        {error}
      </div>
    );
  }

  return (
    <div className='athlete-notifications'>

    {/* Hero section */}
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
              <h1>Notifications</h1>
              <p>View All Notifications</p>
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
    <div className="notification-container">
      <div className="notification-header">
        <Bell className="notification-icon" />
        <h2>Your Notifications</h2>
      </div>
      
      {notifications.length === 0 ? (
        <Card className="no-notifications">
          <CardContent>
            No notifications at this time
          </CardContent>
        </Card>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <Card key={notification.id} className="notification-card">
              <CardContent>
                <div className="notification-meta">
                  <span className="notification-sender">{notification.sender}</span>
                  <span className="notification-time">
                    {notification.date} at {notification.time}
                  </span>
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default AthleteNotification;