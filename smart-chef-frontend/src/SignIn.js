import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import { useAuth } from './AuthContext';
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


const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

    // Add basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and username in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        
        // Update auth context
        login({ username, token: data.token });

        // Redirect user after successful login
        navigate('/smartchef');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during sign-in. Please try again.');
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

        {/* Right side with sign in form */}
        <div className="auth-form-container">
          <div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span>Don't have an account? </span>
            <Link to="/signup">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;