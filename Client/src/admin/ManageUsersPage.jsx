import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

// Placeholder list until backend wiring is complete.
const seedUsers = [
  { id: 1, email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 2, email: 'student1@example.com', role: 'user', status: 'active' },
  { id: 3, email: 'student2@example.com', role: 'user', status: 'locked' },
];

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Later, replace with GET /api/admin/users.
    setUsers(seedUsers);
  }, []);

  const toggleLock = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'locked' : 'active' } : u,
      ),
    );
    // TODO: call backend endpoint, e.g. POST /api/admin/users/{id}/lock.
  };

  const promoteToAdmin = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: 'admin' } : u)));
    // TODO: POST /api/admin/users/{id}/role.
  };

  return (
    <AdminLayout title="Manage Users">
      <h2 className="section-heading">Manage Users</h2>
      <p className="action-text" style={{ marginBottom: '1rem' }}>
        Admins can review accounts, adjust roles and lock users who misuse the
        system. The table below is wired for front-end behaviour; the
        back-end team just need to plug in the real API calls.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ minWidth: '220px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => promoteToAdmin(user.id)}
                      disabled={user.role === 'admin'}
                    >
                      Make admin
                    </button>

                    <button
                      type="button"
                      className={
                        user.status === 'active'
                          ? 'btn btn-sm btn-outline-danger'
                          : 'btn btn-sm btn-outline-success'
                      }
                      onClick={() => toggleLock(user.id)}
                    >
                      {user.status === 'active' ? 'Lock account' : 'Unlock account'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;