import React, { useState, useEffect } from 'react';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onClick, targetId }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Add visibility after component mounts for animation purposes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to handle the click and scroll
  const handleViewRecipe = (event) => {
    // First call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
    
    // Then handle the scrolling
    if (targetId) {
      // Find the target element to scroll to
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Scroll the element into view with smooth behavior
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
    } else {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Format cooking time if available
  const formatCookingTime = (minutes) => {
    if (!minutes) return null;
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? 
        `${hours} hr ${remainingMinutes} min` : 
        `${hours} hr`;
    }
  };

  return (
    <div className={`recipe-card ${isVisible ? 'visible' : ''}`}>
      {recipe.image && (
        <div className="recipe-image-wrapper">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="recipe-card-image"
            loading="lazy"
          />
          {recipe.prepTime && (
            <div className="recipe-time-badge">
              <span className="time-icon">⏱</span> {formatCookingTime(recipe.prepTime)}
            </div>
          )}
        </div>
      )}
      
      <div className="recipe-card-content">
        <div className="recipe-info">
          <h3 className="recipe-title">{recipe.title}</h3>
          
          <div className="recipe-meta">
            {recipe.season && (
              <span className="recipe-season">{recipe.season}</span>
            )}
            {recipe.difficulty && (
              <span className={`recipe-difficulty ${recipe.difficulty.toLowerCase()}`}>
                {recipe.difficulty}
              </span>
            )}
          </div>
          
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}
          
          <div className="ingredients-preview">
            <h4 className="ingredients-heading">Ingredients:</h4>
            <div className="ingredient-list">
              {recipe.preview_ingredients && recipe.preview_ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-item">
                  <span className="ingredient-bullet">•</span> {ing}
                </div>
              ))}
              {recipe.preview_ingredients && recipe.preview_ingredients.length > 0 && (
                <div className="more-ingredients">and more...</div>
              )}
            </div>
          </div>
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="recipe-tags">
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="recipe-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={handleViewRecipe}
          className="view-recipe-btn"
          aria-label={`View recipe for ${recipe.title}`}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
};

// Default props
RecipeCard.defaultProps = {
  recipe: {
    title: "Recipe Title",
    preview_ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
  },
  onClick: () => {},
  targetId: null
};

export default RecipeCard;