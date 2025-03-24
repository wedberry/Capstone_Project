import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import "./AthleteHome.css";

const CoachHome = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/get-user/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!data.exists) {
          navigate("/create-account");
        } else if (data.role.toLowerCase() !== "coach") {
          const role = data.role.toLowerCase();
          navigate(`/${role}/dashboard`);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="athlete-dashboard">
      {/* Hero section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-icon">
              <Users />
            </div>
            <div className="hero-text">
              <h1>Welcome back, Coach {user?.firstName}!</h1>
              <p>Manage your athletes and training plans</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <Card className="action-card blue-card" onClick={() => navigate("/coach/manage-athletes")}>
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container blue-icon">
                    <Users />
                  </div>
                  <CardTitle>Manage Athletes</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">View and manage your athlete roster</p>
            </CardContent>
          </Card>

          <Card className="action-card green-card" onClick={() => navigate("/coach/training-plans")}>
            <CardHeader className="action-card-header">
              <div className="action-card-title-row">
                <div className="action-card-title-content">
                  <div className="action-icon-container green-icon">
                    <ClipboardList />
                  </div>
                  <CardTitle>Training Plans</CardTitle>
                </div>
                <ChevronRight className="action-chevron" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="action-description">Create and manage training programs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoachHome;
