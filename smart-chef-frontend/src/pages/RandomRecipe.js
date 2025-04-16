import React, { useState } from 'react';
import Card from '../components/ui/card';
import { RefreshCw } from 'lucide-react';

const RandomRecipe = ({ 
  setGeneratedRecipe, 
  API_BASE_URL, 
  persons, 
  setPersons, 
  language, 
  setLanguage 
}) => {
  const [randomLoading, setRandomLoading] = useState(false);
  const [randomError, setRandomError] = useState(null);
  const [lastRecipeId, setLastRecipeId] = useState(null); // Track last recipe to avoid duplicates

  const handleSurpriseMe = async () => {
    setRandomLoading(true);
    setRandomError(null);
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/api/random-recipe?persons=${persons || 2}&language=${language}&t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch random recipe');
      }

      const data = await response.json();

      // **🛠 Fix: Ensure the image URL is valid**
      const imageUrl = data.recipe.image || "/default-food.jpg"; // Use fallback image

      const formattedRecipe = {
        ...data.recipe,
        image: imageUrl, // Updated image handling
        id: `api-${timestamp}`
      };

      // **Avoid duplicate recipes**
      if (formattedRecipe.id !== lastRecipeId) {
        setLastRecipeId(formattedRecipe.id);
        setGeneratedRecipe(formattedRecipe);
      } else {
        handleSurpriseMe();
        return;
      }
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      setRandomError("❌ Unable to fetch a recipe. Please try again later!");
    }
    
    setRandomLoading(false);
  };

  return (
    <div className="random-recipe-section">
      <Card className="input-card">
        <h2 className="section-title">Get a Random Recipe</h2>
        <div className="center-content">
          <button 
            className="primary-button"
            onClick={handleSurpriseMe}
            disabled={randomLoading}
          >
            <RefreshCw size={18} className="mr-2" />
            {randomLoading ? 'Loading...' : 'Surprise Me'}
          </button>
        </div> 
      </Card>

      {randomError && <div className="error-message">{randomError}</div>}
    </div>
  );
};

export default RandomRecipe;
