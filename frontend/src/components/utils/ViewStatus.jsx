import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, UserCircle, ChevronUp, ChevronDown, Trash2, Pencil, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableHead, TableCell, TableBody, TableRow } from "../ui/table";
import { Input } from "../ui/button";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./ViewStatus.css";

const ViewStatus = () => {
  const { user } = useUser();

  const navigate = useNavigate();
  const [ status, setStatus ] = useState('');
  const [ inj, setInj ] = useState('');
  const [ treatmentPlanId, setTreatmentPlanId ] = useState('');
  const [ restrictions, setRestrictions ] = useState('');
  const [ dateOfInjury, setDateOfInjury ] = useState('');
  const [ estimatedReturn, setEstimatedReturn ] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [treatment_plan_name, setTreatmentPlanName] = useState("");
  const [ trainer, setTrainer ] = useState("");
  const [injury, setInjury] = useState("");
  const [duration, setDuration] = useState(null);

  const JSON5 = require("json5");

  // Combined state for treatment plan details
  const [treatmentPlan, setTreatmentPlan] = useState({
    exercises: [],
    treatments: []
  });

  const [activity, setActivity] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  const [treatment, setTreatment] = useState("");
  const [quantity, setQuantity] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");

  const safeJsonParse = (jsonString) => {
    try {
      // Replace single quotes with double quotes for strings
      const parsedObject = JSON5.parse(jsonString);
      return parsedObject;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { exercises: {}, treatments: {} }; // Return empty structure on error
    }
  };

  // Format date for display in form inputs (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Invalid date format:", error);
      return '';
    }
  };

  // Fetches
  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/athletes/get-status/${user.id}/`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const data = await response.json();
        if (!data.exists) {
          navigate("/athlete/dashboard");
          return;
        }

        console.log("Get-status response:", data)

        setStatus(data.status);
        setInj(data.inj);
        setTreatmentPlanId(data.treatment_plan_id);
        setRestrictions(data.trainer_restrictions);

        if (data.date_of_injury != '') {
          setDateOfInjury(formatDateForInput(data.date_of_injury));
        }

        if (data.estimated_rtc != '') {
          setEstimatedReturn(formatDateForInput(data.estimated_rtc));
        }

      } catch (error) {
        setError("Failed to fetch athlete status");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
      fetchAthleteData()
  }, [user, navigate]);

const fetchTreatmentPlan = async (planId) => {
      setIsLoading(true);

      try {
          console.log("Fetching Treatment Plan")
          const response = await axios.get(`http://127.0.0.1:8000/api/trainers/get-single-treatment-plan/${planId}/`);
          console.log("Response Data:", response.data)
          const plan = response.data;
      
          setTreatmentPlanName(plan.name);
          setTrainer(plan.trainer_name);
          setInjury(plan.injury);

          if (plan.duration) {
              const days = parseInt(plan.duration.split(" ")[0]); // "5 00:00:00" → 5
              setDuration(days.toString());
          }

          const detailedPlanJSON = safeJsonParse(plan.detailed_plan);
          console.log("Detailed Json plan", detailedPlanJSON)

          if (detailedPlanJSON) {
              const exercisesArray = Object.entries(detailedPlanJSON.exercises || {}).map(([name, { reps, weight, notes }]) => ({
                  name: name,
                  reps: reps,
                  weight: weight,
                  notes: notes // Adjust if you have notes or additional fields
              }));
              
              const treatmentsArray = Object.entries(detailedPlanJSON.treatments || {}).map(([name, { quantity, notes }]) => ({
                  name: name,
                  quantity: quantity,
                  notes: notes // Adjust if you have notes or additional fields
              }));

              console.log(exercisesArray)
              console.log(treatmentsArray)

              setTreatmentPlan({
                  ...treatmentPlan,
                  exercises: exercisesArray,
                  treatments: treatmentsArray,
              });
          } else {
              console.error("Invalid JSON format.");
          }

      } catch (error) {
          alert("Failed to load treatment plan.");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {

    if (treatmentPlanId) {
        fetchTreatmentPlan(treatmentPlanId);
    } else {
        console.log("No treatement plan")
    }
  }, [user, treatmentPlanId]);

 useEffect(() => {
    console.log("Status:", status)
 }, [status]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="no-data">
        <h2>Unable to load athlete data</h2>
        <p>Please check your network or try again later.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
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
  
    if (total <= 0) return 100;
  
    return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
  };

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
              <h1>{user.firstName}!</h1>
              <p>View Your Status and Full Treatment Plan</p>
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
        
        <div className="status-section">
            {status && (
              <Card className="status-card">
                <CardHeader>
                  <CardTitle>Your Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`status-label ${
                      status === "healthy"
                        ? "status-healthy"
                        : status === "restricted"
                        ? "status-restricted"
                        : "status-injured"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>

                  {(status === "out" || status === "restricted") && (
                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>{formatDate(dateOfInjury)}</span>
                        <span>{formatDate(estimatedReturn)}</span>

                      </div>
                      <div className="progress-bar-background">
                        <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${100 - calculateProgress(dateOfInjury, estimatedReturn)}%` }}
                        ></div>
                        </div>
                      </div>
                      <p className="progress-percentage">
                        {calculateProgress(dateOfInjury, estimatedReturn)}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          { treatmentPlanId ? (
                <div className="treatment-plan-details">
                    <h3> Treatment Plan Overview</h3>
                    <table className="treatment-plan-table">

                      <tbody>
                        <tr>
                          <td>Name</td>
                          <td>{treatment_plan_name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Injury</td>
                          <td>{injury || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Duration</td>
                          <td>{duration || 'N/A'} days</td>
                        </tr>
                        <tr>
                          <td>Created By</td>
                          <td>{trainer || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>

              <div className="form-group">
                <label htmlFor="restrictions">Restrictions</label>
                <textarea
                  id="restrictions"
                  name="restrictions"
                  value={restrictions}
                  readOnly={true}
                />
              </div>

              <div className="treatment-plan-container">
                <h2>Treatment Plan Details</h2>

                <div className="treatment-section">
                  <Card className="treatment-card">
                    <CardHeader>
                      <CardTitle>Treatments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table className="data-table">
                        <TableHead>
                          <TableRow>
                            <TableCell header={true}>Treatment</TableCell>
                            <TableCell header={true}>Quantity</TableCell>
                            <TableCell header={true}>Notes</TableCell>
                            
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {treatmentPlan.treatments.length > 0 ? (
                            treatmentPlan.treatments.map((treatment, index) => (
                              <TableRow key={index}>
                                <TableCell>{treatment.name}</TableCell>
                                <TableCell>{treatment.quantity}</TableCell>
                                <TableCell>{treatment.notes}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="empty-table-message">
                                No treatments added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                    </CardContent>
                  </Card>

                  <Card className="treatment-card">
                    <CardHeader>
                      <CardTitle>Exercises</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table className="data-table">
                        <TableHead>
                          <TableRow>
                            <TableCell header={true}>Exercise</TableCell>
                            <TableCell header={true}>Reps</TableCell>
                            <TableCell header={true}>Weight</TableCell>
                            <TableCell header={true}>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {treatmentPlan.exercises.length > 0 ? (
                            treatmentPlan.exercises.map((exercise, index) => (
                              <TableRow key={index}>
                                <TableCell>{exercise.name}</TableCell>
                                <TableCell>{exercise.reps}</TableCell>
                                <TableCell>{exercise.weight}</TableCell>
                                <TableCell>{exercise.notes}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="empty-table-message">
                                No exercises added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p>You are Healthy!</p>
              <p>If you have been injured please schedule a injury consultation with your team's trainer</p>

            </div>
          )}
          

      </div>
    </div>
  );
};
export default ViewStatus;