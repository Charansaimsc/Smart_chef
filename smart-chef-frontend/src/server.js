const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 8000;
const MONGO_URI = 'mongodb://localhost:27017/smartchef';
const JWT_SECRET = 'your-secret-key'; // Change this in production

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Favorite Schema
const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipe: { type: Object, required: true }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

// Middleware to authenticate token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extracted:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Token verified, user data:', verified);
    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(400).json({ message: 'Invalid token', details: error.message });
  }
};

// Sign Up Route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Add to favorites route
app.post('/api/recipes/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const recipeData = req.body;
    
    // Create new favorite document
    const newFavorite = new Favorite({
      userId,
      recipe: recipeData
    });
    
    await newFavorite.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving favorite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
      const { username, password } = req.body;
      console.log(`Sign-in attempt for username: ${username}`);

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
          console.log("User not found");
          return res.status(400).json({ message: 'User not found' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
          console.log("Invalid password");
          return res.status(400).json({ message: 'Invalid password' });
      }

      // Create token with longer expiration time
      const token = jwt.sign(
          { userId: user._id },
          JWT_SECRET,
          { expiresIn: '24h' }  // Changed from '1h' to '24h'
      );

      console.log("User signed in successfully");
      console.log("Token generated:", token);
      res.json({ token, username: user.username });
  } catch (error) {
      console.error("Error signing in:", error);
      res.status(500).json({ message: 'Error signing in' });
  }
});

// Delete Account Route
app.delete('/api/user/delete', authMiddleware, async (req, res) => {
  console.log("Delete request received");
  try {
    // Get user ID from the token
    const userId = req.user.userId;
    console.log("Attempting to delete user with ID:", userId);
    
    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    console.log("Delete operation result:", deletedUser);
    if (!deletedUser) {
      console.log("User not found for deletion");
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log("User successfully deleted");
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

// Alternative simpler delete endpoint that takes username
app.delete('/api/user/delete-by-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Attempting to delete user with username: ${username}`);
    
    const deletedUser = await User.findOneAndDelete({ username });
    
    if (!deletedUser) {
      console.log("User not found for deletion");
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log("User successfully deleted by username");
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

// Get favorites route
app.get('/api/recipes/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const favorites = await Favorite.find({ userId });
    
    res.status(200).json({ 
      success: true, 
      favorites: favorites.map(f => f.recipe) 
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete favorite route
app.delete('/api/recipes/favorites/:recipeId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;
    
    const result = await Favorite.findOneAndDelete({ 
      userId, 
      'recipe.recipeId': recipeId 
    });
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Route
app.get('/', (req, res) => {
    res.send("Server is running!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});