'use client';

import Link from 'next/link';

export default function DownloadPage() {
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
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Download CogniFillz Extension
          </h2>
          <p className="text-xl text-gray-600">
            Install the browser extension to start autofilling job applications
          </p>
        </div>

        {/* Browser Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">Google Chrome</h3>
            <p className="text-gray-600 text-sm mb-4">Version 88 or higher</p>
            <a
              href="/dist/chrome.zip"
              className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download for Chrome
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-5xl mb-4">🦊</div>
            <h3 className="text-xl font-semibold mb-2">Mozilla Firefox</h3>
            <p className="text-gray-600 text-sm mb-4">Version 109 or higher</p>
            <a
              href="/dist/firefox.xpi"
              className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download for Firefox
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-5xl mb-4">🧘</div>
            <h3 className="text-xl font-semibold mb-2">Zen Browser</h3>
            <p className="text-gray-600 text-sm mb-4">Latest version</p>
            <a
              href="/dist/firefox.xpi"
              className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download for Zen
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-5xl mb-4">🌊</div>
            <h3 className="text-xl font-semibold mb-2">Microsoft Edge</h3>
            <p className="text-gray-600 text-sm mb-4">Version 88 or higher</p>
            <a
              href="/dist/chrome.zip"
              className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download for Edge
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-5xl mb-4">🦁</div>
            <h3 className="text-xl font-semibold mb-2">Brave Browser</h3>
            <p className="text-gray-600 text-sm mb-4">Version 1.32 or higher</p>
            <a
              href="/dist/chrome.zip"
              className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download for Brave
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">Other Chromium</h3>
            <p className="text-gray-600 text-sm mb-4">Opera, Vivaldi, etc.</p>
            <a
              href="/dist/chrome.zip"
              className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download Generic
            </a>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Installation Instructions</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">For Chrome/Edge/Brave:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Download the .zip file for your browser</li>
                <li>Unzip the downloaded file to a permanent location</li>
                <li>Open your browser and go to <code className="bg-gray-100 px-2 py-1 rounded">chrome://extensions/</code></li>
                <li>Enable "Developer mode" in the top right corner</li>
                <li>Click "Load unpacked" and select the unzipped folder</li>
                <li>The CogniFillz icon should appear in your extensions bar!</li>
              </ol>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">For Firefox/Zen:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Download the .xpi file</li>
                <li>Open Firefox/Zen and go to <code className="bg-gray-100 px-2 py-1 rounded">about:debugging</code></li>
                <li>Click "This Firefox" (or "This Zen") in the left sidebar</li>
                <li>Click "Load Temporary Add-on"</li>
                <li>Select the downloaded .xpi file</li>
                <li>Note: The extension will be removed when you close the browser. For permanent installation, you need to sign the extension or disable signature verification.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium">Create Your Profile</p>
                <p className="text-sm text-gray-600">Click the extension icon and enter your information</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium">Set Up Local LLM (Optional)</p>
                <p className="text-sm text-gray-600">Install LM Studio or Ollama for AI-powered features</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-medium">Start Applying!</p>
                <p className="text-sm text-gray-600">Navigate to any job posting and click "Autofill"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help? Check out our documentation</p>
          <Link 
            href="/docs"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            View Documentation
          </Link>
        </div>
      </main>
    </div>
  );
}
