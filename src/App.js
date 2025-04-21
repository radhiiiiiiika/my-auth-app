// src/App.js
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/Dashboard';
import './App.css';

function AuthContainer() {
  const [view, setView] = useState('login');
  const { user, loading } = useAuth();

  const switchToRegister = () => setView('register');
  const switchToLogin = () => setView('login');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <>
      {view === 'login' ? (
        <Login switchToRegister={switchToRegister} />
      ) : (
        <Register switchToLogin={switchToLogin} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthContainer />
    </AuthProvider>
  );
}

export default App;