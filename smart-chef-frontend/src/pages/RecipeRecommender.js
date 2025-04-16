import React, { useState } from 'react';
import Card from '../components/ui/card';
import RecipeCard from '../components/RecipeCard';

const RecipeRecommender = ({ 
  setGeneratedRecipe, 
  API_BASE_URL, 
  persons, 
  setPersons, 
  language, 
  setLanguage, 
  mealType, 
  setMealType 
}) => {
  const [recommendIngredients, setRecommendIngredients] = useState('');
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState(null);
  const [recipeCards, setRecipeCards] = useState([]);
  const [showCards, setShowCards] = useState(false);

  const handleRecommendRecipes = async () => {
    if (!recommendIngredients) {
      setRecommendError('Please enter at least one ingredient');
      return;
    }
    
    setRecommendLoading(true);
    setRecommendError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: recommendIngredients,
          persons: parseInt(persons) || 2,
          language: language,
          mealType,
          count: 4 // Request 4 recipes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recommend recipes');
      }
      
      const data = await response.json();
      
      // Process recipes to ensure they have preview_ingredients
      const processedRecipes = data.recipes.map(recipe => {
        // Make sure each recipe has preview_ingredients
        if (!recipe.preview_ingredients) {
          const ingredients = Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : (typeof recipe.ingredients === 'string' 
              ? recipe.ingredients.split(',').map(i => i.trim()) 
              : []);
          
          recipe.preview_ingredients = ingredients.slice(0, 3);
        }
        return recipe;
      });
      
      setRecipeCards(processedRecipes);
      setShowCards(true);
    } catch (error) {
      console.error('Error recommending recipes:', error);
      setRecommendError(error.message);
    }
    
    setRecommendLoading(false);
  };

  const handleViewRecipe = (recipe) => {
    setGeneratedRecipe(recipe);
  };

  return (
    <div className="recommender-section">
      <Card className="input-card">
        <h2 className="section-title">Enter ingredients to recommend recipes</h2>
        
        <div className="input-with-controls">
          <input
            type="text"
            placeholder="Enter ingredients (e.g., potato, cheese, butter)"
            className="input-field"
            value={recommendIngredients}
            onChange={(e) => setRecommendIngredients(e.target.value)}
          />
        </div>
      </Card>
      
      <div className="center-content">
        <button 
          className="primary-button"
          onClick={handleRecommendRecipes}
          disabled={recommendLoading}
        >
          {recommendLoading ? 'Finding Recipes...' : 'Find Recipes'}
        </button>
      </div>
      
      {recommendError && (
        <div className="error-message">
          {recommendError}
        </div>
      )}

      {showCards && recipeCards.length > 0 && (
        <div className="season-container">
          <h3 className="recommendations-title">Recommended Recipes</h3>
          <div className="recipe-grid">
            {recipeCards.map((recipe, index) => (
              <RecipeCard 
                key={index}
                recipe={recipe}
                onClick={() => handleViewRecipe(recipe)}
                targetId="recipe-display-section"
              />
            ))}
          </div>
        </div>
      )}
      
      {recommendLoading && (
        <div className="loading-spinner">
          Finding the perfect recipes for you...
        </div>
      )}
    </div>
  );
};

export default RecipeRecommender;