import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PricingSettings = ({ token }) => {
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

  const handlePricingChange = (plan, field, value) => {
    setSettings(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [plan]: {
          ...prev.pricing[plan],
          [field]: field.includes('Price') ? parseInt(value) || 0 : value,
        },
      },
    }));
  };

  const handleFeatureChange = (plan, feature, value) => {
    setSettings(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [plan]: {
          ...prev.pricing[plan],
          features: {
            ...prev.pricing[plan].features,
            [feature]: value,
          },
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await axios.put(
        '/api/admin/settings/pricing',
        { pricing: settings.pricing },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('Pricing updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating pricing: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading pricing settings...</div>;

  const plans = ['free', 'starter', 'professional', 'business', 'agency'];

  return (
    <div className="pricing-settings">
      {message && (
        <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="pricing-plans">
        {plans.map(plan => (
          <div key={plan} className="plan-card">
            <h3 className="plan-name">{plan.charAt(0).toUpperCase() + plan.slice(1)}</h3>

            <div className="plan-section">
              <h4>💰 Pricing</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={settings.pricing[plan].monthlyPrice}
                    onChange={(e) => handlePricingChange(plan, 'monthlyPrice', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Annual Price (₹/month)</label>
                  <input
                    type="number"
                    value={settings.pricing[plan].annualPrice}
                    onChange={(e) => handlePricingChange(plan, 'annualPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Monthly Credits</label>
                <input
                  type="number"
                  value={settings.pricing[plan].credits}
                  onChange={(e) => handlePricingChange(plan, 'credits', e.target.value)}
                />
              </div>
            </div>

            <div className="plan-section">
              <h4>✨ Features</h4>
              <div className="form-group">
                <label>Max Videos</label>
                <input
                  type="number"
                  value={settings.pricing[plan].features.maxVideos}
                  onChange={(e) => handleFeatureChange(plan, 'maxVideos', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Max Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.pricing[plan].features.maxDuration}
                  onChange={(e) => handleFeatureChange(plan, 'maxDuration', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Team Members</label>
                <input
                  type="number"
                  value={settings.pricing[plan].features.teamMembers}
                  onChange={(e) => handleFeatureChange(plan, 'teamMembers', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.pricing[plan].features.watermark}
                    onChange={(e) => handleFeatureChange(plan, 'watermark', e.target.checked)}
                  />
                  Watermark
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.pricing[plan].features.customBranding}
                    onChange={(e) => handleFeatureChange(plan, 'customBranding', e.target.checked)}
                  />
                  Custom Branding
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.pricing[plan].features.apiAccess}
                    onChange={(e) => handleFeatureChange(plan, 'apiAccess', e.target.checked)}
                  />
                  API Access
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-actions">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default PricingSettings;
