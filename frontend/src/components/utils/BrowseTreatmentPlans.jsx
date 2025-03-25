import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { ClipboardList, ChevronRight, Activity } from "lucide-react";
import { ChevronDown, Trash2, Pencil, Home } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import "./BrowseTreatmentPlan.css";

const BrowseTreatmentPlans = () => {
    const { user } = useUser();
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    const editPlan = (id) => {
        console.log(id);
        navigate(`/edit-treatment-plan/${id}`);
    }
    useEffect(() => {
        if (!user) return;

    const fetchTreatmentPlans = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/trainers/get-treatment-plans`);
            const data = await response.json();
            setTreatmentPlans(data.treatmentPlans);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching treatment plans:", error);
            setIsLoading(false);
        }
        };

fetchTreatmentPlans();
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
    <div className="treatment-plan-table">
        <Button  
            variant="ghost"
            size="sm" 
            onClick={() => navigate('/trainer/dashboard')}
        >
            <Home size={16} />
        </Button>
        <h2>Browse Treatment Plans</h2>


        <div className="treatment-section">
                <Card className="treatment-card">
                        <CardHeader>
                            <CardTitle>Treatment Plans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="data-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell header={true}>Name</TableCell>
                                        <TableCell header={true}>Injury</TableCell>
                                        <TableCell header={true}>Created By</TableCell>
                                        <TableCell header={true}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {treatmentPlans.length > 0 ? (
                                        treatmentPlans.map((plan, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{plan.name}</TableCell>
                                                <TableCell>{plan.injury}</TableCell>
                                                <TableCell>{plan.trainer_name}</TableCell>
                                                <TableCell>
                                                    <div className = "action-buttons">
                                                        <Button  
                                                            variant="ghost"
                                                            size="sm" 
                                                            onClick={() => editPlan(plan.id)}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>
                                                        {/* <Button 
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
                                                        </Button> */}
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
                            
                        <div className="submit-container">
                            <Button onClick={() => navigate("/create-treatment-plan")} className="submit-button">
                                Create New Treatment Plan
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
    
                </div>

    </div>
  );
};

export default BrowseTreatmentPlans;