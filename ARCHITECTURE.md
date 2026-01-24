# 🏗️ CogniFillz Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                          │
└─────────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐     ┌────────────────┐    ┌────────────────┐
│   Desktop     │     │  Mobile App    │    │  Web Dashboard │
│  Browser      │     │  (Phase 3)     │    │  (Phase 4)     │
│  Extension    │     │                │    │                │
└───────┬───────┘     └────────┬───────┘    └────────┬───────┘
        │                      │                      │
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   SUPABASE       │
                    │   PostgreSQL     │
                    │   + Auth         │
                    │   + Storage      │
                    └──────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐     ┌────────────────┐    ┌────────────────┐
│  Local AI     │     │  Scraping      │    │  Analytics     │
│  (FastAPI)    │     │  Engine        │    │  Engine        │
│               │     │  (Phase 2)     │    │  (Phase 4)     │
└───────┬───────┘     └────────────────┘    └────────────────┘
        │
        ▼
┌───────────────┐
│  LM Studio    │
│  or Ollama    │
│  (Local LLM)  │
└───────────────┘
```

## Component Breakdown

### 1. Browser Extension (Chrome/Edge)

**Technology:** TypeScript, React, Webpack, Manifest V3

**Components:**

```
extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── content-script/
│   │   └── content-script.ts   # Injected into job pages
│   ├── background/
│   │   └── background.ts       # Service worker
│   └── popup/
│       ├── popup.tsx           # React UI
│       └── popup.css           # Styles
```

**Responsibilities:**
- Detect form fields on job application pages
- Inject user data into fields
- Communicate with backend API
- Sync profile data via Supabase
- Provide UI for user interaction

**Key Technologies:**
- `chrome.runtime.sendMessage()` for inter-component communication
- `chrome.storage.local` for local caching
- DOM manipulation for form filling
- Mutation observers for dynamic pages

### 2. Backend API (FastAPI)

**Technology:** Python 3.9+, FastAPI, OpenAI SDK

**File:** `apps/server/main.py`

**Endpoints:**

```
GET  /              # Health check
GET  /health        # LLM connectivity check
POST /score         # Calculate resume match score
POST /tailor        # Generate tailored resume content
```

**Responsibilities:**
- Interface with local LLM
- Process resume scoring requests
- Generate tailored content
- Parse and structure LLM responses

**LLM Integration:**
```python
client = OpenAI(
    base_url="http://localhost:1234/v1",  # LM Studio
    api_key="not-needed"
)
```

This makes it compatible with:
- LM Studio (port 1234)
- Ollama (port 11434)
- Any OpenAI-compatible API

### 3. Database (Supabase)

**Technology:** PostgreSQL with pgvector extension

**Tables:**

```sql
profiles                  # User resume data
├── id (uuid)
├── user_id (uuid)
├── first_name, last_name, email, etc.
├── master_resume_json (jsonb)
└── raw_resume_text

applications             # Job tracking
├── id (uuid)
├── user_id (uuid)
├── company_name, job_title
├── match_score (int)
└── status (enum)

custom_field_mappings    # Learning system
├── id (uuid)
├── user_id (uuid)
├── field_label
└── field_type
```

**Features:**
- Row Level Security (RLS) - users only see their data
- Real-time subscriptions (for future use)
- Built-in Auth
- File storage for PDF resumes

### 4. Local LLM (LM Studio / Ollama)

**Recommended Models:**

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| llama-3.2-3b-instruct | 3B | ⚡⚡⚡ | ⭐⭐ | Fast scoring |
| mistral-7b-instruct | 7B | ⚡⚡ | ⭐⭐⭐ | Balanced |
| llama-3.1-8b-instruct | 8B | ⚡ | ⭐⭐⭐⭐ | Quality tailoring |

**Prompts:**
- Resume Scoring: Analyze match between resume and job description
- Content Tailoring: Rewrite resume sections to match job requirements
- Keyword Extraction: Pull key skills from job postings

## Data Flow

### Autofill Flow

```
1. User navigates to job page
2. Content script detects form fields
3. Content script requests profile from background
4. Background fetches from chrome.storage (cached)
5. Content script fills fields
6. User submits application
```

### AI Analysis Flow

```
1. User clicks "Analyze Job"
2. Popup scrapes job description
3. Popup sends to background
4. Background calls FastAPI /score endpoint
5. FastAPI sends to local LLM
6. LLM returns analysis
7. FastAPI parses and structures response
8. Background returns to popup
9. Popup displays score and suggestions
```

### Profile Sync Flow

```
1. User updates profile in popup
2. Popup sends to background
3. Background saves to chrome.storage.local
4. Background sends to Supabase
5. Supabase stores in PostgreSQL
6. Mobile app can fetch from Supabase
```

## Security & Privacy

### Design Principles

1. **Local-First**: All AI processing on user's machine
2. **Minimal Cloud**: Only profile storage in Supabase
3. **Encryption**: Supabase uses RLS and encryption at rest
4. **No Tracking**: Zero analytics or telemetry

### Data Storage

| Data Type | Location | Why |
|-----------|----------|-----|
| Profile Data | Supabase + Local | Sync across devices |
| LLM Processing | Never leaves machine | Privacy |
| Job Descriptions | Temporary (RAM only) | Not stored |
| Application History | Supabase | User tracking |

### Permission Model

Extension only requests:
- `activeTab`: Access current page (when popup is open)
- `storage`: Save profile locally
- `scripting`: Inject content script

No broad permissions like `<all_urls>` - only specific job sites.

## Technology Stack

### Frontend
- **TypeScript**: Type safety
- **React 18**: UI framework
- **Webpack 5**: Bundling
- **CSS3**: Styling (no framework - keeps it lightweight)

### Backend
- **Python 3.9+**: Server language
- **FastAPI**: API framework (modern, fast, auto-docs)
- **Uvicorn**: ASGI server
- **OpenAI SDK**: LLM integration

### Database
- **Supabase**: Backend-as-a-service
- **PostgreSQL**: Relational database
- **pgvector**: Vector embeddings (future)

### AI
- **LM Studio**: GUI for local LLMs (easy for users)
- **Ollama**: CLI alternative
- **Llama 3 / Mistral**: Open-source models

## Performance Considerations

### Extension Performance
- Content script: ~2KB gzipped
- Popup: ~50KB (React included)
- Field detection: <100ms typically
- Autofill: <50ms per field

### LLM Performance
- Scoring: 2-10 seconds depending on model
- Tailoring: 5-15 seconds
- Can be cached for same job posting

### Database
- Profile fetch: ~50ms
- Profile update: ~100ms
- Supabase free tier: 500MB storage, 50K MAU

## Scalability

### Current Architecture (Free Tier)
- ✅ 50,000 users (Supabase limit)
- ✅ Unlimited LLM usage (local)
- ✅ No bandwidth costs (local processing)

### Future Scaling
- Supabase Pro: $25/month → 100K+ users
- Add CDN for extension distribution
- Optional cloud LLM fallback (for mobile)

## Development Workflow

### Local Development

```bash
# Terminal 1: Extension dev server
cd apps/extension
npm run dev

# Terminal 2: FastAPI server
cd apps/server
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: LM Studio (GUI)
# Just keep it running
```

### Testing

```
1. Unit tests (future): Jest for TS, pytest for Python
2. Manual testing: Load extension in Chrome
3. Integration tests: Test against sample job pages
```

### Deployment

**Extension:**
- Build: `npm run build`
- Distribute: Chrome Web Store or manual loading

**Backend:**
- Local only (no deployment needed)
- Users run on their own machines

**Mobile (Phase 3):**
- Build: `expo build:ios` / `expo build:android`
- Distribute: App Store / Google Play

## Future Architecture (Phase 3+)

### Mobile App Addition

```
React Native (Expo)
├── WebView component
│   └── Injects JavaScript (same as content script)
├── Local storage (AsyncStorage)
└── Connects to Supabase (same as extension)
```

**Key Challenge:** Mobile can't run large LLMs locally
**Solution:** 
- Option A: Connect to user's desktop LLM via local network
- Option B: Use smaller quantized models (e.g., Phi-3)
- Option C: Fallback to cloud API (OpenAI/Anthropic)

### Web Dashboard (Phase 4)

```
Next.js App
├── Job tracking dashboard
├── Resume builder
├── Application analytics
└── Deployed on Vercel (free tier)
```

## Code Organization

### Monorepo Structure

```
cognifillz/
├── apps/
│   ├── extension/     # Chrome extension
│   ├── server/        # FastAPI backend
│   └── mobile/        # React Native (future)
├── packages/
│   ├── shared/        # Shared TypeScript types
│   └── database/      # Supabase client wrapper
└── docs/              # Documentation
```

**Benefits:**
- Share code between extension and mobile
- Single `npm install` for dependencies
- Easier refactoring

## Key Design Decisions

### Why Chrome Extension First?
- Easiest to develop and test
- Proves the core concept
- Can iterate quickly
- Largest market (desktop job seekers)

### Why Local LLM?
- Privacy: Data never leaves user's machine
- Cost: No API fees
- Speed: No network latency (after initial load)
- Control: User picks their own model

### Why Supabase?
- Free tier is generous
- Built-in auth
- PostgreSQL (familiar)
- Real-time capabilities for future
- Easy to self-host if needed

### Why FastAPI?
- Modern Python framework
- Auto-generated API docs
- Fast (ASGI)
- Type hints (catches bugs)
- Easy LLM integration

## Learning Path

If you want to understand/modify each component:

1. **Content Script** → Learn: DOM manipulation, Chrome APIs
2. **Popup** → Learn: React basics, Chrome message passing
3. **Background** → Learn: Service workers, async/await
4. **FastAPI** → Learn: Python async, REST APIs
5. **Supabase** → Learn: SQL, RLS policies

## Metrics to Track

### Development Progress
- ✅ Field detection accuracy (% of fields correctly identified)
- ✅ Autofill success rate (% of forms successfully filled)
- ✅ Site coverage (# of supported ATS systems)

### User Experience
- Time to first autofill (goal: <10 min setup)
- Average time saved per application (goal: 5+ min)
- LLM response time (goal: <5 sec)

### Technical
- Extension size (goal: <500KB)
- Memory usage (goal: <50MB)
- API response time (goal: <200ms)

---

Built with 🧠 by Cranium Inc.
