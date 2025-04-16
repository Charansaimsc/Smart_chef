// src/services/recipeService.js
import { google } from 'google-translate-api';

class RecipeService {
  constructor() {
    this.MISTRAL_ENDPOINT = 'http://localhost:8000/generate'; // Adjust based on your local Mistral setup
  }

  generatePrompt(ingredients, persons, mealType) {
    return `Generate a recipe with the following requirements:
Ingredients: ${ingredients}
Number of persons: ${persons}
Meal type: ${mealType}

Please provide the recipe in the following format:
Title:
Description:
Ingredients (with quantities for ${persons} persons):
Instructions (step by step):`;
  }

  async translateText(text, targetLanguage) {
    try {
      if (targetLanguage === 'English') return text;
      
      const result = await google.translate(text, { to: this.getLanguageCode(targetLanguage) });
      return result.text;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate recipe');
    }
  }

  getLanguageCode(language) {
    const languageCodes = {
      'English': 'en',
      'Telugu': 'te',
      'Hindi': 'hi'
    };
    return languageCodes[language] || 'en';
  }

  async generateRecipe(ingredients, persons, mealType, language) {
    try {
      // Generate recipe with Mistral
      const prompt = this.generatePrompt(ingredients, persons, mealType);
      const response = await fetch(this.MISTRAL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const recipeText = await response.json();
      
      // Parse the generated recipe text into structured format
      const recipe = this.parseRecipeText(recipeText.generated_text);

      // Translate each part of the recipe if language is not English
      if (language !== 'English') {
        recipe.title = await this.translateText(recipe.title, language);
        recipe.description = await this.translateText(recipe.description, language);
        recipe.ingredients = await Promise.all(
          recipe.ingredients.map(ingredient => this.translateText(ingredient, language))
        );
        recipe.instructions = await this.translateText(recipe.instructions, language);
      }

      return recipe;
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw error;
    }
  }

  parseRecipeText(text) {
    // Basic parsing of Mistral's output into structured format
    const sections = text.split('\n\n');
    const recipe = {
      title: '',
      description: '',
      ingredients: [],
      instructions: '',
      image: '/api/placeholder/400/320' // Default placeholder image
    };

    sections.forEach(section => {
      if (section.startsWith('Title:')) {
        recipe.title = section.replace('Title:', '').trim();
      } else if (section.startsWith('Description:')) {
        recipe.description = section.replace('Description:', '').trim();
      } else if (section.startsWith('Ingredients:')) {
        recipe.ingredients = section
          .replace('Ingredients:', '')
          .trim()
          .split('\n')
          .map(i => i.trim())
          .filter(i => i.length > 0);
      } else if (section.startsWith('Instructions:')) {
        recipe.instructions = section.replace('Instructions:', '').trim();
      }
    });

    return recipe;
  }
}

export const recipeService = new RecipeService();