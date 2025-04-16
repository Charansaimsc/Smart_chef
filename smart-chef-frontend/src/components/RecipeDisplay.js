import React, { useState, useEffect } from 'react';
import './RecipeDisplay.css';
import { useAuth } from '../AuthContext';

// UI translations with consistent formatting and improved readability
const translations = {
  english: {
    ingredients: "Ingredients",
    cookingInstructions: "Cooking Instructions",
    fullRecipeDetails: "Full Recipe Details",
    noIngredientsAvailable: "No ingredients information available.",
    noCookingInstructions: "No cooking instructions available.",
    listen: "Listen",
    translating: "Translating...",
    translationFailed: "Translation failed. Using original content.",
    loading: "Loading recipe...",
    error: "Error loading recipe. Please try again.",
    addToFavorites: "Add to Favorites",
    addedToFavorites: "Added to Favorites",
    favoritesError: "Error adding to favorites",
    step: "Step"
  },
  telugu: {
    ingredients: "పదార్థాలు",
    cookingInstructions: "వంట సూచనలు",
    fullRecipeDetails: "పూర్తి రెసిపీ వివరాలు",
    noIngredientsAvailable: "పదార్థాల సమాచారం అందుబాటులో లేదు.",
    noCookingInstructions: "వంట సూచనలు అందుబాటులో లేవు.",
    listen: "వినండి",
    translating: "అనువదిస్తోంది...",
    translationFailed: "అనువాదం విఫలమైంది. అసలు కంటెంట్‌ని ఉపయోగిస్తోంది.",
    loading: "రెసిపీని లోడ్ చేస్తోంది...",
    error: "రెసిపీని లోడ్ చేయడంలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.",
    addToFavorites: "ఇష్టమైనవిగా జోడించండి",
    addedToFavorites: "ఇష్టమైనవిగా జోడించబడింది",
    favoritesError: "ఇష్టమైనవిగా జోడించడంలో లోపం",
    step: "దశ"
  },
  hindi: {
    ingredients: "सामग्री",
    cookingInstructions: "पकाने के निर्देश",
    fullRecipeDetails: "पूरी रेसिपी विवरण",
    noIngredientsAvailable: "सामग्री की जानकारी उपलब्ध नहीं है।",
    noCookingInstructions: "कोई पकाने के निर्देश उपलब्ध नहीं हैं।",
    listen: "सुनो",
    translating: "अनुवाद कर रहा है...",
    translationFailed: "अनुवाद विफल। मूल सामग्री का उपयोग करना।",
    loading: "रेसिपी लोड हो रही है...",
    error: "रेसिपी लोड करने में त्रुटि। कृपया पुनः प्रयास करें।",
    addToFavorites: "पसंदीदा में जोड़ें",
    addedToFavorites: "पसंदीदा में जोड़ा गया",
    favoritesError: "पसंदीदा में जोड़ने में त्रुटि",
    step: "चरण"
  }
};

// Language codes for Google Translate
const languageCodes = {
  english: 'en',
  telugu: 'te',
  hindi: 'hi'
};

