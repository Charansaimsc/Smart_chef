import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder';
import Card from '../components/ui/card';
import RecipeDisplay from '../components/RecipeDisplay'; // Adjust path as needed

const HomePage = () => {
  const [ingredients, setIngredients] = useState('');
  const [persons, setPersons] = useState('2');
  const [language, setLanguage] = useState('English');
  const [mealType, setMealType] = useState('Lunch or Dinner');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  const handleGenerateRecipe = async () => {
    if (!ingredients || ingredients.split(',').length < 3) {
      setError("Please provide at least 3 ingredients");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          persons: parseInt(persons) || 2,
          language,
          mealType
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }
      
      const data = await response.json();
      setGeneratedRecipe(data.recipe);
    } catch (error) {
      console.error('Error generating recipe:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleAudioCaptured = async (audioBlob) => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process speech');
      }
      
      const data = await response.json();
      if (data.text) {
        setSpeechText(data.text);
        setIngredients(data.text);
      } else {
        setError('No text was recognized. Please try speaking again.');
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  // Array of PNG image paths (replace with your actual image paths)
  
  const floatingImages = Array.from({ length: 20 }, (_, i) => `/images/${i + 1}.png`);


  return (
    <div className="min-h-screen bg-black">
      {/* Embedded CSS for floating images */}
      <style>{`
        .floating-images {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0; /* Behind the main content */
          pointer-events: none; /* Allows clicking through the images */
          overflow: hidden;
        }

        .floating-image {
          position: absolute;
          width: 100px; /* Adjust size as needed */
          height: auto;
          animation: floatUp 10s infinite linear;
          opacity: 0.7; /* Slight transparency */
        }

        @keyframes floatUp {
          0% {
            bottom: -100px; /* Start below the screen */
            transform: translateX(0);
          }
          100% {
            bottom: 100%; /* Move above the screen */
            transform: translateX(20px); /* Optional slight horizontal drift */
          }
        }
      `}</style>

      {/* Floating Images Background */}
      {/* <div className="floating-images">
        {floatingImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`floating-${index}`}
            className="floating-image"
            style={{
              left: `${Math.random() * 90}%`, // Random horizontal position
              animationDelay: `${index * 2}s`, // Staggered start times
            }}
          />
        ))}
      </div> */}

      {/* Original Content */}
      <div className="pt-8 pb-4 text-center">
        <h1 className="text-4xl font-bold text-white">Welcome to Recipe Generator</h1>
        <p className="text-xl text-gray-300 mt-2">Create delicious meals with ingredients you have on hand</p>
      </div>
      
      <div className="main-container">
        <div className="home-section">
          <Card className="input-card">
            <div className="card-content">
              <h2 className="section-title text-2xl font-bold mb-4">Enter Your Ingredients</h2>
              
              <div className="input-group mb-4">
                <label className="block text-white text-lg font-medium mb-2">Enter Ingredients</label>
                <div className="input-with-controls">
                  <input
                    type="text"
                    placeholder="Enter ingredients (e.g., chicken, rice, onion)"
                    className="input-field"
                    value={ingredients}
                    onChange={(e) => {
                      setIngredients(e.target.value);
                    }}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  
                </div>
                <p className="text-sm text-gray-300 mt-1">Minimum 3 ingredients required, separated by commas</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white text-lg font-medium mb-2">Number of Servings</label>
                  <input
                    type="number"
                    placeholder="For how many persons"
                    className="input-field"
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                    min="1"
                  />
                </div>
                
                
              </div>

              <div>
                <label className="block text-white text-lg font-medium mb-2">Meal Type</label>
                <div className="type-buttons">
                  <button 
                    className={`primary-button ${mealType === 'Dessert' ? 'selected' : ''}`}
                    onClick={() => setMealType('Dessert')}
                  >
                    Dessert
                  </button>
                  <button 
                    className={`primary-button ${mealType === 'Breakfast' ? 'selected' : ''}`}
                    onClick={() => setMealType('Breakfast')}
                  >
                    Breakfast
                  </button>
                  <button 
                    className={`primary-button ${mealType === 'Lunch or Dinner' ? 'selected' : ''}`}
                    onClick={() => setMealType('Lunch or Dinner')}
                  >
                    Lunch or Dinner
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div className="center-content">
            <button 
              className="primary-button text-lg font-bold py-3 px-6"
              onClick={handleGenerateRecipe}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate a Recipe'}
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {speechText && (
            <div className="speech-text-display">
              <p>Speech recognized: "{speechText}"</p>
            </div>
          )}
        </div>

        {generatedRecipe && (
          <div className="recipe-result">
            <RecipeDisplay recipe={generatedRecipe} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;