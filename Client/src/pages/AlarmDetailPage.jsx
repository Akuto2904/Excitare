//Page for showing details of a specific alarm, including reviews and option to set as current alarm.
import { Link, useParams } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import '../styles/main-menu.css';
import '../styles/alarm-detail.css';
import logo from '../assets/logo.png';
import { useState } from 'react';

function AlarmDetailPage() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);

  // Temporary data for now
  const alarm = {
    id,
    name: 'Morning Alarm',
    rating: 4.5,
    description:
      'A calm and reliable alarm designed to wake students up gradually before their first class.',
  };

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
            <p className="alarm-rating">⭐ {alarm.rating} / 5</p>
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

        {/* Set current alarm button */}
        <div className="alarm-detail-section">
          <button className="set-alarm-btn">Set as Current Alarm</button>
        </div>

        {/* Leave a review section */}
        <div className="alarm-detail-section">
          <h3 className="detail-section-heading">Leave a Review</h3>

          <div className="mb-3">
         <label className="form-label review-label">Rating</label>

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