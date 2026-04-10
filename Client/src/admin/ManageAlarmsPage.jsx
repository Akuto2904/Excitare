import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiRequest } from '../services/api';
import '../styles/alarms.css';

const emptyAlarmForm = {
  id: '',
  name: '',
  description: '',
};

const ManageAlarmsPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [alarmForm, setAlarmForm] = useState(emptyAlarmForm);
  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAlarms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/alarms');
      const alarmList = Array.isArray(data) ? data : [];
      setAlarms(alarmList);

      if (alarmList.length > 0 && !selectedAlarmId) {
        setSelectedAlarmId(alarmList[0].id);
      }

      if (alarmList.length === 0) {
        setSelectedAlarmId(null);
        setReviews([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load alarms.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (alarmId) => {
    if (!alarmId) {
      setReviews([]);
      return;
    }

    try {
      setReviewsLoading(true);
      const data = await apiRequest(`/reviews/${alarmId}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
  }, []);

  useEffect(() => {
    if (selectedAlarmId) {
      loadReviews(selectedAlarmId);
    }
  }, [selectedAlarmId]);

  const selectedAlarm = alarms.find((a) => a.id === selectedAlarmId) || null;

  const handleAlarmChange = (e) => {
    const { name, value } = e.target;
    setAlarmForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEditAlarm = (alarm) => {
    setEditingAlarmId(alarm.id);
    setAlarmForm({
      id: alarm.id ?? '',
      name: alarm.name ?? '',
      description: alarm.description ?? '',
    });
  };

  const resetAlarmForm = () => {
    setEditingAlarmId(null);
    setAlarmForm(emptyAlarmForm);
  };

  const handleAlarmSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingAlarmId !== null) {
        await apiRequest('/alarms', {
          method: 'PUT',
          body: JSON.stringify({
            id: Number(alarmForm.id),
            name: alarmForm.name,
            description: alarmForm.description,
          }),
        });
      } else {
        await apiRequest(`/alarm/${Number(alarmForm.id)}`, {
          method: 'POST',
          body: JSON.stringify({
            name: alarmForm.name,
            description: alarmForm.description,
          }),
        });
      }

      resetAlarmForm();
      await loadAlarms();
    } catch (err) {
      setError(err.message || 'Failed to save alarm.');
    }
  };

  const handleDeleteAlarm = async (id) => {
    if (!window.confirm('Delete this alarm?')) return;

    try {
      await apiRequest('/alarms', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });

      if (selectedAlarmId === id) {
        setSelectedAlarmId(null);
        setReviews([]);
      }

      await loadAlarms();
      if (editingAlarmId === id) resetAlarmForm();
    } catch (err) {
      setError(err.message || 'Failed to delete alarm.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;

    try {
      await apiRequest('/reviews', {
        method: 'DELETE',
        body: JSON.stringify({ id: reviewId }),
      });

      if (selectedAlarmId) {
        await loadReviews(selectedAlarmId);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete review.');
    }
  };

  return (
    <AdminLayout title="Manage Alarms & Reviews">
      <h2 className="section-heading">Manage Alarms & Reviews</h2>
      <p className="action-text" style={{ marginBottom: '1rem' }}>
        Create, edit, and delete alarms, then review the database-backed comments for each alarm.
      </p>

      {error && (
        <p style={{ color: 'crimson', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <section className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="section-heading">
          {editingAlarmId !== null ? 'Edit Alarm' : 'Create Alarm'}
        </h3>

        <form
          onSubmit={handleAlarmSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <input
            name="id"
            type="number"
            placeholder="Alarm ID"
            value={alarmForm.id}
            onChange={handleAlarmChange}
            required
          />
          <input
            name="name"
            type="text"
            placeholder="Alarm name"
            value={alarmForm.name}
            onChange={handleAlarmChange}
            required
          />
          <input
            name="description"
            type="text"
            placeholder="Description"
            value={alarmForm.description}
            onChange={handleAlarmChange}
            required
          />

          <div style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-sm btn-outline-secondary">
              {editingAlarmId !== null ? 'Save Changes' : 'Create Alarm'}
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetAlarmForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <div className="bottom-card-row">
        <section className="dashboard-card" style={{ minHeight: '260px' }}>
          <h3 className="section-heading">Alarms</h3>

          {loading ? (
            <p className="action-text">Loading alarms...</p>
          ) : alarms.length === 0 ? (
            <p className="action-text">No alarms found.</p>
          ) : (
            <ul className="alarm-list" style={{ listStyle: 'none', padding: 0 }}>
              {alarms.map((alarm) => (
                <li key={alarm.id} style={{ marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      border: '1px solid #e3eaf2',
                      borderRadius: '12px',
                      padding: '0.8rem',
                      backgroundColor: selectedAlarmId === alarm.id ? '#f4f8ff' : '#fff',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAlarmId(alarm.id)}
                      className="alarm-button"
                      style={{ width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem' }}
                    >
                      <span className="alarm-button-name">
                        {alarm.id} - {alarm.name}
                      </span>
                    </button>

                    <p className="alarm-description" style={{ marginBottom: '0.75rem' }}>
                      {alarm.description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => startEditAlarm(alarm)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteAlarm(alarm.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-card" style={{ minHeight: '260px' }}>
          <h3 className="section-heading">Reviews for selected alarm</h3>

          {!selectedAlarm ? (
            <p className="action-text">Select an alarm to view its reviews.</p>
          ) : (
            <>
              <p className="alarm-description" style={{ marginBottom: '1rem' }}>
                Showing reviews for <strong>{selectedAlarm.name}</strong>.
              </p>

              {reviewsLoading ? (
                <p className="action-text">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="action-text">No reviews found for this alarm.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {reviews.map((review) => (
                    <li
                      key={review.id}
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #e3eaf2',
                        padding: '0.75rem 0.9rem',
                        marginBottom: '0.75rem',
                        backgroundColor: '#f8fbff',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                        <strong>Review #{review.id}</strong> by user {review.userId}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        Rating: {review.rating} / 5
                      </p>
                      <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.95rem' }}>
                        {review.text}
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete review
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default ManageAlarmsPage;