import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiKeysSettings = ({ token }) => {
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

  const handleApiKeyChange = (provider, field, value) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: {
          ...prev.apiKeys[provider],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await axios.put(
        '/api/admin/settings/api-keys',
        { apiKeys: settings.apiKeys },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('⚠️ API Keys updated in database. Remember to also update your environment variables (.env file) on the server!');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Error updating API keys: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading API keys settings...</div>;

  return (
    <div className="api-keys-settings">
      {message && (
        <div className={`admin-message ${message.includes('Error') ? 'error' : 'warning'}`}>
          {message}
        </div>
      )}

      <div className="api-warning">
        <strong>⚠️ Important Security Notice:</strong>
        <p>
          API keys are stored masked in the database for display purposes only.
          Actual API keys must be configured in your environment variables (.env file).
          Changes here only update the reference values shown in the admin panel.
        </p>
      </div>

      {/* Razorpay */}
      <div className="api-section">
        <h3>💳 Razorpay (Payment Gateway)</h3>
        <div className="form-group">
          <label>Key ID</label>
          <input
            type="text"
            value={settings.apiKeys.razorpay.keyId}
            onChange={(e) => handleApiKeyChange('razorpay', 'keyId', e.target.value)}
            placeholder="rzp_live_xxxxxxxxxx"
          />
          <small>Razorpay Key ID (visible)</small>
        </div>
        <div className="form-group">
          <label>Key Secret</label>
          <input
            type="password"
            value={settings.apiKeys.razorpay.keySecret}
            onChange={(e) => handleApiKeyChange('razorpay', 'keySecret', e.target.value)}
            placeholder="••••••••"
            disabled
          />
          <small>⚠️ Update RAZORPAY_KEY_SECRET in .env file</small>
        </div>
        <div className="form-group">
          <label>Webhook Secret</label>
          <input
            type="password"
            value={settings.apiKeys.razorpay.webhookSecret}
            onChange={(e) => handleApiKeyChange('razorpay', 'webhookSecret', e.target.value)}
            placeholder="••••••••"
            disabled
          />
          <small>⚠️ Update RAZORPAY_WEBHOOK_SECRET in .env file</small>
        </div>
      </div>

      {/* Anthropic Claude */}
      <div className="api-section">
        <h3>🤖 Anthropic Claude (AI)</h3>
        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            value={settings.apiKeys.anthropic.apiKey}
            onChange={(e) => handleApiKeyChange('anthropic', 'apiKey', e.target.value)}
            placeholder="sk-ant-••••••••"
            disabled
          />
          <small>⚠️ Update ANTHROPIC_API_KEY in .env file</small>
        </div>
        <div className="form-group">
          <label>Model</label>
          <select
            value={settings.apiKeys.anthropic.model}
            onChange={(e) => handleApiKeyChange('anthropic', 'model', e.target.value)}
          >
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
          </select>
          <small>Select the Claude model to use</small>
        </div>
      </div>

      {/* Firebase */}
      <div className="api-section">
        <h3>🔥 Firebase</h3>
        <div className="form-group">
          <label>Project ID</label>
          <input
            type="text"
            value={settings.apiKeys.firebase.projectId}
            disabled
            placeholder="your-project-id"
          />
          <small>Firebase Project ID (read-only)</small>
        </div>
        <div className="form-group">
          <label>Storage Bucket</label>
          <input
            type="text"
            value={settings.apiKeys.firebase.storageBucket}
            disabled
            placeholder="your-project.appspot.com"
          />
          <small>Firebase Storage Bucket (read-only)</small>
        </div>
      </div>

      <div className="api-actions">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : '💾 Save Configuration'}
        </button>
      </div>

      <div className="api-help">
        <h4>📚 Where to update actual API keys:</h4>
        <ol>
          <li>Connect to your server (SSH or Firebase Console)</li>
          <li>Edit the <code>.env</code> file in the backend folder</li>
          <li>Update the respective environment variables</li>
          <li>Restart the server or redeploy: <code>firebase deploy</code></li>
        </ol>
      </div>
    </div>
  );
};

export default ApiKeysSettings;
