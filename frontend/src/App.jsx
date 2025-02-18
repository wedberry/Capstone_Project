import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/auth/SignIn.jsx';
import AthleteHome from './components/dashboards/AthleteHome';
import TrainerHome from './components/dashboards/TrainerHome';
import CoachHome from './components/dashboards/CoachHome';
import './components/auth/SignIn.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/athlete/dashboard" element={<AthleteHome />} />
        <Route path="/trainer/dashboard" element={<TrainerHome />} />
        <Route path="/coach/dashboard" element={<CoachHome />} />
        <Route path="/" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App; 