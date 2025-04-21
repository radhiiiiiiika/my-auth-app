import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import './Dashboard.css';

function EventsManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('indoor');
  const [eventDate, setEventDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setFormError(null);
      setFormSuccess(false);

      const { error } = await supabase
        .from('events')
        .insert({
          event_name: eventName,
          location,
          event_type: eventType,
          event_date: eventDate
        });

      if (error) throw error;
      
      setFormSuccess(true);
      resetForm();
      fetchEvents();
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
    setEventName('');
    setLocation('');
    setEventType('indoor');
    setEventDate('');
  };

  return (
    <div className="events-manager card">
      <div className="card-header">
        <h2>Events</h2>
        <button 
          className="btn secondary-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="eventType">Event Type</label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="eventDate">Event Date</label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          
          {formError && <div className="error-message">{formError}</div>}
          {formSuccess && <div className="success-message">Event added successfully!</div>}
          
          <div className="form-actions">
            <button type="button" className="btn cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn primary-btn" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="events-list">
          {events.length === 0 ? (
            <p>No events found. Create your first event!</p>
          ) : (
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.event_id}>
                    <td>{event.event_name}</td>
                    <td>{new Date(event.event_date).toLocaleDateString()}</td>
                    <td>{event.location}</td>
                    <td>
                      <span className={`badge ${event.event_type}`}>
                        {event.event_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default EventsManager;