import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { Button, Input } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { Calendar } from "../ui/calendar";
import "./CreateTreatmentPlan.css";

export default function TreatmentPlanForm() {
    const { user } = useUser();
    const defaultName = user ? `${user.firstName} ${user.lastName}` : ""; // Default trainer name
    const [trainer, setTrainer] = useState(defaultName);
    const [treatment_plan_name, setTreatmentPlanName] = useState("");
    const [injury, setInjury] = useState("");
    const [date, setDate] = useState(null);
    const [treatmentPlan, setTreatmentPlan] = useState({ exercises: {}, treatments: {} });
    const [activity, setActivity] = useState("");
    const [reps, setReps] = useState("");
    const [treatment, setTreatment] = useState("");
    const [time, setTime] = useState("");

    
    const addActivity = () => {
        if (activity && reps) {
          setTreatmentPlan(prev => ({
            ...prev,
            exercises: { ...prev.exercises, [activity]: reps },
          }));
          setActivity("");
          setReps("");
        }
      };

      const addTreatment = () => {
        if (treatment && time) {
          setTreatmentPlan(prev => ({
            ...prev,
            treatments: { ...prev.treatments, [treatment]: time },
          }));
          setTreatment("");
          setTime("");
        }
      };

      const handleSubmit = async () => {
        const data = {
            treatment_plan_name: treatment_plan_name,
            trainer_name: trainer,
            injury: injury,
            estimated_completion: date ? date.toISOString().split("T")[0] : null,
            detailed_plan: treatmentPlan,
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/trainers/save-treatment-plan/", data, {
              headers: { "Content-Type": "application/json" },
            });
            alert("Treatment Plan Created Successfully!");
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
                                onChange={(e) => setTrainer(e.target.value)}/>
                    </div>

                    <br></br>

        
                    <div className="form-group">
                        <label htmlFor="plan-name">Treatment Plan Name:</label>
                        <Input id="plan-name" placeholder="Treatment Plan Name" value={treatment_plan_name} onChange={e => setTreatmentPlanName(e.target.value)} />
                    </div>

                    <br></br>
        
                  <div className="form-group">
                    <label htmlFor="injury">Injury Treated:</label>
                    <Input id="injury" placeholder="Injury" value={injury} onChange={e => setInjury(e.target.value)} />
                  </div>

                  <br></br>
        
                  <div className="form-group">
                    <label>Estimated Date of Completion:</label>
                    <div className="calendar-wrapper">
                      <Calendar selected={date} onChange={setDate} />
                    </div>
                  </div>
                </CardContent>
              </Card>
        
              <div className="treatment-section">
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(treatmentPlan.exercises).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                        {Object.keys(treatmentPlan.exercises).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="empty-table-message">No exercises added yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    <div className="add-form">
                      <Input placeholder="Activity" value={activity} onChange={e => setActivity(e.target.value)} />
                      <Input placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} />
                      <Button onClick={addActivity} className="add-button">Add Exercise</Button>
                    </div>
                  </CardContent>
                </Card>
        
                <Card className="treatment-card">
                  <CardHeader>
                    <CardTitle>Treatments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table className="data-table">
                      <TableHead>
                        <TableRow>
                          <TableCell header={true}>Treatment</TableCell>
                          <TableCell header={true}>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(treatmentPlan.treatments).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                        {Object.keys(treatmentPlan.treatments).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="empty-table-message">No treatments added yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    <div className="add-form">
                      <Input placeholder="Treatment" value={treatment} onChange={e => setTreatment(e.target.value)} />
                      <Input placeholder="Time (e.g. 20 mins)" value={time} onChange={e => setTime(e.target.value)} />
                      <Button onClick={addTreatment} className="add-button">Add Treatment</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
        
              <div className="submit-container">
                <Button onClick={handleSubmit} className="submit-button">Submit Treatment Plan</Button>
              </div>
            </div>
          );
        }