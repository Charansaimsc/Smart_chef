import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import SignIn from './SignIn';
import SignUp from './SignUp';
import SmartChef from './SmartChef';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
};

const MainApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/smartchef" /> : <Navigate to="/signin" />} />
      <Route path="/signin" element={isAuthenticated ? <Navigate to="/smartchef" /> : <SignIn />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/smartchef" /> : <SignUp />} />
      <Route path="/smartchef" element={isAuthenticated ? <SmartChef /> : <Navigate to="/signin" />} />
      <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/signin" />} />
    </Routes>
  );
};

export default App;