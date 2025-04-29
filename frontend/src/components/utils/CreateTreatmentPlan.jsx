import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Input } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { Calendar } from "../ui/calendar";
import { ChevronUp, ChevronDown, Trash2, Home } from "lucide-react";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./CreateTreatmentPlan.css";

export default function TreatmentPlanForm() {
    const { user } = useUser();

    const defaultName = user ? `${user.firstName} ${user.lastName}` : ""; // Default trainer name
    const [trainer, setTrainer] = useState(defaultName);
    const [treatment_plan_name, setTreatmentPlanName] = useState("");
    const [injury, setInjury] = useState("");
    const [duration, setDuration] = useState(null);

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

    const navigate = useNavigate();

    
    const addActivity = () => {
        if (activity && reps) {
          setTreatmentPlan(prev => ({
            ...prev,
            exercises: [ ...prev.exercises, { name: activity, reps : reps, weight : weight, notes: activityNotes || ""}],
          }));
          setActivity("");
          setReps("");
          setWeight("");
          setActivityNotes("");
        }
      };

      const addTreatment = () => {
        if (treatment && quantity) {
          setTreatmentPlan(prev => ({
            ...prev,
            treatments: [...prev.treatments, { name: treatment, quantity: quantity, notes: treatmentNotes || ""}],
          }));
          setTreatment("");
          setQuantity("");
          setTreatmentNotes("");
        }
      };

    const moveItem = (type, index, direction) => {
        const items = [...treatmentPlan[type]];
        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        setTreatmentPlan(prev => ({
            ...prev,
            [type]: items
        }));
    };

    const deleteItem = (type, index) => {
        const items = [...treatmentPlan[type]];
        items.splice(index, 1);
        setTreatmentPlan(prev => ({
            ...prev,
            [type]: items
        }));
    };

      const handleSubmit = async () => {

        const exercisesObj = {};
        const treatmentsObj = {};

        // Iterate exercises array and add to exercises JSON
        treatmentPlan.exercises.forEach(ex => {
            exercisesObj[ex.name] = {"name": ex.name, "reps": ex.reps, "weight": ex.weight, "notes": ex.notes}
        });

        // Interate treatments array and add to treatments JSON
        treatmentPlan.treatments.forEach(tr => {
            treatmentsObj[tr.name] = {"name": tr.name, "quantity": tr.quantity, "notes": tr.notes};
        });

        const data = {
            treatment_plan_name: treatment_plan_name,
            trainer_name: trainer,
            injury: injury,
            duration: duration,
            detailed_plan: {
                exercises: exercisesObj,
                treatments: treatmentsObj
            },
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/trainers/save-treatment-plan/", data, {
              headers: { "Content-Type": "application/json" },
            });
            alert("Treatment Plan Created Successfully!");

            navigate(`/browse-treatment-plans`);
          } catch (error) {
            console.error("Error creating treatment plan:", error);
            alert("Failed to create treatment plan.");
          }
        };

        useEffect(() => {
            if (user) {
              setTrainer(`${user.firstName} ${user.lastName}`);
            }
          }, [user]);


          return (
            <div className="create-treatment-plan">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-container">
                        <div className="hero-content">
                            <div className="hero-logo">
                                <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
                            </div>
                            <div className="hero-text">
                                <h1>Create Treatment Plan</h1>
                                <p>Design a treatment plan template for your athletes</p>
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

                <div className="treatment-plan-container">
                    <Card className="patient-info-card">
                        <CardHeader>
                            <CardTitle>Treatment Plan Details</CardTitle>
                        </CardHeader>
                        <CardContent className="form-content">
                            <div className="form-group">
                                <label htmlFor="trainer">Trainer Name:</label>
                                <Input 
                                    id="trainer"  
                                    value={trainer} 
                                    onChange={(e) => setTrainer(e.target.value)}
                                />
                            </div>
                            {/* <br /> */}
                            <div className="form-group">
                                <label htmlFor="plan-name">Treatment Plan Name:</label>
                                <Input 
                                    id="plan-name" 
                                    placeholder="Treatment Plan Name" 
                                    value={treatment_plan_name} 
                                    onChange={e => setTreatmentPlanName(e.target.value)} 
                                />
                            </div>
                            {/* <br /> */}
                            <div className="form-group">
                                <label htmlFor="injury">Injury Treated:</label>
                                <Input 
                                    id="injury" 
                                    placeholder="Injury" 
                                    value={injury} 
                                    onChange={e => setInjury(e.target.value)} 
                                />
                            </div>
                            {/* <br /> */}
                            <div className="form-group">
                                <label htmlFor="duration">Estimated Duration (days):</label>
                                    <Input 
                                        id="duration"
                                        type="number"
                                        min="0"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                        </div>
                        </CardContent>
                    </Card>
        
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
                                        {treatmentPlan.treatments.length > 0 ? (
                                            treatmentPlan.treatments.map((treatment, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{treatment.name}</TableCell>
                                                    <TableCell>{treatment.quantity}</TableCell>
                                                    <TableCell>{treatment.notes}</TableCell>
                                                    <TableCell>
                                                        <div className="action-buttons">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => moveItem('treatments', index, 'up')}
                                                                disabled={index === 0}
                                                            >
                                                                <ChevronUp size={16} />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => moveItem('treatments', index, 'down')}
                                                                disabled={index === treatmentPlan.treatments.length - 1}
                                                            >
                                                                <ChevronDown size={16} />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => deleteItem('treatments', index)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
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

                                    <Button onClick={addTreatment} className="add-button">
                                        Add Treatment
                                    </Button>
                                    
                                </div>
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
                                        {treatmentPlan.exercises.length > 0 ? (
                                            treatmentPlan.exercises.map((exercise, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{exercise.name}</TableCell>
                                                    <TableCell>{exercise.reps}</TableCell>
                                                    <TableCell>{exercise.weight}</TableCell>
                                                    <TableCell>{exercise.notes}</TableCell>
                                                    <TableCell>
                                                        <div className="action-buttons">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => moveItem('exercises', index, 'up')}
                                                                disabled={index === 0}
                                                            >
                                                                <ChevronUp size={16} />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => moveItem('exercises', index, 'down')}
                                                                disabled={index === treatmentPlan.exercises.length - 1}
                                                            >
                                                                <ChevronDown size={16} />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => deleteItem('exercises', index)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="empty-table-message">
                                                    No exercises added yet
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                
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
                                        placeholder={"Weight"}
                                        value={weight}
                                        onChange={e => setWeight(e.target.value)}
                                    />
                                    <Input 
                                        placeholder="Notes (optional)" 
                                        value={activityNotes} 
                                        onChange={e => setActivityNotes(e.target.value)} 
                                    />
                                    <Button onClick={addActivity} className="add-button">
                                        Add Exercise
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
        
                    </div>
        
                    <div className="submit-container">
                        <Button onClick={handleSubmit} className="submit-button">
                            Submit Treatment Plan
                        </Button>
                        <Button onClick={() => navigate('/browse-treatment-plans')} className="cancel-button">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    