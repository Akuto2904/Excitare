import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { getAlarms } from '../services/reviewService';
import '../styles/alarms.css';

// Temporary review data – replace with real alarm + review payloads from the API.
const seedAlarms = [
  {
    id: 1,
    name: 'Gentle Sunrise',
    averageRating: 4.7,
    reviews: [
      { id: 1, author: 'student1@example.com', text: 'Lovely way to wake up.', flagged: false },
      { id: 2, author: 'student2@example.com', text: 'Too quiet for heavy sleepers.', flagged: false },
    ],
  },
  {
    id: 2,
    name: 'Intense Ringtone',
    averageRating: 3.2,
    reviews: [
      { id: 3, author: 'student3@example.com', text: 'Way too aggressive!!', flagged: false },
      { id: 4, author: 'student4@example.com', text: 'Perfect if you always sleep through alarms.', flagged: false },
    ],
  },
];

const ManageAlarmsPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // If reviewService is wired to the backend, prefer that.
        const fromApi = await getAlarms().catch(() => null);
        if (fromApi && Array.isArray(fromApi) && fromApi.length > 0) {
          setAlarms(fromApi);
        } else {
          setAlarms(seedAlarms);
        }
      } catch (e) {
        setAlarms(seedAlarms);
      }
    };
    load();
  }, []);

  const selectedAlarm = alarms.find((a) => a.id === selectedAlarmId) || alarms[0];

  const deleteReview = (alarmId, reviewId) => {
    if (!window.confirm('Delete this review? This action cannot be undone.')) return;
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId
          ? { ...alarm, reviews: alarm.reviews.filter((r) => r.id !== reviewId) }
          : alarm,
      ),
    );
    // TODO: call backend endpoint DELETE /api/admin/alarms/{alarmId}/reviews/{reviewId}.
  };

  return (
    <AdminLayout title="Manage alarms & reviews">
      <h2 className="section-heading">Manage alarms &amp; reviews</h2>
      <p className="action-text" style={{ marginBottom: '1.5rem' }}>
        Use this screen to browse alarms and remove reviews that break the
        code of conduct. The left-hand list shows the available alarms; the
        reviews for the selected alarm appear on the right.
      </p>

      <div className="bottom-card-row">
        <section className="dashboard-card" style={{ minHeight: '260px' }}>
          <h3 className="section-heading">Alarms</h3>
          <ul className="alarm-list" style={{ listStyle: 'none', padding: 0 }}>
            {alarms.map((alarm) => (
              <li key={alarm.id}>
                <button
                  type="button"
                  onClick={() => setSelectedAlarmId(alarm.id)}
                  className="alarm-button"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span className="alarm-button-name">{alarm.name}</span>
                  <span className="alarm-button-rating">
                    {alarm.averageRating.toFixed(1)} / 5
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="dashboard-card" style={{ minHeight: '260px' }}>
          <h3 className="section-heading">Reviews for selected alarm</h3>
          {selectedAlarm ? (
            <>
              <p className="alarm-description" style={{ marginBottom: '1rem' }}>
                Showing reviews for <strong>{selectedAlarm.name}</strong>.
              </p>
              {selectedAlarm.reviews.length === 0 ? (
                <p className="action-text">No reviews yet for this alarm.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedAlarm.reviews.map((review) => (
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
                        <strong>{review.author}</strong>
                      </p>
                      <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.95rem' }}>
                        {review.text}
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteReview(selectedAlarm.id, review.id)}
                      >
                        Delete review
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="action-text">Select an alarm on the left to view reviews.</p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default ManageAlarmsPage;