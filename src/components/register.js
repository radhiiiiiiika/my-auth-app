import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import './Auth.css';

function Register({ switchToLogin }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Registration Successful!</h2>
            <div className="sport-icons">
              <span className="sport-icon">🏆</span>
              <span className="sport-icon">🥇</span>
              <span className="sport-icon">🎯</span>
            </div>
          </div>
          
          <div className="success-message">
            <p>Please check your email to confirm your account.</p>
            <p>Once confirmed, you can log in to your account.</p>
          </div>
          
          <button className="auth-button" onClick={switchToLogin}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <div className="sport-icons">
            <span className="sport-icon">🏂</span>
            <span className="sport-icon">🏄</span>
            <span className="sport-icon">🚴</span>
            <span className="sport-icon">⛹️</span>
          </div>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
            />
            <p className="input-hint">At least 6 characters</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <button className="auth-link" onClick={switchToLogin}>
              Login Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;