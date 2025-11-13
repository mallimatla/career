import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsPanel = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await axios.get('/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="admin-error">Failed to load statistics</div>;
  }

  return (
    <div className="statistics-panel">
      <div className="stats-grid">
        {/* Users Stats */}
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.users.total.toLocaleString()}</p>
            <p className="stat-subtitle">
              {stats.users.activeSubscriptions} active subscriptions
            </p>
          </div>
        </div>

        {/* Content Stats */}
        <div className="stat-card success">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Content</h3>
            <p className="stat-number">{stats.content.total.toLocaleString()}</p>
            <p className="stat-subtitle">
              Videos: {stats.content.videos} | Presentations: {stats.content.presentations}
            </p>
          </div>
        </div>

        {/* Video Stats */}
        <div className="stat-card info">
          <div className="stat-icon">🎬</div>
          <div className="stat-content">
            <h3>Videos</h3>
            <p className="stat-number">{stats.content.videos.toLocaleString()}</p>
            <p className="stat-subtitle">Generated videos</p>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="stat-card warning">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-number">
              ₹{stats.revenue.monthly.toLocaleString()}
            </p>
            <p className="stat-subtitle">Current period</p>
          </div>
        </div>

        {/* Presentations */}
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Presentations</h3>
            <p className="stat-number">{stats.content.presentations.toLocaleString()}</p>
            <p className="stat-subtitle">PPTX, PDF, HTML</p>
          </div>
        </div>

        {/* Documents */}
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Documents</h3>
            <p className="stat-number">{stats.content.documents.toLocaleString()}</p>
            <p className="stat-subtitle">DOCX, PDF, Markdown</p>
          </div>
        </div>

        {/* Websites */}
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <h3>Websites</h3>
            <p className="stat-number">{stats.content.websites.toLocaleString()}</p>
            <p className="stat-subtitle">Generated websites</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            📧 Send Announcement
          </button>
          <button className="action-btn">
            📊 Export Data
          </button>
          <button className="action-btn">
            🔄 Refresh Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
