import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'analyze'>('profile');

  useEffect(() => {
    loadProfile();
    loadDetectedFields();
  }, []);

  const loadProfile = async () => {
    const response: any = await browser.runtime.sendMessage({ action: 'getProfile' });
    if (response.success && response.profile) {
      setProfile(response.profile);
    } else {
      setIsEditing(true); // Show form if no profile exists
    }
  };

  const loadDetectedFields = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    if (tab.id) {
      const response: any = await browser.tabs.sendMessage(tab.id, { action: 'getDetectedFields' });
      if (response && response.fields) {
        setDetectedFields(response.fields);
      }
    }
  };

  const saveProfile = async () => {
    const response: any = await browser.runtime.sendMessage({ action: 'saveProfile', profile });
    if (response.success) {
      setIsEditing(false);
      alert('Profile saved successfully!');
    } else {
      alert('Failed to save profile: ' + response.error);
    }
  };

  const fillFields = async () => {
    if (!profile) {
      alert('Please create a profile first');
      return;
    }

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    if (tab.id) {
      const response: any = await browser.tabs.sendMessage(
        tab.id,
        { action: 'fillFields', profileData: profile }
      );
      if (response && response.success) {
        alert(`Filled ${response.filledCount} fields!`);
      } else {
        alert('Failed to fill fields');
      }
    }
  };

  const analyzeJob = async () => {
    // TODO: Scrape job description from page and send to LLM
    alert('Job analysis coming soon!');
  };

  if (isEditing || !profile) {
    return (
      <div className="container">
        <header className="header">
          <h1>🧠 CogniFillz</h1>
          <p className="subtitle">by Cranium Inc.</p>
        </header>

        <div className="content">
          <h2 className="section-title">Create Your Profile</h2>
          
          <div className="form">
            <input
              className="input"
              type="text"
              placeholder="First Name"
              defaultValue={profile?.firstName || ''}
              onChange={(e) => setProfile({ ...profile!, firstName: e.target.value })}
            />
            
            <input
              className="input"
              type="text"
              placeholder="Last Name"
              defaultValue={profile?.lastName || ''}
              onChange={(e) => setProfile({ ...profile!, lastName: e.target.value })}
            />
            
            <input
              className="input"
              type="email"
              placeholder="Email"
              defaultValue={profile?.email || ''}
              onChange={(e) => setProfile({ ...profile!, email: e.target.value })}
            />
            
            <input
              className="input"
              type="tel"
              placeholder="Phone"
              defaultValue={profile?.phone || ''}
              onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
            />
            
            <input
              className="input"
              type="url"
              placeholder="LinkedIn URL"
              defaultValue={profile?.linkedin || ''}
              onChange={(e) => setProfile({ ...profile!, linkedin: e.target.value })}
            />
            
            <input
              className="input"
              type="url"
              placeholder="GitHub URL"
              defaultValue={profile?.github || ''}
              onChange={(e) => setProfile({ ...profile!, github: e.target.value })}
            />
            
            <input
              className="input"
              type="url"
              placeholder="Portfolio URL"
              defaultValue={profile?.portfolio || ''}
              onChange={(e) => setProfile({ ...profile!, portfolio: e.target.value })}
            />
            
            <input
              className="input"
              type="text"
              placeholder="Location"
              defaultValue={profile?.location || ''}
              onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
            />
            
            <textarea
              className="textarea"
              placeholder="Professional Summary"
              rows={4}
              defaultValue={profile?.summary || ''}
              onChange={(e) => setProfile({ ...profile!, summary: e.target.value })}
            />
            
            <button className="button button-primary" onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🧠 CogniFillz</h1>
        <p className="subtitle">by Cranium Inc.</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'analyze' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          Analyze
        </button>
      </div>

      <div className="content">
        {activeTab === 'profile' ? (
          <>
            <div className="profile-info">
              <h3>{profile.firstName} {profile.lastName}</h3>
              <p>{profile.email}</p>
              <p>{profile.location}</p>
            </div>

            <div className="detected-fields">
              <h4 className="section-title">Detected Fields ({detectedFields.length})</h4>
              {detectedFields.length > 0 ? (
                <ul className="field-list">
                  {detectedFields.map((field, idx) => (
                    <li key={idx} className="field-item">
                      <span className="field-type">{field.type}</span>
                      <span className="field-confidence">
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">Navigate to a job application to detect fields</p>
              )}
            </div>

            <div className="actions">
              <button className="button button-primary" onClick={fillFields}>
                🚀 Autofill Application
              </button>
              <button className="button button-secondary" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="analyze-section">
              <h4 className="section-title">Job Match Analysis</h4>
              <p className="info-text">
                Analyze how well your profile matches the current job posting
              </p>
              
              <button className="button button-primary" onClick={analyzeJob}>
                🧠 Analyze with AI
              </button>
              
              <div className="info-box">
                <strong>Note:</strong> Make sure LM Studio is running on localhost:1234
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
