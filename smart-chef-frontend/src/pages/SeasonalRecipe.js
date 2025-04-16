import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import '../components/RecipeCard.css';
import '../components/RecipeDisplay.css';

const SeasonalRecipe = ({ setGeneratedRecipe }) => {
  const [seasonalRecipes, setSeasonalRecipes] = useState({
    summer: [],
    rainy: [],
    winter: []
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Custom CSS for the refresh button
  const refreshButtonStyle = {
    background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };
  
  const refreshButtonHoverStyle = {
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  };
  
  // State to track hover
  const [isHovered, setIsHovered] = useState(false);
  
  // Fetch seasonal recipes when component mounts or when refresh is triggered
  useEffect(() => {
    fetchSeasonalRecipes();
  }, [retryCount]);
  
  const fetchSeasonalRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = 'http://localhost:5000/api/seasonal-recipes';
      console.log(`Attempting to fetch recipes from: ${apiUrl}`);
      
      // Set timeout to handle connection issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`API Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response data received:", data);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from API');
      }
      
      setSeasonalRecipes({
        summer: Array.isArray(data.summer) ? data.summer : [],
        rainy: Array.isArray(data.rainy) ? data.rainy : [],
        winter: Array.isArray(data.winter) ? data.winter : []
      });
    } catch (error) {
      console.error('Error fetching seasonal recipes:', error);
      let errorMessage = 'Failed to load recipes. Please try again later.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The server may be down or unreachable.';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check if the backend server is running.';
      }
      
      setError(errorMessage);
      // Set empty arrays as fallback
      setSeasonalRecipes({
        summer: [],
        rainy: [],
        winter: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    
    // Format the recipe to match our expected format for the parent component
    const formattedRecipe = {
      title: recipe.title,
      ingredients: recipe.extendedIngredients ? 
        recipe.extendedIngredients.map(ing => ing.name.trim()) : 
        recipe.preview_ingredients || [],
      instructions: recipe.instructions || "Instructions not available.",
      image: recipe.image || "",
      season: recipe.season || ""
    };
    
    setGeneratedRecipe(formattedRecipe);
  };

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };
  
  // Function to handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    setRetryCount(prevCount => prevCount + 1);
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          onClick={handleRetry} 
          className="retry-button mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Retry
        </button>
        <div className="troubleshooting-tips mt-4">
          <h3>Troubleshooting Tips:</h3>
          <ul>
            <li>Make sure the Flask backend server is running</li>
            <li>Check if the CSV file exists at the specified location</li>
            <li>Verify there are no firewall or network issues</li>
          </ul>
        </div>
      </div>
    );
  }

  // Define the order of seasons to display
  const seasonOrder = ['summer', 'rainy', 'winter'];

  return (
    <div className="seasonal-section">
      <div className="flex items-center mb-4">
      <button 
          onClick={handleRefresh} 
          className="view-recipe-btn mt-4 px-6 py-2"
          style={{ width: '200px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Recipes'}
        </button>
        <h2 className="section-title ml-4">Seasonal Recipes</h2>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading recipes...</div>
      ) : (
        seasonOrder.map(season => (
          seasonalRecipes[season] && seasonalRecipes[season].length > 0 && (
            <div key={season} className="season-container mb-8">
              <h2 className="recommendations-title capitalize">{season} Recipes</h2>
              <div className="recipe-grid">
                {seasonalRecipes[season].map((recipe, idx) => (
                  <RecipeCard 
                    key={`${season}-${idx}`} 
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                ))}
              </div>
            </div>
          )
        ))
      )}
      
      <div className="note mt-4">
        <p className="text-center">
          Note: Select a seasonal recipe to view its details. Click the Refresh button to load new recipes.
        </p>
      </div>
    </div>
  );
};

export default SeasonalRecipe;