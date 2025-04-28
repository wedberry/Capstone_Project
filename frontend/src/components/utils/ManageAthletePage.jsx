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
import "./Profile.css";

const ManageAthlete = () => {
  const { user } = useUser();
  const { athlete_id } = useParams();
  const navigate = useNavigate();
  const [ athleteStatus, setAthleteStatus ] = useState(null);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTP, setIsEditingTP ] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    inj: '',
    restrictions: '',
    date_of_injury: '',
    estimated_return: '',
    detailed_plan: '',
    trainer_name: '',
  });

  const [trainer, setTrainer] = useState("");
  const [treatment_plan_name, setTreatmentPlanName] = useState("");
  const [injury, setInjury] = useState("");
  const [duration, setDuration] = useState(null);

  const JSON5 = require("json5");

  const [ treatmentPlanExists, setTreatmentPlanExists ] = useState(false);

  // Combined state for treatment plan details
  const [treatmentPlanDetails, setTreatmentPlanDetails] = useState({
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

  // Calculate estimated return date based on injury date and duration
  const calculateEstimatedReturn = (injuryDate, durationDays) => {
    if (!injuryDate || !durationDays) return '';
    try {
      const date = new Date(injuryDate);
      date.setDate(date.getDate() + parseInt(durationDays, 10));
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error calculating return date:", error);
      return '';
    }
  };

  // Fetches
  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/athletes/get-status/${athlete_id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const data = await response.json();
        if (!data.exists) {
          navigate("/trainer/view-athletes");
          return;
        }

        setAthleteStatus(data);
        console.log("status: ", data);

        setFormData({
          status: data.status || '',
          inj: data.injury || '',
          restrictions: data.trainer_restrictions || '',
          date_of_injury: formatDateForInput(data.date_of_injury) || '',
          estimated_return: formatDateForInput(data.estimated_RTC) || '',
          detailed_plan: data.detailed_plan || '',
          trainer_name: data.trainer_name || '',
        });

        const detailedPlanJSON = safeJsonParse(data.detailed_plan);

        if (detailedPlanJSON) {
            // Transform exercises object to array with consistent structure
            const exercisesArray = Object.entries(detailedPlanJSON.exercises || {}).map(([name, details]) => {
                // Ensure each exercise has all required fields
                return {
                    name,
                    reps: details.reps || "",
                    weight: details.weight || "",
                    notes: details.notes || ""
                };
            });
            
            // Transform treatments object to array with consistent structure
            const treatmentsArray = Object.entries(detailedPlanJSON.treatments || {}).map(([name, details]) => {
                // Ensure each treatment has all required fields
                return {
                    name,
                    quantity: details.quantity || "",
                    notes: details.notes || ""
                };
            });

            // Set the combined state
            setTreatmentPlanDetails({
                exercises: exercisesArray,
                treatments: treatmentsArray
            });

            console.log("Treatment Plan Details set:", exercisesArray, treatmentsArray);
        } else {
            console.error("Invalid JSON format.");
            // Set empty arrays if JSON parsing failed
            setTreatmentPlanDetails({
                exercises: [],
                treatments: []
            });
        }

        setTreatmentPlanExists(true);


      } catch (error) {
        setError("Failed to fetch athlete status");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTreatmentPlans = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/trainers/get-treatment-plans`);
            const data = await response.json();
            setTreatmentPlans(data.treatmentPlans);
            setFilteredPlans(data.treatmentPlans);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching treatment plans:", error);
            setIsLoading(false);
        }
    };

    if (user) {
      fetchAthleteData();
      fetchTreatmentPlans();
    }
  }, [user, navigate, athlete_id]);

  useEffect(() => {
    // Find the selected treatment plan from the list when form data changes
    if (formData.treatment_plan_id && treatmentPlans.length > 0) {
      const plan = treatmentPlans.find(plan => plan.id === parseInt(formData.treatment_plan_id));
      
      if (plan) {
        setTreatmentPlanName(plan.name);
        setTrainer(plan.trainer_name);
        setInjury(plan.injury);

        if (plan.duration) {
            const days = parseInt(plan.duration.split(" ")[0]); // "5 00:00:00" → 5
            setDuration(days.toString());
            
            // Auto-update estimated return based on injury date and duration
            if (formData.date_of_injury && days) {
              const estimatedReturn = calculateEstimatedReturn(formData.date_of_injury, days);
              setFormData(prev => ({
                ...prev,
                estimated_return: estimatedReturn
              }));
            }
        }

        const detailedPlanJSON = safeJsonParse(plan.detailed_plan);

        if (detailedPlanJSON) {
            // Transform exercises object to array with consistent structure
            const exercisesArray = Object.entries(detailedPlanJSON.exercises || {}).map(([name, details]) => {
                // Ensure each exercise has all required fields
                return {
                    name,
                    reps: details.reps || "",
                    weight: details.weight || "",
                    notes: details.notes || ""
                };
            });
            
            // Transform treatments object to array with consistent structure
            const treatmentsArray = Object.entries(detailedPlanJSON.treatments || {}).map(([name, details]) => {
                // Ensure each treatment has all required fields
                return {
                    name,
                    quantity: details.quantity || "",
                    notes: details.notes || ""
                };
            });

            // Set the combined state
            setTreatmentPlanDetails({
                exercises: exercisesArray,
                treatments: treatmentsArray
            });

            console.log("Treatment Plan Details set:", exercisesArray, treatmentsArray);
        } else {
            console.error("Invalid JSON format.");
            // Set empty arrays if JSON parsing failed
            setTreatmentPlanDetails({
                exercises: [],
                treatments: []
            });
        }

        setTreatmentPlanExists(true);
      }
    }
  }, [formData.treatment_plan_id, treatmentPlans]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for date of injury - update estimated return if duration is available
    if (name === 'date_of_injury' && duration) {
      const estimatedReturn = calculateEstimatedReturn(value, duration);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        estimated_return: estimatedReturn
      }));
    
    } else if (name === 'status' && value === 'healthy' ){
        setFormData(prev => ({
            ...prev,
            ['status']: 'healthy',
            ['inj']: '',
            ['date_of_injury']: '',
            ['estimated_return']: '',
            ['detailed_plan']: '',
          }));

        setTreatmentPlanDetails({
            exercises: [],
            treatments: []
        });

        setTreatmentPlanExists(false);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTreatmentPlanChange = (e) => {
    const selectedPlanId = e.target.value;
    setFormData(prev => ({
      ...prev,
      treatment_plan_id: selectedPlanId
    }));
  };

  useEffect(() => {
    console.log("Selected treatment plan (after update): ", formData.treatment_plan_id);
  }, [formData.treatment_plan_id]);

  const addActivity = () => {
    if (activity && reps) {
      setTreatmentPlanDetails(prev => ({
        ...prev,
        exercises: [
          ...prev.exercises, 
          { 
            name: activity, 
            reps: reps, 
            weight: weight || "", 
            notes: activityNotes || ""
          }
        ],
      }));
      
      // Clear form
      setActivity("");
      setReps("");
      setWeight("");
      setActivityNotes("");
    }
  };

  const addTreatment = () => {
    if (treatment && quantity) {
      setTreatmentPlanDetails(prev => ({
        ...prev,
        treatments: [
          ...prev.treatments, 
          { 
            name: treatment, 
            quantity: quantity, 
            notes: treatmentNotes || ""
          }
        ],
      }));
      
      // Clear form
      setTreatment("");
      setQuantity("");
      setTreatmentNotes("");
    }
  };

  const moveItem = (type, index, direction) => {
    const items = [...treatmentPlanDetails[type]];
    if (direction === 'up' && index > 0) {
        [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    
    setTreatmentPlanDetails(prev => ({
        ...prev,
        [type]: items
    }));
  };

  const deleteItem = (type, index) => {
    const items = [...treatmentPlanDetails[type]];
    items.splice(index, 1);
    
    setTreatmentPlanDetails(prev => ({
        ...prev,
        [type]: items
    }));
  };

  const changeIsEditing = () => {
    setIsEditingTP(!isEditingTP);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
        // Convert treatment plan details back to the expected format
        const detailedPlan = {
            exercises: {},
            treatments: {}
        };

        // Convert exercises array to object format
        treatmentPlanDetails.exercises.forEach(exercise => {
            detailedPlan.exercises[exercise.name] = {
            reps: exercise.reps,
            weight: exercise.weight,
            notes: exercise.notes
            };
        });

        // Convert treatments array to object format
        treatmentPlanDetails.treatments.forEach(treatment => {
            detailedPlan.treatments[treatment.name] = {
            quantity: treatment.quantity,
            notes: treatment.notes
            };
        });

        // Make sure we're using the current trainer name
        const currentTrainerName = user?.fullName || formData.trainer_name || trainer;

        // Prepare the data payload with athlete ID and all required fields
        const payload = {
            athlete_id: athlete_id,
            status: formData.status,
            inj: formData.inj,
            restrictions: formData.restrictions || null,
            date_of_injury: formData.date_of_injury || null,
            estimated_return: formData.estimated_return || null,
            detailed_plan: JSON.stringify(detailedPlan),
            trainer_name: currentTrainerName, 

        };
  
        // Make API request to update athlete status
        const response = await fetch(`http://localhost:8000/api/athletes/update-status/`, {
            method: "PUT",
            credentials: "include",
            headers: { 
            "Content-Type": "application/json" 
            },
            body: JSON.stringify(payload)
        });
  
        // Handle the response
        const data = await response.json();
        
        if (data.success) {
            // Update the local state with the new data
            setAthleteStatus(prev => ({ 
            ...prev, 
            status: formData.status,
            inj: formData.inj,
            trainer_restrictions: formData.restrictions,
            date_of_injury: formData.date_of_injury,
            estimated_RTC: formData.estimated_return,
            detailed_plan: formData.detailed_plan,
            trainer_name: formData.trainer_name
            }));
        
        // Exit edit mode
        setIsEditing(false);
        setIsEditingTP(false);
        
        // Optional: Show success message
        alert("Athlete status updated successfully!");
      } else {
        // Handle error from API
        setError(data.error || "Failed to update athlete status");
        console.error("API Error:", data.error);
      }
    } catch (error) {
      // Handle network or other errors
      setError("Network error: Failed to update athlete status");
      console.error("Error:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading athlete status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Button onClick={() => navigate("/trainer/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="athlete-profile-page">
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
            </div>
            <div className="hero-text">
              <h1>Athlete Status</h1>
              <p>Manage athlete status and treatment plan</p>
            </div>
            <Button
              variant="ghost"
              className="home-button"
              onClick={() => navigate("/trainer/dashboard")}
            >
              <Home size={20} />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="profile-container">
        <Card className="profile-card">
          <CardHeader>
            <div className="profile-header">
              <div className="profile-avatar">
                <UserCircle size={80} />
              </div>
              {athleteStatus && (
              <div className="profile-title">
                <h2>{athleteStatus?.athlete_name}</h2>
                <p className="profile-subtitle">Is {athleteStatus.status}</p>
              </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="form-actions">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="edit-button">
                  Edit Status
                </Button>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    >
                        <option value={formData.status}>{formData.status}</option>
                        <option key="healthy" value="healthy">Healthy</option>
                        <option key="restricted" value="restricted">Restricted</option>
                        <option key="out" value="out">Out</option>
                    </select>

                    <label htmlFor="inj">Injury</label>
                    <input
                        id="injury"
                        name="inj"
                        value={formData.inj}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_injury">Date of Injury</label>
                  <input
                    type="date"
                    id="date_of_injury"
                    name="date_of_injury"
                    value={formData.date_of_injury}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />

                  <label htmlFor="estimated_return">Estimated Return</label>
                  <input
                    type="date"
                    id="estimated_return"
                    name="estimated_return"
                    value={formData.estimated_return}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="treatment_plan_id">Treatment Plan</label>
                  <select
                    id="treatment_plan_id"
                    name="treatment_plan_id"
                    value={formData.treatment_plan_id}
                    onChange={handleTreatmentPlanChange}
                    disabled={!isEditing}
                    className="treatment-plan-dropdown"
                  >
                    <option value="">Select a Treatment Plan</option>
                    {treatmentPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name || `Treatment Plan ${plan.id}`}
                      </option>
                    ))}
                  </select>
                
                {treatment_plan_name !== "" && (
                  <div className="treatment-plan-details">
                    <h3>Selected Treatment Plan Overview</h3>
                    <table className="treatment-plan-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Value</th>
                        </tr>
                      </thead>
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
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="restrictions">Restrictions</label>
                <textarea
                  id="restrictions"
                  name="restrictions"
                  value={formData.restrictions}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {treatmentPlanExists && (
              <div className="treatment-plan-container">
                <h2>Treatment Plan Details</h2>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => changeIsEditing()}
                  disabled={!isEditing}
                >
                  <Pencil size={16} />
                </Button>
                
                

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
                            <TableCell header={true}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {treatmentPlanDetails.treatments.length > 0 ? (
                            treatmentPlanDetails.treatments.map((treatment, index) => (
                              <TableRow key={index}>
                                <TableCell>{treatment.name}</TableCell>
                                <TableCell>{treatment.quantity}</TableCell>
                                <TableCell>{treatment.notes}</TableCell>
                                <TableCell>
                                  <div className="action-buttons">
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => moveItem('treatments', index, 'up')}
                                      disabled={index === 0 || !isEditingTP}
                                    >
                                      <ChevronUp size={16} />
                                    </Button>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => moveItem('treatments', index, 'down')}
                                      disabled={index === treatmentPlanDetails.treatments.length - 1 || !isEditingTP}
                                    >
                                      <ChevronDown size={16} />
                                    </Button>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => deleteItem('treatments', index)}
                                      disabled={!isEditingTP}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="empty-table-message">
                                No treatments added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      {isEditingTP && (
                        <div className="add-form-treatments">
                          <Input 
                            placeholder="Treatment" 
                            value={treatment} 
                            onChange={e => setTreatment(e.target.value)} 
                          />

                          <Input 
                            placeholder="Quantity (e.g. 20 mins)" 
                            value={quantity} 
                            onChange={e => setQuantity(e.target.value)} 
                          />

                          <Input 
                            placeholder="Notes (optional)" 
                            value={treatmentNotes} 
                            onChange={e => setTreatmentNotes(e.target.value)} 
                          />

                          <Button type="button" onClick={addTreatment} className="add-button">
                            Add Treatment
                          </Button>
                        </div>
                      )}
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
                            <TableCell header={true}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {treatmentPlanDetails.exercises.length > 0 ? (
                            treatmentPlanDetails.exercises.map((exercise, index) => (
                              <TableRow key={index}>
                                <TableCell>{exercise.name}</TableCell>
                                <TableCell>{exercise.reps}</TableCell>
                                <TableCell>{exercise.weight}</TableCell>
                                <TableCell>{exercise.notes}</TableCell>
                                <TableCell>
                                  <div className="action-buttons">
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => moveItem('exercises', index, 'up')}
                                      disabled={index === 0 || !isEditingTP}
                                    >
                                      <ChevronUp size={16} />
                                    </Button>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => moveItem('exercises', index, 'down')}
                                      disabled={index === treatmentPlanDetails.exercises.length - 1 || !isEditingTP}
                                    >
                                      <ChevronDown size={16} />
                                    </Button>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => deleteItem('exercises', index)}
                                      disabled={!isEditingTP}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="empty-table-message">
                                No exercises added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      {isEditingTP && (
                        <div className="add-form-exercises">
                          <Input 
                            placeholder="Activity" 
                            value={activity} 
                            onChange={e => setActivity(e.target.value)} 
                          />
                          <Input 
                            placeholder="Reps" 
                            value={reps} 
                            onChange={e => setReps(e.target.value)} 
                          />
                          <Input 
                            placeholder="Weight" 
                            value={weight} 
                            onChange={e => setWeight(e.target.value)} 
                          />
                          <Input 
                            placeholder="Notes (optional)" 
                            value={activityNotes} 
                            onChange={e => setActivityNotes(e.target.value)} 
                          />
                          <Button type="button" onClick={addActivity} className="add-button">
                            Add Exercise
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="form-actions">
              {isEditing && (
                <>

                  <Button type="submit" className="save-button">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setIsEditingTP(false);
                      setFormData({
                        status: athleteStatus.status || '',
                        treatment_plan_id: athleteStatus.treatment_plan_id || '',
                        restrictions: athleteStatus.trainer_restrictions || '',
                        date_of_injury: formatDateForInput(athleteStatus.date_of_injury) || '',
                        estimated_return: formatDateForInput(athleteStatus.estimated_RTC) || '',
                      });
                      
                      // Reset treatment plan details from original data
                      if (athleteStatus.treatment_plan_id) {
                        const plan = treatmentPlans.find(p => p.id === parseInt(athleteStatus.treatment_plan_id));
                        if (plan) {
                          const detailedPlanJSON = safeJsonParse(plan.detailed_plan);
                          
                          if (detailedPlanJSON) {
                            const exercisesArray = Object.entries(detailedPlanJSON.exercises || {}).map(([name, details]) => ({
                              name,
                              reps: details.reps || "",
                              weight: details.weight || "",
                              notes: details.notes || ""
                            }));
                            
                            const treatmentsArray = Object.entries(detailedPlanJSON.treatments || {}).map(([name, details]) => ({
                              name,
                              quantity: details.quantity || "",
                              notes: details.notes || ""
                            }));
                            
                            setTreatmentPlanDetails({
                              exercises: exercisesArray,
                              treatments: treatmentsArray
                            });
                          }
                        }
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default ManageAthlete;