// Settings page for managing alarm preferences and account options

import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import '../styles/main-menu.css';
import '../styles/settings.css';
import logo from '../assets/logo.png';

function SettingsPage() {
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

      {/* Main settings card */}
      <div className="settings-card">
        {/* Back button + page title */}
        <div className="settings-header">
          <Link to="/menu" className="back-btn">
            Back
          </Link>

          <h2 className="settings-title">Settings</h2>
        </div>

        {/* Current alarm */}
        <div className="settings-section">
          <h3 className="settings-section-heading">Current Alarm</h3>
          <div className="settings-info-box">
            Morning Alarm
          </div>
        </div>

        {/* Alarm enabled */}
        <div className="settings-section">
          <label htmlFor="alarmEnabled" className="settings-section-heading">
            Alarm Enabled
          </label>
          <select id="alarmEnabled" className="form-select settings-dropdown">
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* Wake-up lead time */}
        <div className="settings-section">
          <label htmlFor="wakeLeadTime" className="settings-section-heading">
            How much time do you need before class?
          </label>
          <select id="wakeLeadTime" className="form-select settings-dropdown">
            <option>15 minutes</option>
            <option>30 minutes</option>
            <option>45 minutes</option>
            <option>1 hour</option>
          </select>
        </div>

        {/* Accessibility */}
        <div className="settings-section">
          <label htmlFor="accessibility" className="settings-section-heading">
            Accessibility Options
          </label>
          <select id="accessibility" className="form-select settings-dropdown">
            <option>Default</option>
            <option>Larger Text</option>
            <option>Colourblind Mode</option>
          </select>
        </div>

        {/* Calendar connection */}
        <div className="settings-section">
          <h3 className="settings-section-heading">Calendar Connection</h3>
          <p className="settings-text">
            Your Google Calendar is currently connected.
          </p>
          <button className="settings-primary-btn">Reconnect Calendar</button>
        </div>

        {/* Account actions */}
        <div className="settings-section">
          <h3 className="settings-section-heading">Account</h3>
          <div className="settings-action-buttons">
            <button className="settings-secondary-btn">Sign Out</button>
            <button className="settings-danger-btn">Deactivate Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;