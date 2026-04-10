import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import {
  getCalendars,
  setCalendar,
  getFirstClass,
} from '../services/calendarService';
import '../styles/main-menu.css';
import '../styles/settings.css';
import logo from '../assets/logo.png';

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [firstClass, setFirstClass] = useState(null);

  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [prepTime, setPrepTime] = useState('2 hrs');

  const [bigTextMode, setBigTextMode] = useState(
    localStorage.getItem('bigTextMode') === 'true'
  );
  const [colourblindMode, setColourblindMode] = useState(
    localStorage.getItem('colourblindMode') || 'none'
  );

  const [settingsMessage, setSettingsMessage] = useState('');

  const handleLogout = () => {
    logout();
    localStorage.removeItem('currentAlarmName');
    localStorage.removeItem('currentAlarmId');
    navigate('/');
  };

  const handleConnectCalendar = () => {
    window.location.href = `http://localhost:5000/api/${user.id}/calendarLogin`;
  };

  const loadCalendars = async () => {
    try {
      const data = await getCalendars(user.id);
      setCalendars(data);
      setCalendarConnected(Array.isArray(data) && data.length > 0);
    } catch (err) {
      console.error('Failed to load calendars', err);
      setCalendarConnected(false);
    }
  };

  const handleSaveCalendar = async () => {
    try {
      await setCalendar(user.id, selectedCalendar);
      const classData = await getFirstClass(user.id);
      setFirstClass(classData);
      setSettingsMessage('Calendar updated successfully.');
    } catch (err) {
      console.error('Failed to save calendar', err);
      setSettingsMessage('Failed to save calendar.');
    }
  };

  useEffect(() => {
    loadCalendars();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('big-text', bigTextMode);
    localStorage.setItem('bigTextMode', String(bigTextMode));
  }, [bigTextMode]);

  useEffect(() => {
    const enabled = colourblindMode === 'on';
    document.body.classList.toggle('colourblind-mode', enabled);
    localStorage.setItem('colourblindMode', colourblindMode);
  }, [colourblindMode]);

  const currentAlarmName =
    localStorage.getItem('currentAlarmName') || 'No alarm selected';

  return (
    <div className="container py-5">
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

      <div className="settings-card">
        <div className="settings-header">
          <Link to="/menu" className="back-btn">
            Back
          </Link>
          <h2 className="settings-title">Settings</h2>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-heading">Current Alarm</h3>
          <div className="settings-info-box">{currentAlarmName}</div>
        </div>

        <div className="settings-section settings-inline-row">
          <div>
            <h3 className="settings-section-heading">Alarm Enabled</h3>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={alarmEnabled}
              onChange={() => setAlarmEnabled((prev) => !prev)}
            />
            <span className="settings-slider"></span>
          </label>
        </div>

        <div className="settings-section">
          <label htmlFor="prepTime" className="settings-section-heading">
            How much time do you need before class?
          </label>
          <select
            id="prepTime"
            className="form-select settings-dropdown"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          >
            <option>30 mins</option>
            <option>1 hr</option>
            <option>90 mins</option>
            <option>2 hrs</option>
          </select>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-heading">Account Information</h3>
          <p className="settings-text"><strong>Username:</strong> {user?.username || 'Unknown'}</p>
          <p className="settings-text"><strong>Email:</strong> {user?.email || 'Unknown'}</p>
          <p className="settings-text"><strong>Role:</strong> {user?.role || 'user'}</p>
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
              <p className="settings-text">Calendar Status: Connected</p>

              <select
                className="form-select settings-dropdown"
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
                  className="settings-primary-btn"
                  onClick={handleSaveCalendar}
                  disabled={!selectedCalendar}
                >
                  Reconnect Calendar
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
              No class tomorrow
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-heading">Accessibility</h3>

          <div className="settings-inline-row">
            <label className="settings-text mb-0">Colourblind Mode</label>
            <select
              className="form-select settings-dropdown settings-small-dropdown"
              value={colourblindMode}
              onChange={(e) => setColourblindMode(e.target.value)}
            >
              <option value="none">None</option>
              <option value="on">On</option>
            </select>
          </div>

          <div className="settings-inline-row mt-3">
            <label className="settings-text mb-0">Big Text Mode</label>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={bigTextMode}
                onChange={() => setBigTextMode((prev) => !prev)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-action-buttons">
            <button className="settings-primary-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>

        {settingsMessage && (
          <p className="set-alarm-message">{settingsMessage}</p>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;