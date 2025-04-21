import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import UserDetailsForm from './UserDetailsForm';
import EventsManager from './eventmanager';
import CertificatesManager from './certificatedManager';
import { supabase } from '../utils/supabase';
import './Dashboard.css';

function Dashboard() {
  const { user, signOut } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      setUserDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
  };

  if (loading) {
    return (
      <div className="dashboard-container loading">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Sports Achievements Dashboard</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="btn logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <ul>
          <li 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            Profile
          </li>
          <li 
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => setActiveTab('events')}
          >
            <span className="nav-icon">🏆</span>
            Events
          </li>
          <li 
            className={activeTab === 'certificates' ? 'active' : ''}
            onClick={() => setActiveTab('certificates')}
          >
            <span className="nav-icon">🥇</span>
            Certificates
            {userDetails?.certificates_count > 0 && (
              <span className="badge count">{userDetails.certificates_count}</span>
            )}
          </li>
        </ul>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}
        
        {activeTab === 'profile' && <UserDetailsForm />}
        {activeTab === 'events' && <EventsManager />}
        {activeTab === 'certificates' && <CertificatesManager />}
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 Sports Achievement Tracker</p>
      </footer>
    </div>
  );
}

export default Dashboard;