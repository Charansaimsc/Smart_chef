import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// API Configuration
const API_KEY = 'beed3ff3f8d341a4a1d5df8de7039504';
const API_BASE_URL = 'https://api.spoonacular.com/recipes';

// API Service
export const recipeService = {
  async fetchSeasonalRecipes() {
    try {
      const [winterResponse, summerResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/random?number=4&tags=winter`, {
          headers: { 'Authorization': API_KEY }
        }),
        fetch(`${API_BASE_URL}/random?number=4&tags=summer`, {
          headers: { 'Authorization': API_KEY }
        })
      ]);

      const winterData = await winterResponse.json();
      const summerData = await summerResponse.json();

      return {
        winter: winterData.recipes,
        summer: summerData.recipes
      };
    } catch (error) {
      console.error('Error fetching seasonal recipes:', error);
      return { winter: [], summer: [] };
    }
  },

  async fetchRecommendations() {
    try {
      const response = await fetch(`${API_BASE_URL}/random?number=4`, {
        headers: { 'Authorization': API_KEY }
      });
      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },

  async generateRecipe(ingredients, persons, language, mealType) {
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          persons,
          language,
          mealType
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  },

  async getRandomRecipe() {
    try {
      const response = await fetch(`${API_BASE_URL}/random?number=1`, {
        headers: { 'Authorization': API_KEY }
      });
      const data = await response.json();
      return data.recipes[0];
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      throw error;
    }
  }
};

// Form Validation
export const validateForm = {
  ingredients(value) {
    const ingredients = value.split(',').map(i => i.trim()).filter(i => i);
    return ingredients.length >= 3;
  },

  persons(value) {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 12;
  }
};

// Image Upload Handler
export const handleImageUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
