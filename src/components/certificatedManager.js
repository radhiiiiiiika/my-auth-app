import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../utils/AuthContext';
import './Dashboard.css';

function CertificatesManager() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [certificateTitle, setCertificateTitle] = useState('');
  const [position, setPosition] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCertificates();
      fetchEvents();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      
      // First ensure the user exists in users_details
      const { data: userData, error: userError } = await supabase
        .from('users_details')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      
      if (!userData) {
        // Create a default user details entry if it doesn't exist
        await supabase.from('users_details').insert({ id: user.id });
      }
      
      // Now fetch certificates with event details
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          certificate_id,
          certificate_title,
          position,
          base64_image,
          created_at,
          events (
            event_id,
            event_name,
            event_date,
            location,
            event_type
          )
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('event_id, event_name')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      setBase64Image(reader.result);
    };
    reader.onerror = function(error) {
      console.error('Error reading file:', error);
      setFormError('Error uploading image. Please try again.');
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setFormError(null);
      setFormSuccess(false);

      // Check if user has a record in users_details
      const { data: userData, error: userError } = await supabase
        .from('users_details')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!userData) {
        // Create user_details record if it doesn't exist
        const { error: insertError } = await supabase
          .from('users_details')
          .insert({ id: user.id });
          
        if (insertError) throw insertError;
      }

      // Add certificate
      const { error } = await supabase
        .from('certificates')
        .insert({
          profile_id: user.id,
          certificate_title: certificateTitle,
          position,
          event_id: selectedEvent || null,
          base64_image: base64Image
        });

      if (error) throw error;
      
      // Update certificate count
      await supabase.rpc('increment_certificates_count', { user_id: user.id });
      
      setFormSuccess(true);
      resetForm();
      fetchCertificates();
      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 2000);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCertificateTitle('');
    setPosition('');
    setSelectedEvent('');
    setBase64Image('');
  };

  const deleteCertificate = async (certificateId) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        const { error } = await supabase
          .from('certificates')
          .delete()
          .eq('certificate_id', certificateId);
          
        if (error) throw error;
        
        // Decrement certificate count
        await supabase.rpc('decrement_certificates_count', { user_id: user.id });
        
        // Refresh certificates list
        fetchCertificates();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="certificates-manager card">
      <div className="card-header">
        <h2>My Certificates</h2>
        <button 
          className="btn secondary-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Certificate'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="certificate-form">
          <div className="form-group">
            <label htmlFor="certificateTitle">Certificate Title</label>
            <input
              id="certificateTitle"
              type="text"
              value={certificateTitle}
              onChange={(e) => setCertificateTitle(e.target.value)}
              placeholder="Enter certificate title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="position">Position/Achievement</label>
            <input
              id="position"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="E.g., 1st Place, Participation"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="event">Associated Event</label>
            <select
              id="event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="">-- Select Event --</option>
              {events.map(event => (
                <option key={event.event_id} value={event.event_id}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="certificateImage">Certificate Image</label>
            <input
              id="certificateImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {base64Image && (
              <div className="image-preview">
                <img src={base64Image} alt="Certificate preview" />
              </div>
            )}
          </div>
          
          {formError && <div className="error-message">{formError}</div>}
          {formSuccess && <div className="success-message">Certificate added successfully!</div>}
          
          <div className="form-actions">
            <button type="button" className="btn cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn primary-btn" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Certificate'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading certificates...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="certificates-list">
          {certificates.length === 0 ? (
            <p>No certificates found. Add your first certificate!</p>
          ) : (
            <div className="certificates-grid">
              {certificates.map((cert) => (
                <div key={cert.certificate_id} className="certificate-card">
                  {cert.base64_image && (
                    <div className="certificate-image">
                      <img src={cert.base64_image} alt={cert.certificate_title} />
                    </div>
                  )}
                  <div className="certificate-info">
                    <h3>{cert.certificate_title}</h3>
                    {cert.position && <p className="position">{cert.position}</p>}
                    {cert.events && (
                      <p className="event-info">
                        <strong>Event:</strong> {cert.events.event_name}<br />
                        <strong>Date:</strong> {new Date(cert.events.event_date).toLocaleDateString()}<br />
                        <strong>Location:</strong> {cert.events.location}
                      </p>
                    )}
                  </div>
                  <button 
                    className="btn delete-btn"
                    onClick={() => deleteCertificate(cert.certificate_id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CertificatesManager;