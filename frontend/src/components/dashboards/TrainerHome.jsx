import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, ClipboardList, ChevronRight, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import "./AthleteHome.css";

const TrainerHome = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/get-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!data.exists) {
          console.log("No User found")
          navigate("/create-account");
        } else if (data.role !== "trainer") {
          navigate(`/${data.role}/dashboard`);
        } else {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/trainers/get-appointments/${user.id}`);
        const data = await response.json();
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/system/get-notifications/${user.id}`);
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchAppointments();
    fetchNotifications();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  if (!userData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="trainer-dashboard">
      {/* Hero section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-icon">
              <Activity />
            </div>
            <div className="hero-text">
              <h1>Welcome back, {userData.first_name}!</h1>
              <p>Welcome Message</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">

          <Button className="action-card green-card" onClick={() => navigate("/browse-treatment-plans")}>
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container green-icon">
                    <ClipboardList />
                  </div>
                  <CardTitle>Manage Treatment Plans</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">Browse and Mangage rehab programs</p>
            </CardContent>
          </Button>

        </div>

        {/* Appointments & Notifications */}
        <div className="info-cards-container">
          {/* Appointments Section */}
          <Card className="info-card">
            <CardHeader className="info-card-header">
              <div className="info-card-title-row">
                <div className="info-card-title">
                  <Calendar className="info-card-icon blue-text" />
                  <CardTitle>Upcoming Appointments</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/schedule-appointment")}
                  className="view-all-button blue-button"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="info-card-content">
              {appointments.length > 0 ? (
                <ul className="appointments-list">
                  {appointments.slice(0, 3).map((appt) => (
                    <li key={appt.id || `appt-${appt.date}-${appt.time}`} className="appointment-item">
                      <div className="appointment-content">
                        <div className="appointment-date">
                          <div className="date-short">{formatDate(appt.date).split(' ')[0]}</div>
                          <div className="date-day">{formatDate(appt.date).split(' ')[1]} {formatDate(appt.date).split(' ')[2]}</div>
                        </div>
                        <div className="appointment-details">
                          <p className="appointment-time">{appt.time}</p>
                          <p className="appointment-trainer">with {appt.trainer_name}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="details-button"
                      >
                        Details
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <Calendar className="empty-state-icon" />
                  <p className="empty-state-text">No upcoming appointments</p>
                  <Button 
                    className="empty-state-button" 
                    variant="outline"
                    onClick={() => navigate("/schedule-appointment")}
                  >
                    Schedule Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="info-card">
            <CardHeader className="info-card-header">
              <div className="info-card-title-row">
                <div className="info-card-title">
                  <Bell className="info-card-icon red-text" />
                  <CardTitle>Recent Notifications</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/notifications")}
                  className="view-all-button red-button"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="info-card-content">
              {notifications.length > 0 ? (
                <ul className="notifications-list">
                  {notifications.slice(0, 4).map((notif) => (
                    <li key={notif.id || `notif-${notif.message?.substring(0, 10)}`} className="notification-item">
                      <div className="notification-content">
                        <div className="notification-icon-container">
                          <Bell className="notification-icon" />
                        </div>
                        <div className="notification-text">
                          <p className="notification-message">{notif.message}</p>
                          <p className="notification-time">
                            {notif.timestamp ? new Date(notif.timestamp).toLocaleString() : "Just now"}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <Bell className="empty-state-icon" />
                  <p className="empty-state-text">You're all caught up!</p>
                  <p className="empty-state-subtext">No new notifications at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainerHome;