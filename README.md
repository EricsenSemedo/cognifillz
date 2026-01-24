# 🧠 CogniFillz

> Smart job application autofill with local AI - by **Cranium Inc.**

CogniFillz is a privacy-focused, AI-powered job application automation tool that works across desktop and mobile. Unlike Simplify, it uses local LLMs for resume analysis and works on mobile devices through a custom browser.

## 🌐 Browser Support

| Browser | Status | Installation | Notes |
|---------|--------|--------------|-------|
| **Zen Browser** | ✅ **Full Support** | [Load .xpi](ZEN_BROWSER_SETUP.md) | **Recommended!** Best privacy |
| **Firefox** | ✅ Full Support | Load .xpi or temporary | Same as Zen |
| **Chrome** | ✅ Full Support | Load from `dist/chrome/` | Tested & working |
| **Edge** | ✅ Full Support | Load from `dist/chrome/` | Chromium-based |
| **Brave** | ✅ Full Support | Load from `dist/chrome/` | Chromium-based |

**👉 For Zen Browser users:** See [ZEN_BROWSER_SETUP.md](ZEN_BROWSER_SETUP.md) for complete installation guide!

## 🎯 Features

- **Smart Autofill**: Automatically detect and fill job application forms
- **Cross-Browser**: Works on Zen, Firefox, Chrome, Edge, Brave
- **AI Resume Scoring**: Get a match score for any job posting using your local LLM
- **Resume Tailoring**: Customize your resume for specific jobs with AI assistance
- **Mobile Support**: Coming in Phase 3 - custom browser app for mobile
- **Privacy First**: All AI processing happens locally on your machine
- **Free to Use**: No subscription fees, works entirely offline

## 🏗️ Project Structure

```
cognifillz/
├── apps/
│   ├── extension/      # Chrome Extension (Manifest V3)
│   ├── server/         # FastAPI Backend for LLM integration
│   └── mobile/         # React Native mobile app (Phase 3)
├── packages/
│   ├── shared/         # Shared TypeScript types
│   └── database/       # Supabase client wrapper
└── supabase-schema.sql # Database schema
```

## 🚀 Sprint 1: Getting Started (This Week)

### Prerequisites

