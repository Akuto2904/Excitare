import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Simple auth context used on the front-end.
 *
 * The real project should back this with the Flask API
 * (login endpoint that returns a JWT / session cookie and role).
 * For now, this keeps the admin/non-admin split and route protection
 * so that other team members can plug in the actual backend.
 */

const AuthContext = createContext(null);

//Read saved user from sessionStorage on first load
const readInitialUser = () => {
  try {
    const raw = window.sessionStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

//API keys
const API_BASE = 'http://localhost:5000/api';
const API_KEY = '06abce352a6e9aab3e6c59d8a6e6619535e36385b92d094cb4640dece149a1f6';



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readInitialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      window.sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem('authUser');
    }
  }, [user]);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      // Backend currently expects GET /api/login with a JSON body
      const response = await fetch(`${API_BASE}/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Login request failed.');
      }
      
if (data.Details !== 'Accepted') {
        setError('Incorrect email or password.');
        throw new Error('Incorrect email or password.');
      }

      if (data.userStatus === 'locked') {
        setError('Your account is locked. Please contact an admin.');
        throw new Error('Account is locked.');
      }

      // Backend does not return userId yet, so a temporary id bridge for now
      const loggedInUser = {
        id: 1,
        email,
        role: data.userRole || 'user',
        status: data.userStatus || 'free',
      };

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      if (!error) {
        setError(err.message || 'Login failed. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    window.sessionStorage.removeItem('authUser');
  };

  const value = { user, loading, error, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};