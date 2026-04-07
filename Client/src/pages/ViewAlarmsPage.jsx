// Displays a list of available alarms

import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import '../styles/alarms.css';
import '../styles/main-menu.css';
import logo from '../assets/logo.png';

function ViewAlarmsPage() {
  // Temporary alarm data for layout/testing
  const alarms = [
    { id: 1, name: 'Morning Alarm', rating: 4.5 },
    { id: 2, name: 'Soft Alarm', rating: 4.2 },
    { id: 3, name: 'Loud Alarm', rating: 3.9 },
    { id: 4, name: 'Nature Alarm', rating: 4.7 },
    { id: 5, name: 'Classic Bell Alarm', rating: 3.8 },
  ];

  const currentAlarm = 'Morning Alarm';

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

      {/* Page content */}
      <div className="alarms-page-card">
        {/* Back button + current alarm */}
        <div className="alarms-header-row">
          <Link to="/menu" className="back-btn">
            Back
          </Link>

          <div className="current-alarm-badge">
  <span className="current-alarm-label">Current Alarm Chosen :  </span>
  <span className="current-alarm-name">{currentAlarm}</span>
</div>
        </div>

        {/* Page heading */}
        <h2 className="alarms-page-title">View Alarms</h2>

        {/* Alarm list */}
        <div className="alarm-list">
          {alarms.map((alarm) => (
            <Link
              to={`/alarms/${alarm.id}`}
              className="alarm-button"
              key={alarm.id}
            >
              <span className="alarm-button-name">{alarm.name}</span>
              <span className="alarm-button-rating">⭐ {alarm.rating}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewAlarmsPage;