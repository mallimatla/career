import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeaturesSettings = ({ token }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [field]: value,
      },
    }));
  };

  const handleLimitChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleEmailChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: value,
      },
    }));
  };

  const handleSaveFeatures = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await axios.put(
        '/api/admin/settings/features',
        { features: settings.features },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('Features updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating features: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLimits = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await axios.put(
        '/api/admin/settings/limits',
        { limits: settings.limits },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('Limits updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating limits: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await axios.put(
        '/api/admin/settings/email',
        { email: settings.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('Email settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating email settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading features settings...</div>;

  return (
    <div className="features-settings">
      {message && (
        <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Platform Features */}
      <div className="settings-section">
        <h3>⚙️ Platform Features</h3>
        <div className="feature-toggles">
          <div className="feature-toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.features.enableApiAccess}
                onChange={(e) => handleFeatureChange('enableApiAccess', e.target.checked)}
              />
              <span>Enable API Access</span>
            </label>
            <small>Allow users with API access plan feature to use the API</small>
          </div>

          <div className="feature-toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.features.enableTeamFeatures}
                onChange={(e) => handleFeatureChange('enableTeamFeatures', e.target.checked)}
              />
              <span>Enable Team Features</span>
            </label>
            <small>Allow users to create and collaborate in teams</small>
          </div>

          <div className="feature-toggle">
            <label>
              <input
                type="checkbox"
                checked={settings.features.enableWebhooks}
                onChange={(e) => handleFeatureChange('enableWebhooks', e.target.checked)}
              />
              <span>Enable Webhooks</span>
            </label>
            <small>Allow webhook notifications for events</small>
          </div>

          <div className="feature-toggle maintenance">
            <label>
              <input
                type="checkbox"
                checked={settings.features.maintenanceMode}
                onChange={(e) => handleFeatureChange('maintenanceMode', e.target.checked)}
              />
              <span>🔧 Maintenance Mode</span>
            </label>
            <small>⚠️ Put platform in maintenance mode (users cannot access)</small>
          </div>
        </div>

        <button onClick={handleSaveFeatures} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : '💾 Save Features'}
        </button>
      </div>

      {/* Platform Limits */}
      <div className="settings-section">
        <h3>🚦 Platform Limits</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Max File Size (MB)</label>
            <input
              type="number"
              value={settings.limits.maxFileSize}
              onChange={(e) => handleLimitChange('maxFileSize', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Max Video Duration (minutes)</label>
            <input
              type="number"
              value={settings.limits.maxVideoDuration}
              onChange={(e) => handleLimitChange('maxVideoDuration', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Rate Limit Window (minutes)</label>
            <input
              type="number"
              value={settings.limits.rateLimitWindow}
              onChange={(e) => handleLimitChange('rateLimitWindow', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Rate Limit Max Requests</label>
            <input
              type="number"
              value={settings.limits.rateLimitMaxRequests}
              onChange={(e) => handleLimitChange('rateLimitMaxRequests', e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSaveLimits} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : '💾 Save Limits'}
        </button>
      </div>

      {/* Email Configuration */}
      <div className="settings-section">
        <h3>📧 Email Configuration</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>SMTP Host</label>
            <input
              type="text"
              value={settings.email.smtpHost}
              onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>SMTP Port</label>
            <input
              type="number"
              value={settings.email.smtpPort}
              onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>SMTP User</label>
            <input
              type="text"
              value={settings.email.smtpUser}
              onChange={(e) => handleEmailChange('smtpUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email From</label>
            <input
              type="email"
              value={settings.email.emailFrom}
              onChange={(e) => handleEmailChange('emailFrom', e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSaveEmail} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : '💾 Save Email Settings'}
        </button>
      </div>
    </div>
  );
};

export default FeaturesSettings;
