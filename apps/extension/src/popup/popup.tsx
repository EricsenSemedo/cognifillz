import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import './popup.css';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  summary: string;
}

interface DetectedField {
  type: string;
  label: string;
  confidence: number;
}

type ToastType = 'success' | 'error';

const FIELD_ICONS: Record<string, string> = {
  firstName: '👤',
  lastName: '👤',
  email: '✉',
  phone: '☎',
  linkedin: '🔗',
  location: '📍',
  company: '🏢',
  resume: '📄',
  default: '◈',
};

function getFieldIcon(type: string): string {
  return FIELD_ICONS[type] || FIELD_ICONS.default;
}

function getConfidenceClass(c: number): string {
  if (c >= 0.8) return 'confidence-high';
  if (c >= 0.5) return 'confidence-mid';
  return 'confidence-low';
}

function getInitials(first: string, last: string): string {
  return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}` || '?';
}

const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Profile>({
    firstName: '', lastName: '', email: '', phone: '',
    linkedin: '', github: '', portfolio: '', location: '', summary: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'analyze'>('profile');
  const [toast, setToast] = useState<{ msg: string; type: ToastType; visible: boolean }>({
    msg: '', type: 'success', visible: false,
  });

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2400);
  }, []);

  useEffect(() => {
    loadProfile();
    loadDetectedFields();
  }, []);

  const loadProfile = async () => {
    try {
      const response: any = await browser.runtime.sendMessage({ action: 'getProfile' });
      if (response.success && response.profile) {
        setProfile(response.profile);
        setFormData(response.profile);
      } else {
        setIsEditing(true);
      }
    } catch {
      setIsEditing(true);
    }
  };

  const loadDetectedFields = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response: any = await browser.tabs.sendMessage(tab.id, { action: 'getDetectedFields' });
        if (response?.fields) {
          setDetectedFields(response.fields);
        }
      }
    } catch { /* content script not loaded */ }
  };

  const saveProfile = async () => {
    try {
      const response: any = await browser.runtime.sendMessage({ action: 'saveProfile', profile: formData });
      if (response.success) {
        setProfile(formData);
        setIsEditing(false);
        showToast('Profile saved');
      } else {
        showToast('Save failed: ' + response.error, 'error');
      }
    } catch (e: any) {
      showToast('Save failed', 'error');
    }
  };

  const fillFields = async () => {
    if (!profile) {
      showToast('Create a profile first', 'error');
      return;
    }
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response: any = await browser.tabs.sendMessage(
          tab.id, { action: 'fillFields', profileData: profile }
        );
        if (response?.success) {
          showToast(`Filled ${response.filledCount} fields`);
        } else {
          showToast('Could not fill fields', 'error');
        }
      }
    } catch {
      showToast('No fillable page detected', 'error');
    }
  };

  const analyzeJob = () => showToast('Job analysis coming soon');

  const updateForm = (key: keyof Profile, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const startEditing = () => {
    if (profile) setFormData(profile);
    setIsEditing(true);
  };

  // ── Edit / Create Profile ───────────────────
  if (isEditing || !profile) {
    return (
      <div className="container">
        <header className="header">
          <div className="header-logo">🧠</div>
          <div className="header-text">
            <h1>CogniFillz</h1>
            <span className="tagline">Cranium Inc.</span>
          </div>
          {profile && (
            <button className="back-btn" onClick={() => setIsEditing(false)}>
              ← Back
            </button>
          )}
        </header>

        <div className="content">
          <h2 className="section-title slide-in">
            {profile ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <p className="section-subtitle slide-in stagger-1">
            Your info is stored locally and never leaves your device.
          </p>

          <div className="form">
            <div className="form-row slide-in stagger-1">
              <div className="input-group">
                <label className="input-label">First name</label>
                <input className="input" type="text" placeholder="Jane"
                  value={formData.firstName}
                  onChange={e => updateForm('firstName', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Last name</label>
                <input className="input" type="text" placeholder="Doe"
                  value={formData.lastName}
                  onChange={e => updateForm('lastName', e.target.value)} />
              </div>
            </div>

            <div className="form-row slide-in stagger-2">
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" type="email" placeholder="jane@email.com"
                  value={formData.email}
                  onChange={e => updateForm('email', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input className="input" type="tel" placeholder="+1 555-0123"
                  value={formData.phone}
                  onChange={e => updateForm('phone', e.target.value)} />
              </div>
            </div>

            <div className="input-group slide-in stagger-2">
              <label className="input-label">LinkedIn</label>
              <input className="input" type="url" placeholder="linkedin.com/in/janedoe"
                value={formData.linkedin}
                onChange={e => updateForm('linkedin', e.target.value)} />
            </div>

            <div className="form-row slide-in stagger-3">
              <div className="input-group">
                <label className="input-label">GitHub</label>
                <input className="input" type="url" placeholder="github.com/jane"
                  value={formData.github}
                  onChange={e => updateForm('github', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Portfolio</label>
                <input className="input" type="url" placeholder="janedoe.dev"
                  value={formData.portfolio}
                  onChange={e => updateForm('portfolio', e.target.value)} />
              </div>
            </div>

            <div className="input-group slide-in stagger-3">
              <label className="input-label">Location</label>
              <input className="input" type="text" placeholder="San Francisco, CA"
                value={formData.location}
                onChange={e => updateForm('location', e.target.value)} />
            </div>

            <div className="input-group slide-in stagger-4">
              <label className="input-label">Summary</label>
              <textarea className="textarea" rows={3}
                placeholder="Brief professional summary…"
                value={formData.summary}
                onChange={e => updateForm('summary', e.target.value)} />
            </div>

            <button className="btn btn-primary slide-in stagger-4" onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        </div>

        <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
      </div>
    );
  }

  // ── Main View ───────────────────────────────
  return (
    <div className="container">
      <header className="header">
        <div className="header-logo">🧠</div>
        <div className="header-text">
          <h1>CogniFillz</h1>
          <span className="tagline">Cranium Inc.</span>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          Ready
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={`tab ${activeTab === 'analyze' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analyze')}>
          Analyze
        </button>
      </div>

      <div className="content" key={activeTab}>
        {activeTab === 'profile' ? (
          <>
            <div className="card slide-in">
              <div className="profile-card">
                <div className="profile-avatar">
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
                <div className="profile-details">
                  <h3>{profile.firstName} {profile.lastName}</h3>
                  <p className="profile-email">{profile.email}</p>
                  <p>{profile.location}</p>
                </div>
              </div>
            </div>

            <div className="card slide-in stagger-1">
              <div className="card-header">
                <span className="card-title">Detected Fields</span>
                {detectedFields.length > 0 && (
                  <span className="card-badge">{detectedFields.length}</span>
                )}
              </div>
              {detectedFields.length > 0 ? (
                <ul className="field-list">
                  {detectedFields.map((field, idx) => (
                    <li key={idx} className="field-item">
                      <span className="field-type">
                        <span className="field-icon">{getFieldIcon(field.type)}</span>
                        {field.type}
                      </span>
                      <span className={`field-confidence ${getConfidenceClass(field.confidence)}`}>
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">◇</div>
                  Navigate to a job application page<br />to detect fillable fields
                </div>
              )}
            </div>

            <div className="actions slide-in stagger-2">
              <button className="btn btn-primary" onClick={fillFields}>
                ⚡ Autofill Application
              </button>
              <button className="btn btn-secondary" onClick={startEditing}>
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <div className="card slide-in">
            <div className="analyze-card">
              <div className="analyze-icon">◆</div>
              <h4 className="analyze-title">Job Match Analysis</h4>
              <p className="analyze-desc">
                Compare your profile against the current job posting using local AI.
                No data leaves your machine.
              </p>
              <button className="btn btn-primary" onClick={analyzeJob}>
                Analyze with AI
              </button>
              <div className="info-box">
                <span>⚡</span>
                Requires LM Studio running on localhost:1234
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
};

const Toast: React.FC<{ msg: string; type: ToastType; visible: boolean }> = ({ msg, type, visible }) => (
  <div className={`toast toast-${type} ${visible ? 'toast-visible' : ''}`}>
    <span>{type === 'success' ? '✓' : '✕'}</span>
    {msg}
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
