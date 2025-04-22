import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, ClipboardList, ChevronRight, Users, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import tractionLogo from "../../assets/TractionLogoText.png";
import "./AthleteHome.css";

const TrainerHome = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ADDED: Whether we are showing all appointments or just the first 3
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  useEffect(() => {
    if (!user){
      console.log("User Not detected");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/get-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        console.log(data);
        if (!data || !data.id) {
          console.log("No User found");
          navigate("/create-account");
          // } else if (data.role !== "Trainer") {
          //   navigate(`/${data.role}/dashboard`);
        } else {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
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

  if (!userData){
    console.log("No user data");
    return null;
  } 

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // CHANGED: We decide which appointments to show based on showAllAppointments
  const displayedAppointments = showAllAppointments 
    ? appointments 
    : appointments.slice(0, 3);

  return (
    <div className="trainer-dashboard">
      {/* Hero section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
            </div>
            <div className="hero-text">
              <h1>Welcome back, {userData.first_name}!</h1>
              <p>Manage your treatment options and schedule</p>
            </div>
            <Button
              variant="ghost"
              className="profile-button"
              onClick={() => navigate("/trainer/profile")}
            >
              <UserCircle size={24} />
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>

        <div className="quick-actions">
          
          <Button 
            className="action-card green-card" 
            onClick={() => navigate("/browse-treatment-plans")}
          >
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
              <p className="action-description">Browse and Manage rehab programs</p>
            </CardContent>
          </Button>

          <Button 
            className="action-card green-card" 
            onClick={() => navigate("/trainer/set-availability")}
          >
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container red-icon">
                    <ClipboardList />
                  </div>
                  <CardTitle>Set Your Schedule</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">Set your schedule for upcoming dates</p>
            </CardContent>
          </Button>

          <Button 
            className="action-card green-card" 
            onClick={() => navigate("/trainer/view-athletes")}
          >
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container red-icon">
                    <ClipboardList />
                  </div>
                  <CardTitle>Manage Athletes</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">View all athletes</p>
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
                {/* ADDED: Toggle button for Show All vs. only first 3 */}
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
                          <div className="date-short">{formatDate(appt.date).split(' ')[0]}</div>
                          <div className="date-day">
                            {formatDate(appt.date).split(' ')[1]}{" "}
                            {formatDate(appt.date).split(' ')[2]}
                          </div>
                        </div>
                        <div className="appointment-details">
                          <p className="appointment-time">{appt.time}</p>
                          <p className="appointment-trainer">
                    
                            with {appt.athlete_name}
                          </p>
                          <p>Notes: {appt.notes || " "}</p> 
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
                    <li 
                      key={notif.id || `notif-${notif.message?.substring(0, 10)}`} 
                      className="notification-item"
                    >
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
