'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted';
  matchScore?: number;
  appliedAt?: string;
  notes?: string;
  jobDescription?: string;
  missingKeywords?: string[];
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredApps(applications);
    } else {
      setFilteredApps(applications.filter(app => app.status === filterStatus));
    }
  }, [filterStatus, applications]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setApplications(data);
        setFilteredApps(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));

      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      case 'saved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Link href="/profile" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Profile
            </Link>
            <Link href="/applications" className="px-4 py-2 text-blue-600 font-semibold">
              Applications
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== 'all' 
                ? `No applications with status "${filterStatus}"`
                : 'Start applying to jobs with the browser extension!'}
            </p>
            <Link 
              href="/download"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download Extension
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition hover:shadow-md ${
                    selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {app.jobTitle}
                      </h3>
                      <p className="text-gray-600">{app.companyName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {app.appliedAt && (
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    )}
                    {app.matchScore && (
                      <span className="font-medium text-blue-600">
                        Match: {app.matchScore}%
                      </span>
                    )}
                  </div>

                  {app.notes && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {app.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Application Details */}
            <div className="lg:col-span-1">
              {selectedApp ? (
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Application Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={selectedApp.status}
                        onChange={(e) => updateApplicationStatus(selectedApp.id, e.target.value as Application['status'])}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Accepted</option>
                      </select>
                    </div>

                    {selectedApp.jobUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Posting
                        </label>
                        <a
                          href={selectedApp.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm break-all"
                        >
                          View Original Posting →
                        </a>
                      </div>
                    )}

                    {selectedApp.matchScore && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Match Score
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all"
                              style={{ width: `${selectedApp.matchScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-blue-600">
                            {selectedApp.matchScore}%
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedApp.missingKeywords && selectedApp.missingKeywords.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Missing Keywords
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.missingKeywords.slice(0, 10).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApp.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {selectedApp.notes}
                        </p>
                      </div>
                    )}

                    {selectedApp.appliedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Applied Date
                        </label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedApp.appliedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">👆</div>
                  <p>Select an application to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
