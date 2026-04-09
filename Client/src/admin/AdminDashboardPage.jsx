import React from 'react';
import AdminLayout from './AdminLayout';

const AdminDashboardPage = () => {
  return (
    <AdminLayout title="Dashboard">
      <section className="main-menu-layout">
        <div className="dashboard-card current-alarm-card">
          <h2 className="section-heading">Moderation Overview</h2>
          <p className="action-text">
            This dashboard gives admins a quick overview of user activity and
            content that may need moderation. Back-end integration can plug in
            real metrics here (e.g. number of new reviews, flagged content,
            or locked accounts).
          </p>
        </div>

        <div className="bottom-card-row">
          <a href="/admin/users" className="action-link">
            <div className="dashboard-card action-card">
              <h3 className="section-heading">User Management</h3>
              <p className="action-text">
                Review accounts, check roles, lock or unlock users and keep the
                platform safe for students.
              </p>
            </div>
          </a>

          <a href="/admin/alarms" className="action-link">
            <div className="dashboard-card action-card">
              <h3 className="section-heading">Alarms & Reviews</h3>
              <p className="action-text">
                Browse all alarms, inspect reviews and delete anything that is
                inappropriate or unhelpful.
              </p>
            </div>
          </a>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboardPage;