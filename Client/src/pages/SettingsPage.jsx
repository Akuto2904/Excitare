import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import '../styles/main-menu.css';
import '../styles/settings.css';
import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import {
  getCalendars,
  setCalendar,
  getFirstClass,
} from '../services/calendarService';

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('currentAlarmName');
    localStorage.removeItem('currentAlarmId');
    navigate('/');
  };

  const [calendars, setCalendars] = useState([]);
const [selectedCalendar, setSelectedCalendar] = useState('');
const [calendarConnected, setCalendarConnected] = useState(false);
const [firstClass, setFirstClass] = useState(null);



// Redirect to Google login
const handleConnectCalendar = () => {
  window.location.href = `http://localhost:5000/api/${user.id}/calendarLogin`;
};

// Load calendars
const loadCalendars = async () => {
  try {
    const data = await getCalendars(user.id);
    setCalendars(data);
    setCalendarConnected(true);
  } catch (err) {
    console.error('Failed to load calendars', err);
  }
};

// Save calendar
const handleSaveCalendar = async () => {
  try {
    await setCalendar(user.id, selectedCalendar);
    const classData = await getFirstClass(user.id);
    setFirstClass(classData);
  } catch (err) {
    console.error('Failed to save calendar', err);
  }
};

// Run on page load
useEffect(() => {
  loadCalendars();
}, []);

  return (
    <div className="container py-5">
      {/* Navbar */}
      <div className="main-menu-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Excitare logo" className="navbar-logo" />
        </div>

        <div className="navbar-center">
          <h1 className="navbar-title">Excitare</h1>
        </div>

        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            Log Out
          </button>
        </div>
      </div>

      {/* Correct styled card */}
      <div className="settings-card">
        <div className="settings-header">
          <Link to="/menu" className="back-btn">
            Back
          </Link>
          <h2 className="settings-title">Settings</h2>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-heading">Account</h3>
          <p className="settings-text">Email: {user?.email}</p>
          <p className="settings-text">Role: {user?.role}</p>
          <p className="settings-text">Status: {user?.status}</p>
        </div>

       <div className="settings-section">
  <h3 className="settings-section-heading">Google Calendar</h3>

  {!calendarConnected && (
    <button
      className="settings-primary-btn"
      onClick={handleConnectCalendar}
    >
      Connect Google Calendar
    </button>
  )}

  {calendarConnected && (
    <>
      <select
        className="settings-dropdown"
        value={selectedCalendar}
        onChange={(e) => setSelectedCalendar(e.target.value)}
      >
        <option value="">Select a calendar</option>
        {calendars.map((cal) => (
          <option key={cal.id} value={cal.id}>
            {cal.summary}
          </option>
        ))}
      </select>

      <div className="mt-3">
        <button
          className="settings-secondary-btn"
          onClick={handleSaveCalendar}
          disabled={!selectedCalendar}
        >
          Save Calendar
        </button>
      </div>
    </>
  )}

  {firstClass && firstClass.status === 1 && (
    <div className="settings-info-box mt-3">
      Next class: {firstClass.class} at {firstClass.startTime}
    </div>
  )}

  {firstClass && firstClass.status === 0 && (
    <div className="settings-info-box mt-3">
      No class tomorrow - enjoy your day off!
    </div>
  )}
</div>
      </div>
    </div>
  );
}

export default SettingsPage;