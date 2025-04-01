import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { ClipboardList, ChevronRight, Activity, Search } from "lucide-react";
import { ChevronDown, Trash2, Pencil, Home } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import tractionLogo from "../../assets/tractionLogoWhite2.png";
import "./BrowseTreatmentPlan.css";

const BrowseTreatmentPlans = () => {
    const { assign, athlete_clerk_id } = useParams()
    const assigning = assign || "false"

    const { user } = useUser();
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    const editPlan = (id) => {
        navigate(`/edit-treatment-plan/${id}`);
    }

    const assignPlan = (plan_id, athlete_id) => {
        console.log("Assign plan ", plan_id, "to", athlete_id)
    }

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredPlans(treatmentPlans);
            return;
        }
        
        const lowercasedSearch = searchTerm.toLowerCase();
        const filtered = treatmentPlans.filter(plan => 
            plan.name.toLowerCase().includes(lowercasedSearch) || 
            plan.injury.toLowerCase().includes(lowercasedSearch) || 
            plan.trainer_name.toLowerCase().includes(lowercasedSearch)
        );
        
        setFilteredPlans(filtered);
    }, [searchTerm, treatmentPlans]);


    useEffect(() => {
        if (!user) return;

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

        fetchTreatmentPlans();
    }, [user, navigate]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Reset search
    const handleClearSearch = () => {
        setSearchTerm("");
    };



    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="browse-treatment-plans">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-logo">
                            <img src={tractionLogo} alt="Traction Logo" className="hero-logo-image" />
                        </div>
                        <div className="hero-text">
                            <h1>Browse Treatment Plans</h1>
                            <p>View and manage your treatment plans</p>
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

            <div className="treatment-plan-table">
                <div className="treatment-section">
                    <Card className="treatment-card">
                        <CardHeader>
                            <CardTitle>Treatment Plans</CardTitle>
                            <div className="search-container">
                                <div className="search-input-wrapper">
                                    <Search size={18} className="search-icon" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name, injury, or creator..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="search-input"
                                    />
                                    {searchTerm && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={handleClearSearch}
                                            className="clear-search-btn"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <br></br>
                            </div>
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
                                    {filteredPlans.length > 0 ? (
                                        filteredPlans.map((plan, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{plan.name}</TableCell>
                                                <TableCell>{plan.injury}</TableCell>
                                                <TableCell>{plan.trainer_name}</TableCell>
                                                <TableCell>
                                                    <div className="action-buttons">
                                                        <Button  
                                                            variant="ghost"
                                                            size="sm" 
                                                            onClick={() => editPlan(plan.id)}
                                                            title="Edit Plan"
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>

                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => assignPlan(plan.id, athlete_clerk_id)}
                                                            className="clear-search-btn"
                                                            disabled={assigning}
                                                            title="Assign to Athlete"
                                                        >
                                                            Clear
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="empty-table-message">
                                                {searchTerm ? "No matching treatment plans found" : "No treatments added yet"}
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
        </div>
    );
};

export default BrowseTreatmentPlans;