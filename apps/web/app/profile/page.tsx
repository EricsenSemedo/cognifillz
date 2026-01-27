'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  summary?: string;
  experience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
}

interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'education' | 'skills'>('basic');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // TODO: Get user session first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // TODO: Get user session first
      const { error } = await supabase
        .from('profiles')
        .upsert(profile);

      if (error) throw error;

      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experience: [
        ...(profile.experience || []),
        {
          company: '',
          title: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...(profile.education || []),
        {
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }
      ]
    });
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), skill]
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🧠</span>
            <h1 className="text-2xl font-bold text-gray-900">CogniFillz</h1>
          </Link>
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/profile" className="px-4 py-2 text-blue-600 font-semibold">
              Profile
            </Link>
            <Link href="/applications" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Applications
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <div className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'basic'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'experience'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Experience
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'education'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'skills'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Skills
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <>
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile.location || ''}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={profile.linkedin || ''}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={profile.github || ''}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        placeholder="https://github.com/yourusername"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        value={profile.portfolio || ''}
                        onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Summary
                      </label>
                      <textarea
                        value={profile.summary || ''}
                        onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                        rows={6}
                        placeholder="A brief summary of your professional background and career goals..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    {(profile.experience || []).map((exp, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx].company = e.target.value;
                              setProfile({ ...profile, experience: newExp });
                            }}
                            placeholder="Company Name"
                            className="px-4 py-2 border rounded-lg"
                          />
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx].title = e.target.value;
                              setProfile({ ...profile, experience: newExp });
                            }}
                            placeholder="Job Title"
                            className="px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const newExp = [...(profile.experience || [])];
                            newExp[idx].description = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          rows={3}
                          placeholder="Job description..."
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addExperience}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      + Add Experience
                    </button>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    {(profile.education || []).map((edu, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => {
                              const newEdu = [...(profile.education || [])];
                              newEdu[idx].school = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="School Name"
                            className="px-4 py-2 border rounded-lg"
                          />
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...(profile.education || [])];
                              newEdu[idx].degree = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="Degree"
                            className="px-4 py-2 border rounded-lg"
                          />
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => {
                              const newEdu = [...(profile.education || [])];
                              newEdu[idx].field = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="Field of Study"
                            className="px-4 py-2 border rounded-lg"
                          />
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => {
                              const newEdu = [...(profile.education || [])];
                              newEdu[idx].gpa = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="GPA (optional)"
                            className="px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addEducation}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      + Add Education
                    </button>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(profile.skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => {
                              const newSkills = profile.skills?.filter((_, i) => i !== idx);
                              setProfile({ ...profile, skills: newSkills });
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={addSkill}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      + Add Skill
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
