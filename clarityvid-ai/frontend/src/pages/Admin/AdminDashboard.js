import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import './Admin.css';

import PricingSettings from './components/PricingSettings';
import ApiKeysSettings from './components/ApiKeysSettings';
import FeaturesSettings from './components/FeaturesSettings';
import StatisticsPanel from './components/StatisticsPanel';

const AdminDashboard = () => {
  const { admin, logout, token } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>⚡ ClarityVid AI</h2>
          <p className="admin-role">{admin.role}</p>
        </div>

        <nav className="admin-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'pricing' ? 'active' : ''}
            onClick={() => setActiveTab('pricing')}
          >
            💰 Pricing
          </button>
          <button
            className={activeTab === 'api-keys' ? 'active' : ''}
            onClick={() => setActiveTab('api-keys')}
          >
            🔑 API Keys
          </button>
          <button
            className={activeTab === 'features' ? 'active' : ''}
            onClick={() => setActiveTab('features')}
          >
            ⚙️ Features
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile">
            <strong>{admin.username}</strong>
            <span>{admin.email}</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-content-header">
          <h1>
            {activeTab === 'dashboard' && '📊 Dashboard'}
            {activeTab === 'pricing' && '💰 Pricing Management'}
            {activeTab === 'api-keys' && '🔑 API Keys Configuration'}
            {activeTab === 'features' && '⚙️ Features & Settings'}
            {activeTab === 'users' && '👥 User Management'}
          </h1>
        </div>

        <div className="admin-content-body">
          {activeTab === 'dashboard' && <StatisticsPanel token={token} />}
          {activeTab === 'pricing' && <PricingSettings token={token} />}
          {activeTab === 'api-keys' && <ApiKeysSettings token={token} />}
          {activeTab === 'features' && <FeaturesSettings token={token} />}
          {activeTab === 'users' && <UsersPanel token={token} />}
        </div>
      </div>
    </div>
  );
};

// Users Panel Component
const UsersPanel = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="users-panel">
      <div className="users-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Plan</th>
              <th>Joined</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td><span className="plan-badge">{user.plan}</span></td>
                <td>{new Date(user.createdAt._seconds * 1000).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                    {user.emailVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
