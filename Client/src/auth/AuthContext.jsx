import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const readInitialUser = () => {
  try {
    const raw = window.sessionStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const API_BASE = 'http://localhost:5000/api';
const API_KEY = '7b858fcad966205f4b64827b525ff25825e7367394432a089e318efd7e439f4b';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readInitialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      window.sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem('authUser');
    }
  }, [user]);

  // Apply saved settings on initial load
  useEffect(() => {
  const savedBigText = localStorage.getItem('bigTextMode') === 'true';
  const savedColourblind = localStorage.getItem('colourblindMode') === 'on';

  document.body.classList.toggle('big-text', savedBigText);
  document.body.classList.toggle('colourblind-mode', savedColourblind);
}, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.Details !== 'Accepted') {
        throw new Error('Invalid email or password.');
      }

      const backendUser = data.user ?? {};
      const authUser = {
        id: data.userId ?? backendUser.id,
        name: backendUser.name ?? '',
        username: backendUser.username ?? '',
        email: backendUser.email ?? email,
        role: data.userRole ?? backendUser.role ?? 'user',
        status: data.userStatus ?? backendUser.status ?? 'free',
        chosenAlarmId: backendUser.chosenAlarmId ?? null,
      };

      if (authUser.status === 'locked') {
        throw new Error('Your account is locked. Please contact admin.');
      }

      setUser(authUser);
      return authUser;
    } catch (err) {
      const message = err.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
    window.sessionStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};