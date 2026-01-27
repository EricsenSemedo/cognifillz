'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      // TODO: Implement actual auth check
      const hasSession = localStorage.getItem('cognifillz_session');
      setIsLoggedIn(!!hasSession);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🧠</span>
            <h1 className="text-2xl font-bold text-gray-900">CogniFillz</h1>
            <span className="text-sm text-gray-500">by Cranium Inc.</span>
          </div>
          <nav className="flex space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/profile" className="px-4 py-2 text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                <Link href="/applications" className="px-4 py-2 text-gray-700 hover:text-blue-600">
                  Applications
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Job Application Automation
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Save time and apply to more jobs with intelligent autofill, AI-powered resume scoring, 
            and personalized application tracking.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started Free
            </Link>
            <Link 
              href="/download" 
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Download Extension
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Smart Autofill</h3>
              <p className="text-gray-600">
                Automatically fill job applications across LinkedIn, Indeed, Greenhouse, and 50+ ATS platforms
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Resume Matching</h3>
              <p className="text-gray-600">
                Get instant feedback on how well your profile matches job descriptions with local LLM processing
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Application Tracking</h3>
              <p className="text-gray-600">
                Track all your applications in one place with status updates and interview reminders
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Your data stays private with local LLM processing and optional cloud sync
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Cross-Browser</h3>
              <p className="text-gray-600">
                Works on Chrome, Firefox, Edge, Brave, and Zen Browser
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Tailored Content</h3>
              <p className="text-gray-600">
                Generate customized resume content and cover letters for specific job postings
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🧠</span>
              <span className="font-semibold">CogniFillz</span>
              <span className="text-sm text-gray-500">by Cranium Inc.</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/docs">Documentation</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
