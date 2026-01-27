'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
  matchScore?: number;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviewing: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      // TODO: Get user session first
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setApplications(data);
        
        // Calculate stats
        const stats = {
          total: data.length,
          applied: data.filter(a => a.status === 'applied').length,
          interviewing: data.filter(a => a.status === 'interviewing').length,
          rejected: data.filter(a => a.status === 'rejected').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
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
            <Link href="/dashboard" className="px-4 py-2 text-blue-600 font-semibold">
              Dashboard
            </Link>
            <Link href="/profile" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Profile
            </Link>
            <Link href="/applications" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Applications
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Total Applications</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Applied</div>
            <div className="text-3xl font-bold text-blue-600">{stats.applied}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Interviewing</div>
            <div className="text-3xl font-bold text-green-600">{stats.interviewing}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Recent Applications</h3>
              <Link 
                href="/applications" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-600 mb-4">No applications yet</p>
              <p className="text-sm text-gray-500">
                Install the browser extension and start applying to jobs!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {app.jobTitle}
                      </h4>
                      <p className="text-gray-600 mb-2">{app.companyName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                        {app.matchScore && (
                          <span className="font-medium text-blue-600">
                            Match: {app.matchScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link 
            href="/profile" 
            className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Profile</h3>
            <p className="text-gray-600 text-sm">
              Keep your information up-to-date for better autofill accuracy
            </p>
          </Link>

          <Link 
            href="/download" 
            className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">⬇️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Extension</h3>
            <p className="text-gray-600 text-sm">
              Download the browser extension to start autofilling applications
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