1. **Node.js** (v18+) and npm
2. **Python** (v3.9+) and pip
3. **LM Studio** - [Download here](https://lmstudio.ai/)
4. **Browser**: Zen Browser (recommended), Firefox, Chrome, or Edge

**👉 Using Zen Browser?** Skip to [ZEN_BROWSER_SETUP.md](ZEN_BROWSER_SETUP.md) for Zen-specific instructions!

### Step 1: Set Up LM Studio

1. Download and install LM Studio
2. Download a model (recommended: `llama-3.2-3b-instruct` for speed or `mistral-7b-instruct` for quality)
3. Start the local server:
   - In LM Studio, go to "Local Server" tab
   - Click "Start Server"
   - Default endpoint: `http://localhost:1234/v1`
   - Keep LM Studio running while using CogniFillz

### Step 2: Install Extension Dependencies

```bash
cd apps/extension
npm install
```

### Step 3: Build the Extension

```bash
npm run build
```

This creates a `dist/` folder with your compiled extension.

### Step 4: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `apps/extension/dist` folder
5. The CogniFillz icon should appear in your extensions toolbar

### Step 5: Create Your Profile

1. Click the CogniFillz icon in Chrome
2. Fill in your information (name, email, LinkedIn, etc.)
3. Click "Save Profile"

### Step 6: Test Autofill

1. Navigate to a job application (try LinkedIn Easy Apply or Indeed)
2. Open the CogniFillz popup
3. You should see detected fields listed
4. Click "🚀 Autofill Application"
5. Watch your info get filled in automatically!

## 🧪 Testing the Extension

### Test Sites

Start with these easier sites:
- **LinkedIn Easy Apply** - Simple forms, good for testing
- **Indeed** - Straightforward forms
- **Greenhouse.io** - Common ATS platform

More complex (Phase 2):
- **Workday** - Uses iframes, more challenging
- **Lever** - Custom components

### What You Should See

1. When you visit a job application page, open DevTools (`F12`)
2. In the Console, you should see:
   ```
   🧠 CogniFillz: Content script loaded
   🧠 CogniFillz: Detected X fields:
     - firstName (90% confidence): First Name
     - email (100% confidence): Email Address
     ...
   ```
3. Fields should be highlighted with a green outline and labeled
4. The popup should show the count of detected fields

## 🔧 Development Mode

For faster iteration during development:

```bash
# In apps/extension
npm run dev
```

This watches for file changes and rebuilds automatically. You'll need to click the refresh icon in `chrome://extensions/` after each build.

## 🧠 Phase 2: Set Up the AI Backend (Next Week)

### Step 1: Install Python Dependencies

```bash
cd apps/server
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for LM Studio).

### Step 3: Start the Server

```bash
python main.py
# or
uvicorn main:app --reload
```

Server runs on `http://localhost:8000`

### Step 4: Test the API

Visit `http://localhost:8000/docs` to see the interactive API documentation.

Test health check:
```bash
curl http://localhost:8000/health
```

## 🗄️ Phase 2: Set Up Supabase (Optional but Recommended)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Wait for it to provision (~2 minutes)

### Step 2: Run the Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it
4. You should see tables created: `profiles`, `applications`, `custom_field_mappings`

### Step 3: Get Your Credentials

1. Go to Settings > API
2. Copy your:
   - Project URL
   - Anon/Public key

### Step 4: Configure Extension

Add to `apps/extension/src/config.ts`:
```typescript
export const SUPABASE_URL = 'your-project-url';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

## 🎓 Learning Resources

Since you're between beginner and intermediate, here are key concepts:

### Chrome Extension Architecture

- **manifest.json**: Configuration and permissions
- **content-script.ts**: Runs in the context of web pages
- **background.ts**: Service worker, handles messaging
- **popup**: Your UI (React)

Communication flow:
```
Popup → Background → Content Script → Webpage
```

### Key APIs Used

- `chrome.runtime.sendMessage()`: Send messages between components
- `chrome.storage.local`: Store data locally
- `chrome.tabs.query()`: Get info about tabs
- `document.querySelector()`: Find elements on page

### LLM Integration

The FastAPI server acts as a bridge:
```
Extension → FastAPI → LM Studio → FastAPI → Extension
```

This keeps everything local and private.

## 🐛 Troubleshooting

### Fields Not Detected

1. Open DevTools Console - look for CogniFillz logs
2. Check if content script loaded (you should see the 🧠 emoji)
3. Try refreshing the page
4. Some sites load fields dynamically - wait a few seconds

### Autofill Not Working

1. Make sure you've created a profile
2. Check that detected fields match your profile data
3. Some sites prevent programmatic filling - this is normal
4. Try manually clicking a field first, then autofill

### LLM Not Responding

1. Make sure LM Studio is running
2. Check that local server is started (green indicator)
3. Verify endpoint: `http://localhost:1234/v1`
4. Test with: `curl http://localhost:1234/v1/models`

### Extension Not Loading

1. Check for errors in `chrome://extensions/`
2. Make sure you ran `npm run build`
3. Try removing and re-adding the extension
4. Check that `dist/manifest.json` exists

## 📊 Current Status

### ✅ Completed (Sprint 1)
- [x] Project structure setup
- [x] Chrome extension boilerplate
- [x] Field detection algorithm
- [x] Basic autofill functionality
- [x] React popup UI
- [x] FastAPI server with LLM integration
- [x] Supabase schema

### 🚧 In Progress (Sprint 2)
- [ ] Resume scoring endpoint
- [ ] Job description scraping
- [ ] Supabase integration in extension
- [ ] Field highlighting improvements

### 📅 Planned (Sprint 3+)
- [ ] Resume tailoring with AI
- [ ] React Native mobile app
- [ ] Advanced ATS support (Workday iframes)
- [ ] Heuristic learning for unknown fields
- [ ] Job tracking dashboard

## 💡 Next Steps

1. **Test the Extension**: Try it on 3-5 different job sites
2. **Document Issues**: Note which sites work well and which don't
3. **Add Your Resume**: Expand the profile form to include work experience
4. **Test AI Scoring**: Get the FastAPI server running and try job analysis

## 🤝 Contributing

This is a personal project, but feel free to:
- Report bugs
- Suggest features
- Share which job sites work/don't work

## 📝 License

MIT - Build whatever you want with this!

## 🎯 Vision

CogniFillz aims to be the most privacy-focused, powerful job application tool. Key differentiators:

1. **Local-First**: Your data never leaves your machine
2. **Mobile Support**: Works on phones (coming Phase 3)
3. **Free Forever**: No subscriptions, no data selling
4. **Open Architecture**: Use any LLM (Ollama, LM Studio, etc.)

---

Built with 🧠 by Cranium Inc.
