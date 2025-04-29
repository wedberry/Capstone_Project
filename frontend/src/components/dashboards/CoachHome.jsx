import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, ClipboardList, Settings, Activity, UserCircle, MessageCircle, Bell, Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./AthleteHome.css";

const CoachHome = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [standings, setStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [standingsError, setStandingsError] = useState(null);
  const [sport, setSport] = useState("");
  const navigate = useNavigate();

  const fetchStandings = async () => {
    if (!sport) return; // Don't fetch if no sport is set
    
    try {
      const response = await fetch(`http://localhost:8000/api/system/standings/?sport=${sport}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch standings');
      }
      const data = await response.json();
      setStandings(data.standings);
    } catch (err) {
      console.error('Error fetching standings:', err);
      setStandingsError(err.message);
    } finally {
      setStandingsLoading(false);
    }
  };

  
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
    fetchNotifications();
  }, [user, navigate]);

  // Fetch standings when sport changes
  useEffect(() => {
    if (sport) {
      setStandingsLoading(true);
      fetchStandings();
    }
  }, [sport]);

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
      <div className="error-container">
        <p>Unable to load coach data</p>
        <button onClick={() => navigate("/create-account")}>Create Account</button>
      </div>
    );
  }

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
              onClick={() => navigate("/coach/profile")}
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
          {/* View Team Card */}
          <div className="action-card blue-card" onClick={() => navigate("/coach/players")}>
            <div className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container blue-icon">
                    <Users />
                  </div>
                  <h3>View Team</h3>
                </div>
                <div className="action-chevron">→</div>
              </div>
            </div>
            <p className="action-description">View and manage your team members</p>
          </div>

          {/* Send Message Card */}
          <div className="action-card blue-card" onClick={() => navigate("/coach/messages")}>
            <div className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container blue-icon">
                    <MessageCircle />
                  </div>
                  <h3>Send Message</h3>
                </div>
                <div className="action-chevron">→</div>
              </div>
            </div>
            <p className="action-description">Send a message to athletes or trainers</p>
          </div>

          {/* View Notifications Card*/}
          <div className="action-card blue-card" onClick={() => navigate("/coach/notifications")}>
            <div className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container blue-icon">
                    <Bell />
                  </div>
                  <h3>View Notifications</h3>
                </div>
                <div className="action-chevron">→</div>
              </div>
            </div>
            <p className="action-description">View your notifications</p>
          </div>
        </div>

        {/* Notifications Section */}
        <h2 className="section-title">Recent Notifications</h2>
        <Card className="info-card">
          <CardHeader className="info-card-header">
            <div className="info-card-title-row">
              <div className="info-card-title">
                <Bell className="info-card-icon blue-text" />
                <CardTitle>Recent Notifications</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/coach/notifications")}
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

        {/* Standings Section */}
        {sport && standings.length > 0 && !standingsError && (
          <>
            <h2 className="section-title">{sport.charAt(0).toUpperCase() + sport.slice(1)} Conference Standings</h2>
            <Card className="standings-card">
              <CardHeader className="standings-header">
                <div className="header-content">
                  <Trophy className="header-icon" />
                  <CardTitle>SSC {sport.charAt(0).toUpperCase() + sport.slice(1)} Standings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {standingsLoading ? (
                  <div className="loading-state">Loading standings...</div>
                ) : (
                  <div className="standings-table">
                    <div className="standings-header-row">
                      <div className="standings-col school-col">School</div>
                      <div className="standings-col">Conf</div>
                      <div className="standings-col">Overall</div>
                      <div className="standings-col">Pct</div>
                      <div className="standings-col">Streak</div>
                    </div>
                    {standings.map((team, index) => (
                      <div 
                        key={team.school} 
                        className={`standings-row ${index < 3 ? 'top-three' : ''}`}
                      >
                        <div className="standings-col school-col">{team.school}</div>
                        <div className="standings-col">{team.conf}</div>
                        <div className="standings-col">{team.overall}</div>
                        <div className="standings-col">{team.pct}</div>
                        <div className={`standings-col ${team.streak.startsWith('W') ? 'winning' : 'losing'}`}>
                          {team.streak}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default CoachHome;