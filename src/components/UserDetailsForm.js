import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../utils/AuthContext';
import './Dashboard.css';

function UserDetailsForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users_details')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setName(data.name || '');
        setRegistrationNumber(data.registration_number || '');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);

      const { error } = await supabase
        .from('users_details')
        .upsert({
          id: user.id,
          name,
          registration_number: registrationNumber,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="user-details-form card">
      <h2>Your Details</h2>
      {loading ? (
        <p>Loading your details...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="registration">Registration Number</label>
            <input
              id="registration"
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Enter your registration number"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Details updated successfully!</div>}
          
          <button type="submit" className="btn primary-btn" disabled={updating}>
            {updating ? 'Updating...' : 'Save Details'}
          </button>
        </form>
      )}
    </div>
  );
}

export default UserDetailsForm;
