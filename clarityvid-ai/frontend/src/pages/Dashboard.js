import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoAPI, subscriptionAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [videosRes, subRes] = await Promise.all([
        videoAPI.getAll({ limit: 5 }),
        subscriptionAPI.getCurrent(),
      ]);

      setVideos(videosRes.data.videos);
      setSubscription(subRes.data.subscription);

      const total = videosRes.data.count;
      const processing = videosRes.data.videos.filter(v => v.status === 'processing').length;
      const completed = videosRes.data.videos.filter(v => v.status === 'completed').length;
      setStats({ total, processing, completed });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  const availableCredits = subscription ? subscription.credits - subscription.creditsUsed : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>ClarityVid AI</h1>
              <p>AI-Powered Video Generation Platform</p>
            </div>
            <div className="header-actions">
              <Link to="/create" className="btn btn-primary">Create New Video</Link>
              <Link to="/pricing" className="btn btn-secondary">Upgrade Plan</Link>
              <button onClick={logout} className="btn btn-outline">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="welcome-section">
            <h2>Welcome back, {user?.firstName}!</h2>
            <p>Create professional whiteboard animation videos from your documents in minutes.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Videos</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <div className="stat-info">
                <h3>{stats.processing}</h3>
                <p>Processing</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <h3>{availableCredits}</h3>
                <p>Available Credits</p>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Recent Videos</h3>
              <Link to="/videos" className="btn btn-sm btn-secondary">View All</Link>
            </div>

            {videos.length === 0 ? (
              <div className="empty-state">
                <p>No videos yet. Create your first video to get started!</p>
                <Link to="/create" className="btn btn-primary">Create Video</Link>
              </div>
            ) : (
              <div className="videos-list">
                {videos.map(video => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} />
                      ) : (
                        <div className="placeholder">📹</div>
                      )}
                    </div>
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.description || 'No description'}</p>
                      <div className="video-meta">
                        <span className={`status ${video.status}`}>{video.status}</span>
                        <span>{Math.floor(video.duration / 60)}:{video.duration % 60}s</span>
                      </div>
                    </div>
                    <div className="video-actions">
                      {video.status === 'completed' && (
                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                          View
                        </a>
                      )}
                      {video.status === 'draft' && (
                        <Link to={`/videos/${video.id}/edit`} className="btn btn-sm btn-secondary">
                          Continue
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Current Plan</h3>
            </div>
            <div className="plan-card">
              <div className="plan-info">
                <h4>{subscription?.plan.toUpperCase()} Plan</h4>
                <p>{subscription?.monthlyCredits} credits per month</p>
                <div className="plan-usage">
                  <div className="usage-bar">
                    <div
                      className="usage-fill"
                      style={{ width: `${(subscription?.creditsUsed / subscription?.credits) * 100}%` }}
                    />
                  </div>
                  <p>{subscription?.creditsUsed} / {subscription?.credits} credits used</p>
                </div>
              </div>
              <Link to="/pricing" className="btn btn-outline">Upgrade Plan</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
