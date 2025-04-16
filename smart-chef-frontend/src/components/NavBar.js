import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ setActiveSection }) => {
  const navigate = useNavigate();
  
  const handleNavigation = (route, section) => {
    if (setActiveSection && typeof setActiveSection === 'function') {
      setActiveSection(section);
    } else {
      navigate('/smartchef');
      localStorage.setItem('desiredSection', section);
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img 
          src="/images/logo.png" 
          alt="Smart Chef Logo" 
          className="navbar-logo" 
        />
        <span className="navbar-title">Smart Chef</span>
      </div>
      <div className="navbar-links">
        <button onClick={() => handleNavigation('/', 'home')}>Home</button>
        <button onClick={() => handleNavigation('/recommender', 'recommender')}>Recipe Recommender</button>
        <button onClick={() => handleNavigation('/random', 'random')}>Random Recipe</button>
        <button onClick={() => handleNavigation('/seasonal', 'seasonal')}>Seasonal Recipes</button>
        <button onClick={() => navigate('/profile')} className="profile-button">Profile</button>
      </div>
    </nav>
  );
};

export default NavBar;