import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface PipelineCounts {
  applied: number;
  screening: number;
  interview: number;
  offer: number;
}

type ToastType = 'success' | 'error';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'FN', lastName: 'LN', email: 'EM', phone: 'PH',
  linkedin: 'LI', location: 'LC', company: 'CO', resume: 'CV',
};

function getFieldLabel(type: string): string {
  return FIELD_LABELS[type] || type.slice(0, 2).toUpperCase();
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
  const [dark, setDark] = useState(true);
  const [pipeline, setPipeline] = useState<PipelineCounts>({ applied: 0, screening: 0, interview: 0, offer: 0 });
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType; visible: boolean }>({
    msg: '', type: 'success', visible: false,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type, visible: true });
    toastTimer.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2400);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    browser.storage.local.get('cognifillz-dark').then((result) => {
      const stored = result['cognifillz-dark'];
      const isDark = stored === undefined ? true : Boolean(stored);
      setDark(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    });
    loadProfile();
    loadDetectedFields();
    loadPipeline();
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    browser.storage.local.set({ 'cognifillz-dark': next });
  };

  const loadProfile = async () => {
    try {
      const response: any = await browser.runtime.sendMessage({ action: 'getProfile' });
      if (response.success && response.profile) {
        setProfile(response.profile);
        setFormData(response.profile);
      } else {
        setIsEditing(true);
      }
    } catch { setIsEditing(true); }
  };

  const loadDetectedFields = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response: any = await browser.tabs.sendMessage(tab.id, { action: 'getDetectedFields' });
        if (response?.fields) setDetectedFields(response.fields);
      }
    } catch { /* content script not loaded */ }
  };

  const loadPipeline = async () => {
    try {
      const result = await browser.storage.local.get('cognifillz-pipeline');
      if (result['cognifillz-pipeline']) {
        setPipeline(result['cognifillz-pipeline'] as PipelineCounts);
      }
    } catch { /* no pipeline data yet */ }
  };

  const saveProfile = async () => {
    try {
      const response: any = await browser.runtime.sendMessage({ action: 'saveProfile', profile: formData });
      if (response.success) { setProfile(formData); setIsEditing(false); showToast('Profile saved'); }
      else showToast('Save failed', 'error');
    } catch { showToast('Save failed', 'error'); }
  };

  const fillFields = async () => {
    if (!profile) { showToast('Create a profile first', 'error'); return; }
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response: any = await browser.tabs.sendMessage(tab.id, { action: 'fillFields', profileData: profile });
        if (response?.success) showToast(`Filled ${response.filledCount} fields`);
        else showToast('Could not fill fields', 'error');
      }
    } catch { showToast('No fillable page detected', 'error'); }
  };

  const handleTabSwitch = (tab: 'profile' | 'analyze') => {
    setActiveTab(tab);
    if (tab === 'profile') loadDetectedFields();
  };

  const analyzeJob = () => showToast('Job analysis coming soon');
  const updateForm = (key: keyof Profile, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const startEditing = () => { if (profile) setFormData(profile); setIsEditing(true); };

  const headerBlock = (
    <header className="header">
      <div className="logo-mark">CF</div>
      <div>
        <div className="brand neon">CogniFillz</div>
        <span className="tagline">Cranium Inc.</span>
      </div>
      <div className="header-right">
        <button className="theme-toggle" onClick={toggleDark} aria-label="Toggle dark mode">
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  );

  const pipelineBlock = (
    <div className="pipeline" role="status" aria-label="Application pipeline">
      <div className="pip-stage"><span className="pip-count">{pipeline.applied}</span><span className="pip-label">Applied</span></div>
      <div className="pip-stage"><span className="pip-count">{pipeline.screening}</span><span className="pip-label">Screen</span></div>
      <div className="pip-stage"><span className="pip-count">{pipeline.interview}</span><span className="pip-label">Interview</span></div>
      <div className="pip-stage"><span className="pip-count">{pipeline.offer}</span><span className="pip-label">Offer</span></div>
    </div>
  );

  if (isEditing || !profile) {
    return (
      <div className="container">
        {headerBlock}
        <div className="content">
          <div className="form-header">
            <h2 className="section-title slide-in">{profile ? 'Edit Profile' : 'Create Profile'}</h2>
            {profile && <button className="back-btn" onClick={() => setIsEditing(false)}>Back</button>}
          </div>
          <p className="section-subtitle slide-in stagger-1">Stored locally. Never leaves your device.</p>
          <div className="form">
            <div className="form-row slide-in stagger-1">
              <div className="input-group"><label className="input-label">First name</label><input className="input" type="text" placeholder="Jane" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Last name</label><input className="input" type="text" placeholder="Doe" value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} /></div>
            </div>
            <div className="form-row slide-in stagger-2">
              <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" placeholder="jane@email.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Phone</label><input className="input" type="tel" placeholder="+1 555-0123" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
            </div>
            <div className="input-group slide-in stagger-2"><label className="input-label">LinkedIn</label><input className="input" type="url" placeholder="linkedin.com/in/janedoe" value={formData.linkedin} onChange={e => updateForm('linkedin', e.target.value)} /></div>
            <div className="form-row slide-in stagger-3">
              <div className="input-group"><label className="input-label">GitHub</label><input className="input" type="url" placeholder="github.com/jane" value={formData.github} onChange={e => updateForm('github', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Portfolio</label><input className="input" type="url" placeholder="janedoe.dev" value={formData.portfolio} onChange={e => updateForm('portfolio', e.target.value)} /></div>
            </div>
            <div className="input-group slide-in stagger-3"><label className="input-label">Location</label><input className="input" type="text" placeholder="San Francisco, CA" value={formData.location} onChange={e => updateForm('location', e.target.value)} /></div>
            <div className="input-group slide-in stagger-4"><label className="input-label">Summary</label><textarea className="textarea" rows={3} placeholder="Brief professional summary..." value={formData.summary} onChange={e => updateForm('summary', e.target.value)} /></div>
            <button className="btn btn-primary slide-in stagger-4" onClick={saveProfile}>Save Profile</button>
          </div>
        </div>
        <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
      </div>
    );
  }

  return (
    <div className="container">
      {headerBlock}
      {pipelineBlock}
      <div className="tabs" role="tablist">
        <button className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} role="tab" aria-selected={activeTab === 'profile'} onClick={() => handleTabSwitch('profile')}>Profile</button>
        <button className={`tab ${activeTab === 'analyze' ? 'tab-active' : ''}`} role="tab" aria-selected={activeTab === 'analyze'} onClick={() => handleTabSwitch('analyze')}>Analyze</button>
      </div>
      <div className="content" role="tabpanel">
        {activeTab === 'profile' ? (
          <>
            <div className="card slide-in">
              <div className="profile-card">
                <div className="profile-avatar">{getInitials(profile.firstName, profile.lastName)}</div>
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
                {detectedFields.length > 0 && <span className="card-badge">{detectedFields.length}</span>}
              </div>
              {detectedFields.length > 0 ? (
                <ul className="field-list">
                  {detectedFields.map((field, idx) => (
                    <li key={idx} className="field-item">
                      <span className="field-type"><span className="field-icon">{getFieldLabel(field.type)}</span>{field.type}</span>
                      <span className={`field-confidence ${getConfidenceClass(field.confidence)}`}>{(field.confidence * 100).toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-mark">//</div>
                  Navigate to a job application page<br />to detect fillable fields
                </div>
              )}
            </div>
            <div className="actions slide-in stagger-2">
              <button className="btn btn-primary" onClick={fillFields}>Autofill Application</button>
              <button className="btn btn-secondary" onClick={startEditing}>Edit Profile</button>
            </div>
            {matchScore !== null && (
              <div className="match-bar slide-in stagger-2">
                <div>
                  <div className="match-pct">{matchScore}%</div>
                </div>
                <div className="match-meta">
                  <div className="match-label">AI Resume Match</div>
                  <div className="match-track"><div className="match-fill" style={{ width: `${matchScore}%` }}></div></div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card slide-in">
            <div className="analyze-card">
              <div className="analyze-mark neon">AI</div>
              <h4 className="analyze-title">Job Match Analysis</h4>
              <p className="analyze-desc">Compare your profile against the current job posting using local AI. No data leaves your machine.</p>
              <button className="btn btn-primary" onClick={analyzeJob}>Analyze with AI</button>
              <div className="info-box">Requires LM Studio running on localhost:1234</div>
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
};

const Toast: React.FC<{ msg: string; type: ToastType; visible: boolean }> = ({ msg, type, visible }) => (
  <div className={`toast toast-${type} ${visible ? 'toast-visible' : ''}`}>{msg}</div>
);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');
const root = createRoot(rootEl);
root.render(<App />);
