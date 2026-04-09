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

const readInitialUser = () => {
  try {
    const raw = window.sessionStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

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
      // Placeholder implementation – replace with real API call.
      // Example:
      // const res = await fetch('/api/auth/login', { method: 'POST', ... });
      // const data = await res.json();
      // setUser({ id: data.id, email: data.email, role: data.role });

      // Temporary: treat a specific email as admin for front-end testing.
      const role = email === 'admin@example.com' ? 'admin' : 'user';
      const fakeUser = { id: 1, email, role };
      setUser(fakeUser);
      return fakeUser;
    } catch (err) {
      setError('Login failed – please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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