# 🛠️ Development Guide

Complete guide for developing and extending CogniFillz.

## 📋 Table of Contents

1. [Project Setup](#project-setup)
2. [Development Workflow](#development-workflow)
3. [Extension Development](#extension-development)
4. [Backend Development](#backend-development)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Common Tasks](#common-tasks)
8. [Best Practices](#best-practices)

---

## Project Setup

### Initial Setup

```bash
# Clone or navigate to project
cd /home/jamaal/projects/cognifillz

# Quick setup (recommended)
./setup.sh

# Or manual setup
cd apps/extension && npm install && npm run build
cd ../server && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### Development Environment

**Recommended Tools:**
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Python
  - Chrome Extension Kit
- **Chrome Browser** (or Edge)
- **LM Studio** (for AI features)
- **Postman** (for API testing)

---

## Development Workflow

### Daily Workflow

```bash
# Terminal 1: Extension development
cd apps/extension
npm run dev  # Watches for changes

# Terminal 2: Backend server (when needed)
cd apps/server
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: LM Studio
# Just keep the GUI open with server running
```

### Making Changes

1. **Edit files** in `apps/extension/src/`
2. Extension **auto-rebuilds** (if using `npm run dev`)
3. **Reload extension** in Chrome (click refresh icon in `chrome://extensions/`)
4. **Test** on a job site
5. **Check DevTools console** for logs

---

## Extension Development

### File Structure

```
apps/extension/src/
├── content-script/
│   └── content-script.ts    # Runs on job pages
├── background/
│   └── background.ts        # Service worker
└── popup/
    ├── popup.tsx            # React UI
    ├── popup.html          # HTML template
    └── popup.css           # Styles
```

### Content Script (`content-script.ts`)

**Purpose:** Detects and fills form fields on job application pages

**Key Functions:**

```typescript
// Detect all form fields on page
function detectAllFields(): DetectedField[]

// Match field labels to types
function detectFieldType(element): DetectedField | null

// Fill a field with data
function fillField(field: DetectedField, value: string)

// Get context around an input (labels, attributes)
function getFieldContext(element): string
```

**How to Add a New Field Type:**

```typescript
// 1. Add to FIELD_MAPPINGS array
const FIELD_MAPPINGS: FieldMapping[] = [
  // ... existing mappings
  {
    type: 'yourNewField',
    keywords: ['keyword1', 'keyword2', 'etc'],
    priority: 2  // 1 = high, 3 = low
  }
];

// 2. Add to Profile interface in packages/shared/index.ts
export interface Profile {
  // ... existing fields
  yourNewField?: string;
}

// 3. Add input to popup form in popup.tsx
<input
  type="text"
  placeholder="Your New Field"
  value={profile.yourNewField || ''}
  onChange={(e) => setProfile({...profile, yourNewField: e.target.value})}
/>
```

### Background Script (`background.ts`)

**Purpose:** Handle messages between popup and content script, call APIs

**Key Functions:**

```typescript
// Handle job analysis with LLM
async function handleJobAnalysis(jobDescription, sendResponse)

// Save profile to storage
async function handleSaveProfile(profile, sendResponse)

// Get profile from storage
async function handleGetProfile(sendResponse)
```

**How to Add a New Message Handler:**

```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'yourNewAction') {
    handleYourNewAction(message.data, sendResponse);
    return true;  // Required for async response
  }
});

async function handleYourNewAction(data, sendResponse) {
  try {
    // Your logic here
    sendResponse({ success: true, result: data });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}
```

### Popup (`popup.tsx`)

**Purpose:** User interface for managing profile and viewing status

**Key Components:**

```typescript
// Main app component
const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  // ...
}
```

**How to Add a New Feature:**

```typescript
// 1. Add state
const [yourFeature, setYourFeature] = useState<YourType>(initialValue);

// 2. Add function to handle it
const handleYourFeature = async () => {
  chrome.runtime.sendMessage(
    { action: 'yourAction', data: yourFeature },
    (response) => {
      if (response.success) {
        // Handle success
      }
    }
  );
};

// 3. Add UI element
<button onClick={handleYourFeature}>
  Your Feature Button
</button>
```

---

## Backend Development

### FastAPI Server (`apps/server/main.py`)

**Structure:**

```python
# Request/Response models (Pydantic)
class YourRequest(BaseModel):
    field1: str
    field2: int

# Endpoint
@app.post("/your-endpoint")
async def your_endpoint(request: YourRequest):
    # Your logic
    return {"result": "success"}
```

**How to Add a New Endpoint:**

```python
# 1. Define request/response models
class MyRequest(BaseModel):
    user_input: str

class MyResponse(BaseModel):
    result: str
    confidence: float

# 2. Create endpoint
@app.post("/my-endpoint", response_model=MyResponse)
async def my_endpoint(request: MyRequest):
    try:
        # Call LLM
        response = client.chat.completions.create(
            model="local-model",
            messages=[
                {"role": "system", "content": "You are..."},
                {"role": "user", "content": request.user_input}
            ],
            temperature=0.3
        )
        
        result = response.choices[0].message.content
        
        return MyResponse(result=result, confidence=0.9)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Testing Endpoints:**

```bash
# Using curl
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{"job_description": "...", "profile": {...}}'

# Or visit http://localhost:8000/docs for interactive testing
```

---

## Testing

### Manual Testing Checklist

**Extension:**
- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Profile can be created and saved
- [ ] Fields are detected on job pages
- [ ] Autofill works on at least 3 sites
- [ ] Console shows no errors

**Backend:**
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] LLM connection works
- [ ] Score endpoint returns valid JSON
- [ ] Tailor endpoint generates content

### Test Sites

**Easy (Start here):**
- LinkedIn Easy Apply
- Indeed
- Glassdoor

**Medium:**
- Greenhouse.io
- Lever.co
- SmartRecruiters

**Hard:**
- Workday (iframes)
- iCIMS (custom forms)
- SAP SuccessFactors

### Automated Testing (Future)

```typescript
// Example Jest test for field detection
describe('Field Detection', () => {
  it('should detect email fields', () => {
    const input = document.createElement('input');
    input.setAttribute('placeholder', 'Email Address');
    
    const detected = detectFieldType(input);
    
    expect(detected?.type).toBe('email');
    expect(detected?.confidence).toBeGreaterThan(0.8);
  });
});
```

---

## Debugging

### Extension Debugging

**Console Logs:**

```typescript
// Content script logs appear in page's DevTools console
console.log('🧠 CogniFillz:', yourData);

// Background script logs appear in extension's DevTools
// (chrome://extensions/ → Details → Inspect views: background page)

// Popup logs appear in popup's DevTools
// (Right-click popup → Inspect)
```

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Fields not detected | Check content script loaded, refresh page |
| Autofill not working | Verify profile saved, check field types match |
| Changes not appearing | Rebuild extension, reload in Chrome |
| Errors in console | Read the error message, check syntax |

**DevTools Tips:**

```javascript
// In console, inspect detected fields
chrome.runtime.sendMessage({action: 'getDetectedFields'}, console.log);

// Check stored profile
chrome.storage.local.get(['profile'], console.log);

// Clear storage (if data is corrupted)
chrome.storage.local.clear();
```

### Backend Debugging

```python
# Add debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# In endpoints
@app.post("/score")
async def score_resume(request: ScoreRequest):
    logging.debug(f"Received request: {request}")
    # ...
```

**Common Issues:**

| Issue | Solution |
|-------|----------|
| LLM not connecting | Check LM Studio is running on port 1234 |
| Import errors | Activate venv, reinstall dependencies |
| JSON parse errors | LLM response format incorrect, adjust prompt |
| Timeout errors | Model too large/slow, use smaller model |

---

## Common Tasks

### Add Support for a New Job Site

1. **Test current detection:**
   ```bash
   # Visit the site, open DevTools console
   # Check what fields are detected
   ```

2. **Add domain to manifest.json:**
   ```json
   "content_scripts": [{
     "matches": [
       "https://yournewsite.com/*"
     ],
     // ...
   }]
   ```

3. **Add site-specific logic (if needed):**
   ```typescript
   // In content-script.ts
   function detectAllFields(): DetectedField[] {
     // Check if we're on the special site
     if (window.location.hostname.includes('yournewsite.com')) {
       // Custom detection logic
       return detectYourNewSiteFields();
     }
     // Default logic
     return defaultFieldDetection();
   }
   ```

### Improve Field Detection Accuracy

1. **Add more keywords:**
   ```typescript
   {
     type: 'phone',
     keywords: [
       'phone', 'telephone', 'mobile', 'cell',
       'contact number', 'phone number',  // Add these
       'tel', 'móvil'  // Add international variants
     ],
     priority: 1
   }
   ```

2. **Add fuzzy matching:**
   ```typescript
   // Improve fuzzyMatch function for better partial matches
   ```

3. **Learn from user:**
   ```typescript
   // When field is unknown, ask user:
   // "What should we fill in 'XYZ' field?"
   // Save mapping to custom_field_mappings table
   ```

### Customize the UI

**Change Colors:**

```css
/* apps/extension/src/popup/popup.css */
.header {
  background: linear-gradient(135deg, #your-color 0%, #your-color2 100%);
}
```

**Add New Tab:**

```typescript
// In popup.tsx
const [activeTab, setActiveTab] = useState<'profile' | 'analyze' | 'yourTab'>('profile');

// Add tab button
<button
  className={`tab ${activeTab === 'yourTab' ? 'tab-active' : ''}`}
  onClick={() => setActiveTab('yourTab')}
>
  Your Tab
</button>

// Add tab content
{activeTab === 'yourTab' && (
  <div>Your tab content here</div>
)}
```

---

## Best Practices

### Code Style

```typescript
// Use clear, descriptive names
function detectEmailField() {  // Good
function def() {               // Bad

// Add comments for complex logic
// Fuzzy match with 50% character threshold
const match = fuzzyMatch(text, keywords);

// Use TypeScript types
function fillField(field: DetectedField, value: string): void {
  // ...
}
```

### Security

```typescript
// Never hardcode API keys
const API_KEY = process.env.API_KEY;  // Good
const API_KEY = "sk-1234...";         // Bad

// Validate user input
if (!profile.email || !profile.email.includes('@')) {
  throw new Error('Invalid email');
}

// Use prepared statements for SQL (when we add direct DB access)
```

### Performance

```typescript
// Debounce expensive operations
let timeout;
observer.observe(document.body, {
  childList: true,
  subtree: true
});

const debouncedScan = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => detectAllFields(), 1000);
};

// Cache LLM results
const cache = new Map();
if (cache.has(jobDescription)) {
  return cache.get(jobDescription);
}
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit frequently
git add .
git commit -m "Add support for X site"

# Push and create PR
git push origin feature/your-feature
```

---

## Next Steps

1. **Complete Sprint 1** - Get basic autofill working
2. **Improve detection** - Test on 10+ sites, refine keywords
3. **Add AI features** - Integrate LM Studio scoring
4. **Build mobile app** - Start Phase 3

---

Happy coding! 🧠

For questions, check the other docs or inspect the code - it's well-commented!
