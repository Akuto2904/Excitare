/* allows users to view their current alarm, browse other alarms, and access settings */
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import '../styles/main-menu.css';
import logo from '../assets/logo.png';

function MainMenuPage() {
 // Gets the current selected alarm from local storage
  const currentAlarmName =
    localStorage.getItem('currentAlarmName') || 'Not set yet';

  // Temporary placeholder text until backend rating and description
  // are connected properly for the chosen alarm
  const currentAlarmRating =
    currentAlarmName === 'Not set yet' ? 'N/A' : 'N/A';

  const currentAlarmDescription =
    currentAlarmName === 'Not set yet'
      ? 'You have not chosen an alarm yet.'
      : 'This is your currently selected alarm.';
 
 
  return (
    <div className="container py-5">

      {/* Top navigation bar */}
      <div className="main-menu-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="navbar-logo" />
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

      {/* Main content area */}
      <div className="main-menu-layout">

        {/* Top section: current alarm info */}
        <div className="dashboard-card current-alarm-card">
          <h2 className="section-heading">Current Alarm</h2>
          <h2 className="alarm-name">{currentAlarmName}</h2>
          <p className="alarm-rating">Average Rating: {currentAlarmRating}/ 5</p>
          <p className="alarm-description">{currentAlarmDescription}</p>
        </div>

        {/* Bottom section - View alarms and settings */}
        <div className="bottom-card-row">

          <Link to="/alarms" className="dashboard-card action-card action-link">
            <h2 className="section-heading">View Alarms</h2>
            <p className="action-text">
              Browse all available alarms, compare ratings, and view alarm details.
            </p>
          </Link>

          <Link to="/settings" className="dashboard-card action-card action-link">
            <h2 className="section-heading">Settings</h2>
            <p className="action-text">
              Manage alarm preferences, accessibility options, and calendar connection.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default MainMenuPage;