const RecipeDisplay = ({ recipe, initialLanguage = 'english' }) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [translatedRecipe, setTranslatedRecipe] = useState(null);
  const [originalRecipe, setOriginalRecipe] = useState(null); // Store original recipe data
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFavoriteSuccess, setShowFavoriteSuccess] = useState(false);
  const [showFavoriteError, setShowFavoriteError] = useState(false);
  
  const authContext = useAuth();
  const { user, token } = authContext || {}; // Add fallback for when authContext is null
  
  // Initialize with a safe empty recipe if needed
  useEffect(() => {
    if (!recipe) {
      setError(true);
      setIsLoading(false);
      return;
    }
    
    // Create a safe recipe object with defaults for missing fields
    const safeRecipe = {
      title: recipe.title || 'Untitled Recipe',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || '',
      image: recipe.image || '',
      full_text: recipe.full_text || '',
      ...recipe
    };
    
    setOriginalRecipe(safeRecipe); // Store the original (English) recipe
    setTranslatedRecipe(safeRecipe);
    setIsLoading(false);

    // Check if recipe is already favorited
    checkIfFavorited(recipe._id || recipe.id);
  }, [recipe]);
  
  // Check if recipe is already in favorites
  const checkIfFavorited = async (recipeId) => {
    try {
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        return;
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/recipes/favorites/check/${recipeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };
  
  // Alternative translation function using fetch to unofficial API
  const translateWithUnofficialAPI = async (text, targetLanguage) => {
    if (!text) return '';
    
    try {
      // Always translate from English (source language) to target language
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${languageCodes[targetLanguage]}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      // Extract translated text from response
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach(item => {
          if (item[0]) translatedText += item[0];
        });
      }
      
      return translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  };
  
  // Translate array of texts
  const translateArray = async (items, targetLanguage) => {
    if (!items || !items.length) return [];
    
    try {
      const translatedItems = await Promise.all(
        items.map(item => translateWithUnofficialAPI(item, targetLanguage))
      );
      return translatedItems;
    } catch (error) {
      console.error('Error translating array:', error);
      return items || [];
    }
  };

  // Reset image error when recipe changes
  useEffect(() => {
    if (recipe) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [recipe]);

  // Update translations when language changes
  useEffect(() => {
    const translateRecipe = async () => {
      if (!originalRecipe || !originalRecipe.title) {
        return; // Skip translation if recipe data is incomplete
      }
      
      // If English is selected, use the original recipe
      if (language === 'english') {
        // Clean the full_text even for English display
        let cleanedFullText = cleanFullText(originalRecipe.full_text);
        setTranslatedRecipe({
          ...originalRecipe,
          full_text: cleanedFullText
        });
        setIsTranslating(false);
        setTranslationError(false);
        return;
      }
      
      setIsTranslating(true);
      setTranslationError(false);
      
      try {
        // Prepare ingredients array with safety checks
        let ingredientsArray = [];
        
        if (Array.isArray(originalRecipe.ingredients)) {
          ingredientsArray = originalRecipe.ingredients;
        } else if (originalRecipe.ingredients && typeof originalRecipe.ingredients === 'string') {
          ingredientsArray = originalRecipe.ingredients.split(',').map(item => item.trim());
        }
        
        // First clean the full_text
        let cleanedFullText = cleanFullText(originalRecipe.full_text);
        
        // Translate all parts of the recipe from the original (English) version
        const [translatedTitle, translatedInstructions, translatedIngredients, translatedFullText] = await Promise.all([
          translateWithUnofficialAPI(originalRecipe.title, language),
          originalRecipe.instructions ? translateWithUnofficialAPI(originalRecipe.instructions, language) : '',
          translateArray(ingredientsArray, language),
          cleanedFullText ? translateWithUnofficialAPI(cleanedFullText, language) : ''
        ]);
        
        setTranslatedRecipe({
          ...originalRecipe,
          title: translatedTitle,
          instructions: translatedInstructions,
          ingredients: translatedIngredients,
          full_text: translatedFullText
        });
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original recipe if translation fails
        setTranslatedRecipe(originalRecipe);
        setTranslationError(true);
      } finally {
        setIsTranslating(false);
      }
    };
    
    translateRecipe();
  }, [language, originalRecipe]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleAddToFavorites = async () => {
    try {
      // Use token from context or localStorage
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        alert('Please log in to save favorites');
        return;
      }
      
      // Prepare recipe data for saving
      const recipeToSave = {
        recipeId: recipe._id || recipe.id || Date.now().toString(),
        title: translatedRecipe?.title,
        ingredients: translatedRecipe?.ingredients,
        instructions: translatedRecipe?.instructions,
        image: translatedRecipe?.image,
        full_text: translatedRecipe?.full_text,
        savedAt: new Date().toISOString()
      };
      
      // Check if the API endpoint is correct
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/recipes/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(recipeToSave)
      });
      
      if (response.status === 401 || response.status === 400) {
        // Token might be expired or invalid - get detailed error
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.message && errorData.message.includes('expired')) {
          // Token has expired - clear storage and redirect to login
          localStorage.removeItem('token');
          alert('Your session has expired. Please log in again.');
          return;
        }
        
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add to favorites');
      }
      
      // Success!
      setIsFavorited(true);
      setShowFavoriteSuccess(true);
      setTimeout(() => setShowFavoriteSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setShowFavoriteError(true);
      setTimeout(() => setShowFavoriteError(false), 3000);
    }
  };

  // Early return for loading or error states
  if (isLoading) {
    return (
      <div className="recipe-display loading-state">
        <p>{translations[language]?.loading || "Loading recipe..."}</p>
      </div>
    );
  }
  
  if (error || !translatedRecipe) {
    return (
      <div className="recipe-display error-state">
        <p>{translations[language]?.error || "Error loading recipe. Please try again."}</p>
      </div>
    );
  }

  // Ensure ingredients is always an array with proper fallbacks
  const ingredients = Array.isArray(translatedRecipe.ingredients) 
    ? translatedRecipe.ingredients 
    : translatedRecipe.ingredients && typeof translatedRecipe.ingredients === 'string'
      ? translatedRecipe.ingredients.split(',').map(item => item.trim()) 
      : [];

  // Parse instructions into single-line steps
// Improve the parseInstructions function to filter out empty or numbered-only steps
const parseInstructions = (instructions) => {
  if (!instructions) return [];
  
  // First try to split by line breaks
  let steps = instructions.split(/\n+/).filter(step => step.trim().length > 0);
  
  // If that doesn't give us multiple steps, try splitting by periods
  if (steps.length <= 1) {
    steps = instructions
      .split(/\.\s+/)
      .map(step => step.trim())
      .filter(step => step.length > 0);
  }
  
  // Filter out steps that are just numbers or empty
  steps = steps.filter(step => {
    const trimmed = step.trim();
    // Remove steps that are just a number followed by a period (like "1.")
    if (/^\d+\.$/.test(trimmed)) return false;
    // Remove steps that are just a number (like "1")
    if (/^\d+$/.test(trimmed)) return false;
    // Keep only steps with actual content
    return trimmed.length > 0;
  });
  
  // Add missing periods and ensure each step is a single sentence
  return steps.map(step => {
    // Remove any line breaks within a step
    const cleanStep = step.replace(/\n/g, ' ').trim();
    
    // Add period if missing
    if (!/[.!?]$/.test(cleanStep)) {
      return cleanStep + '.';
    }
    return cleanStep;
  });
};


  // Add this function to clean up full_text
const cleanFullText = (text) => {
  if (!text) return '';
  
  // Remove anything before "TITLE:" if it exists
  const titleMatch = text.match(/TITLE:.*$/s);
  if (titleMatch) {
    return titleMatch[0];
  }
  
  return text;
};

  const instructionSteps = parseInstructions(translatedRecipe.instructions);

  // Use a more reliable image loading approach
  const determineImageSource = () => {
    if (imageError || !translatedRecipe.image) {
      // Return a placeholder image if there's an error or no image
      return 'https://via.placeholder.com/400x300?text=Recipe+Image';
    }
    return translatedRecipe.image;
  };

  // Determine if we should show the no-image class
  const recipeDisplayClass = `recipe-display${!translatedRecipe.image ? ' no-image' : ''}`;

  return (
    <div className={recipeDisplayClass}>
      <div className="recipe-header">
        <h1 className="recipe-title">{translatedRecipe.title || "Untitled Recipe"}</h1>
        <div className="recipe-controls">
          <select
            className="language-selector"
            value={language}
            onChange={handleLanguageChange}
            disabled={isTranslating}
            aria-label="Select language"
          >
            <option value="english">English</option>
            <option value="telugu">తెలుగు</option>
            <option value="hindi">हिंदी</option>
          </select>
          
          <button 
            className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
            onClick={handleAddToFavorites}
            disabled={isFavorited}
            aria-label={isFavorited ? "Recipe added to favorites" : "Add recipe to favorites"}
          >
            <span className="heart-icon">♥</span>
            {isFavorited 
              ? translations[language]?.addedToFavorites || "Added to Favorites"
              : translations[language]?.addToFavorites || "Add to Favorites"}
          </button>
        </div>
      </div>
      
      {showFavoriteSuccess && (
        <div className="success-message" role="alert">
          {translations[language]?.addedToFavorites || "Added to Favorites"}
        </div>
      )}
      
      {showFavoriteError && (
        <div className="error-message" role="alert">
          {translations[language]?.favoritesError || "Error adding to favorites"}
        </div>
      )}
      
      {isTranslating && (
        <div className="loading-indicator" aria-live="polite">
          <p>{translations[language]?.translating || "Translating..."}</p>
        </div>
      )}
      
      {translationError && (
        <div className="translation-alert" role="alert">
          {translations[language]?.translationFailed || "Translation failed. Using original content."}
        </div>
      )}
      
      {translatedRecipe.image && (
        <div className={`recipe-image-container ${imageLoaded ? 'loaded' : ''}`}>
          {!imageLoaded && !imageError && (
            <div className="image-loading" aria-hidden="true">
              <div className="spinner"></div>
            </div>
          )}
          <img
            src={determineImageSource()}
            alt={translatedRecipe.title}
            className="recipe-image"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
      )}
      
      <div className="recipe-content">
        <div className="recipe-column">
          <h2 className="section-title">{translations[language]?.ingredients || "Ingredients"}</h2>
          {ingredients.length > 0 ? (
            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item animated-item">
                  <span className="ingredient-text">{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-section-message">
              {translations[language]?.noIngredientsAvailable || "No ingredients information available."}
            </div>
          )}
        </div>
        
        <div className="recipe-column">
          <h2 className="section-title">{translations[language]?.cookingInstructions || "Cooking Instructions"}</h2>
          {instructionSteps.length > 0 ? (
            <ol className="instructions-list">
              {instructionSteps.map((step, index) => (
                <li key={index} className="instruction-step animated-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-text">{step}</div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-section-message">
              {translations[language]?.noCookingInstructions || "No cooking instructions available."}
            </div>
          )}
        </div>
      </div>
      
      {translatedRecipe.full_text && (
        <div className="full-recipe-details">
          <h2 className="section-title">{translations[language]?.fullRecipeDetails || "Full Recipe Details"}</h2>
          <div className="full-text-content">
            {translatedRecipe.full_text}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplay;