import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiRequest } from '../services/api';

const emptyForm = {
  id: '',
  name: '',
  username: '',
  email: '',
  role: 'user',
  status: 'free',
  password: '',
  chosenAlarmId: '',
};

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({
      id: user.id ?? '',
      name: user.name ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      role: user.role ?? 'user',
      status: user.status ?? 'free',
      password: '',
      chosenAlarmId: user.chosenAlarmId ?? '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      id: Number(form.id),
      name: form.name,
      username: form.username,
      email: form.email,
      role: form.role,
      status: form.status,
      chosenAlarmId: form.chosenAlarmId === '' ? null : Number(form.chosenAlarmId),
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (editingId !== null) {
        await apiRequest('/users', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            password: form.password,
          }),
        });
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await apiRequest('/users', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      await loadUsers();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const toggleRole = async (user) => {
    try {
      await apiRequest('/users', {
        method: 'PUT',
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role === 'admin' ? 'user' : 'admin',
          status: user.status,
          chosenAlarmId: user.chosenAlarmId,
        }),
      });
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await apiRequest('/users', {
        method: 'PUT',
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status === 'locked' ? 'free' : 'locked',
          chosenAlarmId: user.chosenAlarmId,
        }),
      });
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  return (
    <AdminLayout title="Manage Users">
      <h2 className="section-heading">Manage Users</h2>
      <p className="action-text" style={{ marginBottom: '1rem' }}>
        Create, edit, promote, lock, unlock, and delete users using the live database.
      </p>

      {error && (
        <p style={{ color: 'crimson', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <section className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="section-heading">
          {editingId !== null ? 'Edit User' : 'Create User'}
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <input name="id" type="number" placeholder="ID" value={form.id} onChange={handleChange} required />
          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="free">free</option>
            <option value="locked">locked</option>
          </select>
          <input
            name="chosenAlarmId"
            type="number"
            placeholder="Chosen Alarm ID"
            value={form.chosenAlarmId}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder={editingId !== null ? 'New password (optional)' : 'Password'}
            value={form.password}
            onChange={handleChange}
            required={editingId === null}
          />

          <div style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-sm btn-outline-secondary">
              {editingId !== null ? 'Save Changes' : 'Create User'}
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Chosen Alarm</th>
              <th style={{ minWidth: '280px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>{user.chosenAlarmId ?? '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => toggleRole(user)}
                    >
                      {user.role === 'admin' ? 'Make user' : 'Make admin'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'locked' ? 'Unlock' : 'Lock'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="8">No users found.</td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="8">Loading users...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;