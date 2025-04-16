import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import RecipeRecommender from './pages/RecipeRecommender';
import RandomRecipe from './pages/RandomRecipe';
import SeasonalRecipe from './pages/SeasonalRecipe';
import RecipeDisplay from './components/RecipeDisplay';
import './App.css';

const SmartChef = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [persons, setPersons] = useState('2');
  const [language, setLanguage] = useState('English');
  const [mealType, setMealType] = useState('Lunch or Dinner');
  const [seasonalRecipes, setSeasonalRecipes] = useState({
    winter: [],
    summer: []
  });
  const [recommendations, setRecommendations] = useState([]);
  const [showRecipePopup, setShowRecipePopup] = useState(false);

  // Define API base URL
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchSeasonalRecipes();
    fetchRecommendations();
    
    // Check if there's a desired section in localStorage (set from NavBar in ProfilePage)
    const desiredSection = localStorage.getItem('desiredSection');
    if (desiredSection) {
      setActiveSection(desiredSection);
      // Clear it after using it
      localStorage.removeItem('desiredSection');
    }
  }, []);

  // Handle section change and hide recipe popup
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setShowRecipePopup(false);
  };
  
  // Modified function to be passed to child components
  const handleSetGeneratedRecipe = (recipe) => {
    setGeneratedRecipe(recipe);
    setShowRecipePopup(true);
  };

  const closeRecipePopup = () => {
    setShowRecipePopup(false);
  };

  const fetchSeasonalRecipes = async () => {
    try {
      const [winterResponse, summerResponse] = await Promise.all([
        fetch(
          'https://api.spoonacular.com/recipes/random?number=4&tags=winter',
          { headers: { 'Authorization': 'beed3ff3f8d341a4a1d5df8de7039504' } }
        ),
        fetch(
          'https://api.spoonacular.com/recipes/random?number=4&tags=summer',
          { headers: { 'Authorization': 'beed3ff3f8d341a4a1d5df8de7039504' } }
        )
      ]);

      const winterData = await winterResponse.json();
      const summerData = await summerResponse.json();
      
      setSeasonalRecipes({
        winter: winterData.recipes || [],
        summer: summerData.recipes || []
      });
    } catch (error) {
      console.error('Error fetching seasonal recipes:', error);
      setSeasonalRecipes({ winter: [], summer: [] });
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        'https://api.spoonacular.com/recipes/random?number=4',
        { headers: { 'Authorization': 'beed3ff3f8d341a4a1d5df8de7039504' } }
      );
      const data = await response.json();
      setRecommendations(data.recipes || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    }
  };

  // Shared state and props to pass to child components
  const sharedProps = {
    setGeneratedRecipe: handleSetGeneratedRecipe,
    API_BASE_URL,
    persons,
    setPersons,
    language,
    setLanguage,
    mealType,
    setMealType
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar setActiveSection={handleSectionChange} />
      <div className="main-container">
        <h1 className="section-title">Smart Chef</h1>
        
        {activeSection === 'home' && <HomePage {...sharedProps} />}
        {activeSection === 'recommender' && <RecipeRecommender {...sharedProps} />}
        {activeSection === 'random' && <RandomRecipe {...sharedProps} />}
        {activeSection === 'seasonal' && (
          <SeasonalRecipe 
            {...sharedProps} 
            seasonalRecipes={seasonalRecipes} 
          />
        )}
      
        {/* Recipe Display Popup */}
        {showRecipePopup && generatedRecipe && (
          <div className="recipe-popup-overlay">
            <div className="recipe-popup-container">
              <button 
                className="close-popup-button" 
                onClick={closeRecipePopup}
              >
                ×
              </button>
              <RecipeDisplay recipe={generatedRecipe} language={language} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartChef;