import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, ClipboardList, ChevronRight, Activity, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./AthleteHome.css";

const AthleteHome = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState("")
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ADDED: Track whether we show all appointments or only the first 3
  const [showAllAppointments, setShowAllAppointments] = useState(false);

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
          console.log("No User found");
          navigate("/create-account");
          // } else if (data.role !== "Athlete") {
          //   navigate(`/${data.role}Dashboard`);
        } else {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/athletes/get-status/${user.id}`
        );
        const data = await response.json();
        console.log("Data: ", data)
        setStatus(data);
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };


    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/trainers/get-appointments/${user.id}`
        );
        const data = await response.json();
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/system/get-notifications/${user.id}`
        );
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchStatus();
    fetchAppointments();
    fetchNotifications();
  }, [user, navigate]);

  useEffect(() => {
    console.log("status updated:", status);
    // Perform any actions that depend on the updated 'status' here
  }, [status]);

  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="no-data">
        <h2>Unable to load athlete data</h2>
        <p>Please check your network or try again later.</p>
      </div>
    );
  }

  const formatDate = (dateString, origin) => {
    console.log("Date string:", dateString, "origin: ", origin)
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  const calculateProgress = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    const total = endDate - startDate;
    const completed = now - startDate;

    console.log("Start/end", startDate, endDate)
  
    if (total <= 0) return 100;
  
    return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
  };

  // CHANGED: Decide how many appointments to show
  const displayedAppointments = showAllAppointments
    ? appointments
    : appointments.slice(0, 3);

  return (
    <div className="athlete-dashboard">
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
              <h1>Welcome back, {userData.first_name}!</h1>
              <p>Track your progress and manage your training schedule</p>
            </div>
            <Button
              variant="ghost"
              className="profile-button"
              onClick={() => navigate("/athlete/profile")}
            >
              <UserCircle size={24} />
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        
        <h2 className="section-title">Your Status</h2>
        <div className="status-section">
            {status && (
              <Card className="status-card">
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`status-label ${
                      status.status === "healthy"
                        ? "status-healthy"
                        : status.status === "restricted"
                        ? "status-restricted"
                        : "status-injured"
                    }`}
                  >
                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  </div>

                  {(status.status === "out" || status.status === "restricted") && (
                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>{formatDate(status.date_of_injury, "date of injury")}</span>
                        <span>{formatDate(status.estimated_rtc, "estimated rtc")}</span>

                      </div>
                      <div className="progress-bar-background">
                        <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${100 - calculateProgress(status.date_of_injury, status.estimated_rtc)}%` }}
                        ></div>
                        </div>
                      </div>
                      <p className="progress-percentage">
                        {calculateProgress(status.date_of_injury, status.estimated_rtc)}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

      {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          {/* Schedule Appointment Card (uses a button inside) */}
          <Card className="action-card blue-card">
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container blue-icon">
                    <Calendar />
                  </div>
                  <CardTitle>Schedule Appointment</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">Book a session with your trainer</p>
              <Button
                className="schedule-now-button"
                onClick={() => navigate("/athlete/schedule-appointment")}
              >
                Schedule Now
              </Button>
            </CardContent>
          </Card>

          {/* Treatment Plan Card */}
          <Card
            className="action-card green-card"
            onClick={() => navigate("/athlete/view-status")}
          >
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container green-icon">
                    <ClipboardList />
                  </div>
                  <CardTitle>Treatment Plan</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">View your personalized rehab program</p>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card
            className="action-card red-card"
            onClick={() => navigate("/athlete/notifications")}
          >
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container red-icon">
                    <Bell />
                  </div>
                  <CardTitle>Notifications</CardTitle>
                  {notifications.length > 0 && (
                    <span className="notification-badge">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">Check your latest updates</p>
            </CardContent>
          </Card>
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
                {/* ADDED: Toggling between 3 or all appointments */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllAppointments(!showAllAppointments)}
                  className="view-all-button blue-button"
                >
                  {showAllAppointments ? "Show Less" : "View All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="info-card-content">
              {appointments.length > 0 ? (
                <ul className="appointments-list">
                  {displayedAppointments.map((appt) => (
                    <li
                      key={appt.id || `appt-${appt.date}-${appt.time}`}
                      className="appointment-item"
                    >
                      <div className="appointment-content">
                        <div className="appointment-date">
                          <div className="date-short">
                            {formatDate(appt.date, "appt date 0").split(" ")[0]}
                          </div>
                          <div className="date-day">
                            {formatDate(appt.date, "appt date 1").split(" ")[1]}{" "}
                            {formatDate(appt.date, "appt date 2").split(" ")[2]}
                          </div>
                        </div>
                        <div className="appointment-details">
                          <p className="appointment-time">{appt.time}</p>
                          <p className="appointment-trainer">
                            with {appt.trainer_name}
                          </p>
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
                    onClick={() => navigate("/athlete/schedule-appointment")}
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
                  onClick={() => navigate("/athlete/notifications")}
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
                    <li
                      key={
                        notif.id ||
                        `notif-${notif.message?.substring(0, 10)}`
                      }
                      className="notification-item"
                    >
                      <div className="notification-content">
                        <div className="notification-icon-container">
                          <Bell className="notification-icon" />
                        </div>
                        <div className="notification-text">
                          <p className="notification-message">{notif.message}</p>
                          <p className="notification-time">
                            {notif.timestamp
                              ? new Date(notif.timestamp).toLocaleString()
                              : "Just now"}
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
                  <p className="empty-state-subtext">
                    No new notifications at this time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthleteHome;
