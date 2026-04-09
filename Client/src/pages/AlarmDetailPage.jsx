// Page for showing details of a specific alarm, including reviews
// and option to set as current alarm.

import { Link, useParams } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import '../styles/main-menu.css';
import '../styles/alarm-detail.css';
import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import { getAlarmById } from '../services/alarmService';
import { getReviewsByAlarmId } from '../services/reviewService';
import { updateUserChosenAlarm } from '../services/userService';

function AlarmDetailPage() {
  // Gets the alarm id from the URL
  const { id } = useParams();

  // Stores the selected alarm data from the backend
  const [alarm, setAlarm] = useState(null);

  // Stores the reviews for this alarm
  const [reviews, setReviews] = useState([]);

  // Used for the temporary frontend star rating input
  const [rating, setRating] = useState(0);

  // Loading and error states for better UX
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Temp success/error message for setting current alarm
  const [setAlarmMessage, setSetAlarmMessage] = useState('');
  const [settingAlarm, setSettingAlarm] = useState(false);

  // Runs when the page loads or when the alarm id changes
  useEffect(() => {
    const fetchAlarmData = async () => {
      try {
        // Fetch the selected alarm from the backend
        const alarmData = await getAlarmById(id);

        // Fetch reviews for this alarm from the backend
        const reviewData = await getReviewsByAlarmId(id);

        setAlarm(alarmData);
        setReviews(reviewData);
      } catch (err) {
        setError('Failed to load alarm details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlarmData();
  }, [id]);

  // Temporary user until real login is added
  const tempUser = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    password: 'testpassword',
    chosenAlarmId: alarm?.id,
  };

  // Handles setting the current alarm
  const handleSetCurrentAlarm = async () => {
    try {
      setSettingAlarm(true);
      setSetAlarmMessage('');

      const updatedUser = {
        ...tempUser,
        chosenAlarmId: alarm.id,
      };

      await updateUserChosenAlarm(updatedUser);

      setSetAlarmMessage('Current alarm updated successfully.');
    } catch (err) {
      setSetAlarmMessage('Failed to set current alarm.');
      console.error(err);
    } finally {
      setSettingAlarm(false);
    }
  };

  // Show loading message while data is being fetched
  if (loading) {
    return <p className="container py-5">Loading alarm details...</p>;
  }

  // Show error message if something goes wrong
  if (error) {
    return <p className="container py-5">{error}</p>;
  }

  // Show message if no alarm is found
  if (!alarm) {
    return <p className="container py-5">Alarm not found.</p>;
  }

  return (
    <div className="container py-5">
      {/* Top navigation bar */}
      <div className="main-menu-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Excitare logo" className="navbar-logo" />
        </div>

        <div className="navbar-center">
          <h1 className="navbar-title">Excitare</h1>
        </div>

        <div className="navbar-right">
          <button className="logout-btn">
            <FiLogOut className="logout-icon" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main page card */}
      <div className="alarm-detail-card">
        {/* Back button + alarm info */}
        <div className="alarm-detail-header">
          <Link to="/alarms" className="back-btn">
            Back
          </Link>

          <div className="alarm-title-block">
            <h2 className="alarm-title">{alarm.name}</h2>

            {/* Rating is still a placeholder until backend rating is added */}
            <p className="alarm-rating">⭐ N/A / 5</p>
          </div>
        </div>

        {/* Description */}
        <div className="alarm-detail-section">
          <h3 className="detail-section-heading">Description</h3>
          <p className="alarm-description-text">{alarm.description}</p>
        </div>

        {/* Time needed before class */}
        <div className="alarm-detail-section">
          <label htmlFor="wakeTime" className="detail-section-heading">
            How much time do you need before class?
          </label>

          <select id="wakeTime" className="form-select detail-dropdown">
            <option>15 minutes</option>
            <option>30 minutes</option>
            <option>45 minutes</option>
            <option>1 hour</option>
          </select>
        </div>

        {/* Set as current alarm button */}
        <div className="alarm-detail-section">
          <button
            className="set-alarm-btn"
            onClick={handleSetCurrentAlarm}
            disabled={settingAlarm}
          >
            {settingAlarm ? 'Setting Alarm...' : 'Set as Current Alarm'}
          </button>

          {setAlarmMessage && (
            <p className="set-alarm-message">{setAlarmMessage}</p>
          )}
        </div>

        {/* Reviews from backend */}
        <div className="alarm-detail-section">
          <h3 className="detail-section-heading">Reviews</h3>

          {reviews.length === 0 ? (
            <p className="no-reviews-text">No reviews yet.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <p className="review-card-heading">User Review</p>
                  <p className="review-text">{review.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave a review section */}
        <div className="alarm-detail-section">
          <h3 className="detail-section-heading">Leave a Review</h3>

          <div className="review-form-card">
            <div className="mb-3">
              <label className="form-label review-label">Rating</label>

              {/* Temporary frontend star selector */}
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= rating ? 'star filled' : 'star'}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="reviewText" className="form-label review-label">
                Review
              </label>
              <textarea
                id="reviewText"
                className="form-control review-textarea"
                rows="4"
                placeholder="Write your review here..."
              ></textarea>
            </div>

            <button className="submit-review-btn">Submit Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlarmDetailPage;