import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import './auth.css'; // Import our new CSS file

// Array of food images for the carousel
const carouselImages = [
  '/images/c1.jpg',
  '/images/c2.jpg',
  '/images/c3.jpg',
  '/images/c4.jpg'
];

// Array of captions for each slide
const carouselContent = [
  {
    title: "Recipe Generator",
    description: "Create unique recipes based on your chosen ingredients. Just enter what you have, and get a custom recipe instantly!"
  },
  {
    title: "Recipe Recommender",
    description: "Get personalized recipe suggestions based on your taste and dietary preferences. Discover your next favorite dish!"
  },
  {
    title: "Random Recipe",
    description: "Feeling adventurous? Get a completely random recipe and try something new today!"
  },
  {
    title: "Seasonal Recipe",
    description: "Cook with fresh, seasonal ingredients. Find the perfect recipe for any time of the year!"
  }
];


const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        setFadeIn(true);
      }, 500);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle manual dot click
  const handleDotClick = (index) => {
    if (index !== currentSlide) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide(index);
        setFadeIn(true);
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.status === 201) {
        // Show success message and redirect to sign in
        navigate('/signin');
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      setError('An error occurred during sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-layout">
        {/* Left side with food image carousel */}
        <div 
          className={`auth-image ${fadeIn ? 'fade-in' : ''}`}
          style={{ backgroundImage: `url(${carouselImages[currentSlide]})` }}
        >
          <div className="auth-image-content">
            <h2 className="auth-image-title">{carouselContent[currentSlide].title}</h2>
            <p className="auth-image-description">{carouselContent[currentSlide].description}</p>
            <div className="carousel-dots">
              {carouselImages.map((_, index) => (
                <div 
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side with sign up form */}
        <div className="auth-form-container">
          <div>
            <h1 className="auth-title">Create Your Account</h1>
            <p className="text-sm text-gray-600">Join Smart Chef today</p>
          </div>

          {error && (
            <div className="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span>Already have an account? </span>
            <Link to="/signin">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;