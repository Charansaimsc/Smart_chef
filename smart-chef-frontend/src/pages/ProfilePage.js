import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import RecipeDisplay from '../components/RecipeDisplay';

const ProfilePage = () => {
  const { logout } = useAuth();
  const [username, setUsername] = useState('User');
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchFavorites();
  }, []);

  const processImageUrl = (imageUrl, recipeTitle) => {
    try {
      console.group(`Image Processing for: ${recipeTitle}`);
      console.log('Original Image URL:', imageUrl);
      
      // If no image or empty string, use default
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        console.warn(`No image for recipe: ${recipeTitle}. Using default.`);
        console.groupEnd();
        return 'http://localhost:8000/images/default-recipe.jpg';
      }
  
      // Remove query parameters
      let processedUrl = imageUrl.split('?')[0];
      console.log('Processed URL (after removing query params):', processedUrl);
  
      let fullUrl;
      // More explicit URL processing with detailed logging
      if (processedUrl.match(/^https?:\/\//)) {
        fullUrl = processedUrl;
        console.log('Full URL detected:', fullUrl);
      } else if (!processedUrl.includes('/')) {
        fullUrl = `http://localhost:8000/images/${processedUrl}`;
        console.log('Filename-only URL:', fullUrl);
      } else if (processedUrl.startsWith('/')) {
        fullUrl = `http://localhost:8000${processedUrl}`;
        console.log('Root path URL:', fullUrl);
      } else {
        fullUrl = `http://localhost:8000/${processedUrl}`;
        console.log('Relative path URL:', fullUrl);
      }
  
      console.log('Final Processed Image URL:', fullUrl);
      console.groupEnd();
      return fullUrl;
    } catch (err) {
      console.error(`Critical error processing image URL for ${recipeTitle}:`, err);
      console.groupEnd();
      return 'http://localhost:8000/images/default-recipe.jpg';
    }
  };
  
  const fetchFavorites = async () => {
    try {
      console.log('Starting to fetch favorites...');
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('http://localhost:8000/api/recipes/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Complete API response:', JSON.stringify(data, null, 2));
      
      if (!data.favorites || !Array.isArray(data.favorites)) {
        throw new Error('Invalid favorites data structure');
      }
      
      const processedFavorites = data.favorites.map(recipe => {
        const processedImageUrl = processImageUrl(recipe.image, recipe.title);
        
        console.group(`Recipe Image Processing for: ${recipe.title}`);
        console.log('Original Image:', recipe.image);
        console.log('Processed Image URL:', processedImageUrl);
        console.groupEnd();
        
        return { 
          ...recipe, 
          image: processedImageUrl || 'http://localhost:8000/images/default-recipe.jpg'
        };
      });
      
      console.log('Processed Favorites:', processedFavorites);
      setFavorites(processedFavorites);
    } catch (error) {
      console.error('Comprehensive Favorites Fetch Error:', error);
      setError(`Failed to load favorites: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/recipes/favorites/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setFavorites(favorites.filter(recipe => recipe.recipeId !== recipeId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      alert('Could not remove recipe from favorites. Please try again.');
    }
  };

  const handleLogout = () => {
    try {
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const username = localStorage.getItem('username');
      
      const url = `http://localhost:8000/api/user/delete-by-username/${username}`;
      console.log("Making request to:", url);
      
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.log("Error response text:", text);
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Success response:", data);
      
      alert('Your account has been successfully deleted.');
      logout();
      localStorage.clear();
      navigate('/signup');
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Failed to delete account. Error: ' + error.message);
    }
  };

  const openRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };
  
  const handleImageLoad = (e) => {
    console.log('Image loaded successfully:', e.target.src);
  };
  
  const handleImageError = (e, recipeTitle) => {
    const src = e.target.src;
    console.error(`Image failed to load for recipe: ${recipeTitle}`, src);
    
    e.target.src = 'http://localhost:8000/images/default-recipe.jpg';
    e.target.onerror = null;
  };

  return (
    <div className="profile-page">
      <NavBar />

      <div className="profile-container">
        <h1>User Profile</h1>
        <div className="profile-info">
          <h2>Username: {username}</h2>
        </div>
        
        <div className="favorites-section">
          <h2>My Favorite Recipes</h2>
          
          {isLoading && <div className="loading">Loading your favorites...</div>}
          
          {error && <div className="error-message">{error}</div>}
          
          {!isLoading && favorites.length === 0 && (
            <div className="no-favorites">
              You haven't saved any favorite recipes yet.
            </div>
          )}
          
          <div className="favorites-grid">
            {favorites.map(recipe => (
              <div key={recipe.recipeId || Math.random().toString()} className="favorite-card">
                <div className="recipe-image">
                  <img 
                    src={recipe.image || 'http://localhost:8000/images/default-recipe.jpg'}
                    alt={recipe.title}
                    onLoad={handleImageLoad}
                    onError={(e) => handleImageError(e, recipe.title)}
                  />
                </div>
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  {recipe.cookTime && <div className="recipe-time">Cook time: {recipe.cookTime}</div>}
                  <div className="card-actions">
                    <button 
                      onClick={() => openRecipeDetails(recipe)} 
                      className="view-button"
                    >
                      View Recipe
                    </button>
                    <button 
                      onClick={() => handleRemoveFavorite(recipe.recipeId)} 
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-button">Logout</button>
          <button onClick={handleDeleteAccount} className="delete-account-button">Delete Account</button>
        </div>
      </div>

      {showModal && selectedRecipe && (
        <div className="recipe-modal-overlay" onClick={closeModal}>
          <div className="recipe-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>&times;</button>
            <RecipeDisplay recipe={selectedRecipe} />
          </div>
        </div>
      )}

      <style jsx global>{`
        :root {
          --primary-color: #6C63FF;
          --primary-light: #A5A0FF;
          --accent-color: #00F5FF;
          --background-color: #0F172A;
          --dark-glass: rgba(16, 20, 34, 0.7);
          --light-glass: rgba(255, 255, 255, 0.1);
          --text-primary: #F8FAFC;
          --text-secondary: #CBD5E1;
          --white: #FFFFFF;
          --danger: #FF4A6E;
          --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          --glass-border: 1px solid rgba(255, 255, 255, 0.18);
          --blur-effect: blur(16px);
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: linear-gradient(135deg, var(--background-color) 0%, #1E293B 100%);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          min-height: 100vh;
          background-attachment: fixed;
        }

        .profile-page {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background-color: var(--background-color);
          background-image: 
            radial-gradient(circle at top right, rgba(138, 43, 226, 0.2), transparent 60%),
            radial-gradient(circle at bottom left, rgba(0, 255, 204, 0.15), transparent 60%);
          background-attachment: fixed;
        }

        .profile-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2.5rem;
          background: var(--dark-glass);
          border-radius: 1.5rem;
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .profile-info {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(5px);
          transition: transform 0.3s ease;
        }

        .profile-info:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(138, 43, 226, 0.2);
        }

        .favorites-section {
          margin: 2rem 0;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .favorite-card {
          background: rgba(255, 255, 255, 0.07);
          border-radius: 1rem;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .favorite-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(108, 99, 255, 0.3);
        }

        .recipe-image {
          width: 100%;
          height: 180px;
          overflow: hidden;
          position: relative;
          background-color: rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .recipe-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .favorite-card:hover .recipe-image img {
          transform: scale(1.05);
        }

        .recipe-info {
          padding: 1.25rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .recipe-info h3 {
          margin: 0 0 0.75rem;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--white);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .recipe-time {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .card-actions {
          margin-top: auto;
          display: flex;
          gap: 0.75rem;
        }

        .view-button, .remove-button {
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .view-button {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
          color: var(--white);
        }

        .remove-button {
          background: rgba(255, 74, 110, 0.15);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .view-button:hover {
          background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
          transform: translateY(-2px);
        }

        .remove-button:hover {
          background: rgba(255, 74, 110, 0.25);
          transform: translateY(-2px);
        }

        .loading, .error-message, .no-favorites {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          margin: 1rem 0;
        }

        .loading {
          color: var(--accent-color);
        }

        .error-message {
          color: var(--danger);
        }

        .no-favorites {
          color: var(--text-secondary);
        }

        .profile-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .logout-button, .delete-account-button {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.5px;
        }

        .logout-button {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
          color: var(--white);
          border: none;
          box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4);
        }

        .logout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(138, 43, 226, 0.5);
        }

        .delete-account-button {
          background: rgba(255, 255, 255, 0.1);
          color: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }

        .delete-account-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
        }

        h1 {
          color: var(--white);
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1rem;
          font-weight: 700;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.5px;
          position: relative;
        }

        h1::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 80px;
          height: 3px;
          background: linear-gradient(to right, var(--accent-color), transparent);
          border-radius: 3px;
        }

        h2 {
          color: var(--white);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          letter-spacing: 0.5px;
        }

        .recipe-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        
        .recipe-modal-content {
          background: var(--dark-glass);
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 1.5rem;
          padding: 2rem;
          position: relative;
          border: 1px solid var(--glass-border);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
        }
        
        .modal-close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          color: var(--white);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }
        
        .recipe-modal-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .recipe-modal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .recipe-modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .recipe-modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
          .favorites-grid {
            grid-template-columns: 1fr;
          }
          
          .profile-container {
            padding: 1.5rem;
            margin-top: 1rem;
          }
          
          .profile-actions {
            flex-direction: column;
          }
          
          .logout-button, .delete-account-button {
            width: 100%;
          }

          .profile-page {
            padding-top: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;