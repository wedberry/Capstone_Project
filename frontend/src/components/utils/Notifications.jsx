import React from 'react'
import { Button } from '../ui/button'
import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import tractionLogo from '../../assets/tractionLogoWhite2.png'

const Notifications = () => {
  const navigate = useNavigate()
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
                        <h1>Notifications</h1>
                        <p>View your Notifications Here</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="home-button"
                        onClick={() => navigate("/coach/dashboard")}
                    >
                        <Home size={20} />
                        Home
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Notifications