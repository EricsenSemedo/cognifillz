# 🚀 START HERE - Your First Steps

Welcome to CogniFillz! Follow these steps to get up and running in 15 minutes.

## ✅ What You've Got

Your project is fully scaffolded with:
- ✅ Chrome Extension boilerplate (TypeScript + React)
- ✅ FastAPI backend for AI processing
- ✅ Supabase database schema
- ✅ Complete documentation

## 🌐 Browser Selection

**Important:** CogniFillz now supports multiple browsers!

- **Zen Browser** (Recommended for privacy) → [ZEN_BROWSER_SETUP.md](ZEN_BROWSER_SETUP.md)
- **Firefox** → [ZEN_BROWSER_SETUP.md](ZEN_BROWSER_SETUP.md) (same as Zen)
- **Chrome/Edge/Brave** → Continue below

---

## 🎯 Quick Start (Choose Your Path)

### Path A: Just Want to See It Work (10 minutes)

**Goal:** Get basic autofill working without AI

1. **Install Extension Dependencies:**
```bash
cd /home/jamaal/projects/cognifillz/apps/extension
npm install
```

2. **Build the Extension:**
```bash
npm run build
```

3. **Load in Chrome:**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select: `/home/jamaal/projects/cognifillz/apps/extension/dist`

4. **Test It:**
   - Click the CogniFillz icon
   - Fill in your profile
   - Go to a LinkedIn job (Easy Apply)
   - Click "Autofill Application"
   - Done! 🎉

---

### Path B: Full Setup with AI (30 minutes)

**Goal:** Get AI-powered resume scoring working

1. **Do Path A first** (steps 1-4 above)

2. **Install LM Studio:**
   - Download from https://lmstudio.ai/
   - Install and open it
   - Go to "Search" tab
   - Download: `llama-3.2-3b-instruct` (1.7GB)
   - Go to "Local Server" tab
   - Click "Start Server"
   - Keep it running!

3. **Setup Python Backend:**
```bash
cd /home/jamaal/projects/cognifillz/apps/server

# Create virtual environment
python3 -m venv venv

# Activate it (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

4. **Test AI Integration:**
   - Visit http://localhost:8000/health
   - Should see `"llm_connected": true`
   - Now your extension can analyze jobs with AI!

---

### Path C: Full Stack with Database (45 minutes)

**Goal:** Cloud sync across devices

1. **Do Path B first** (steps 1-4 above)

2. **Create Supabase Project:**
   - Go to https://supabase.com
   - Sign up (free)
   - Create new project
   - Wait ~2 minutes for provisioning

3. **Setup Database:**
   - In Supabase dashboard → SQL Editor
   - Copy contents of `/home/jamaal/projects/cognifillz/supabase-schema.sql`
   - Paste and run
   - Check Table Editor - should see `profiles`, `applications` tables

4. **Connect Extension:**
   - Create file: `/home/jamaal/projects/cognifillz/apps/extension/src/config.ts`
   ```typescript
   export const SUPABASE_URL = 'YOUR_PROJECT_URL';
   export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```
   - Get these from Supabase → Settings → API
   - Rebuild extension: `npm run build`
   - Reload in Chrome

---

## 🎓 What to Learn Next

Based on your skill level (beginner-intermediate), here's a learning path:

### Week 1: Master the Extension
- [ ] Read Chrome Extension docs: https://developer.chrome.com/docs/extensions/mv3/
- [ ] Understand content scripts vs background scripts
- [ ] Experiment with DOM manipulation
- [ ] Try modifying the field detection logic

### Week 2: AI Integration
- [ ] Learn FastAPI basics: https://fastapi.tiangolo.com/
- [ ] Understand prompt engineering for LLMs
- [ ] Try different models in LM Studio
- [ ] Optimize prompts for better resume scores

### Week 3: Database & Sync
- [ ] Learn Supabase: https://supabase.com/docs
- [ ] Understand Row Level Security (RLS)
- [ ] Practice SQL queries
- [ ] Build sync functionality

---

## 📂 Project Structure Explained

```
cognifillz/
├── apps/extension/          ← Chrome Extension (START HERE)
│   ├── src/
│   │   ├── content-script/  ← Runs on job pages, detects fields
│   │   ├── background/      ← Handles messaging, API calls
│   │   └── popup/           ← UI you click on
│   └── manifest.json        ← Extension config
│
├── apps/server/             ← AI Backend (PHASE 2)
│   ├── main.py             ← FastAPI server
│   └── requirements.txt    ← Python dependencies
│
└── supabase-schema.sql     ← Database setup (PHASE 3)
```

---

## 🛠️ Development Workflow

### Daily Development Loop

1. **Make changes** to files in `apps/extension/src/`
2. **Rebuild**: `npm run build` (in `apps/extension/`)
3. **Reload extension** in Chrome (click refresh icon)
4. **Test** on a job site
5. **Check console** (F12) for logs and errors

### Pro Tip: Watch Mode
```bash
cd apps/extension
npm run dev  # Auto-rebuilds on file changes
```

---

## 🎯 First Tasks (After Setup)

1. **Test Field Detection:**
   - Visit 5 different job sites
   - Check which fields are detected
   - Note which ones are missed

2. **Customize Your Profile:**
   - Edit `apps/extension/src/popup/popup.tsx`
   - Add more fields (work experience, skills, etc.)
   - Rebuild and test

3. **Improve Detection:**
   - Edit `apps/extension/src/content-script/content-script.ts`
   - Add more keywords to `FIELD_MAPPINGS`
   - Test on sites that didn't work well

---

## ❓ Common Questions

**Q: Do I need to know React?**
A: Basic React helps, but you can start by just modifying the existing code. The popup is simple React.

**Q: How does the AI work?**
A: Your resume + job description are sent to LM Studio running on your PC. It analyzes and returns a score. All local, all private.

**Q: Why is LM Studio needed?**
A: It runs AI models locally on your computer. This keeps your resume data private (never sent to cloud).

**Q: Can I use a different AI model?**
A: Yes! LM Studio supports many models. Try `mistral-7b` for better quality or `llama-3.2-1b` for faster speed.

**Q: Do I need Supabase?**
A: No, the extension works fine without it. Supabase is only for syncing across devices.

---

## 🐛 Troubleshooting

### Extension won't build
```bash
cd apps/extension
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Fields not detected
- Open DevTools (F12) → Console
- Look for "🧠 CogniFillz" logs
- Refresh the page
- Wait 2-3 seconds for page to load

### Python errors
```bash
cd apps/server
python3 --version  # Must be 3.9+
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📚 Documentation Reference

- **QUICK_START.md** - Fastest path to working extension
- **README.md** - Complete feature overview
- **SETUP_CHECKLIST.md** - Step-by-step verification
- **ARCHITECTURE.md** - Technical deep dive
- **THIS FILE** - Your starting point!

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Extension icon appears in Chrome toolbar
- ✅ Clicking it opens a popup with profile form
- ✅ Visiting a job page shows detected fields in console
- ✅ Green outlines appear around form fields
- ✅ Clicking "Autofill" fills in your information

---

## 💬 Need Help?

1. **Check the console logs** - They're very detailed
2. **Read the error message** - It usually tells you what's wrong
3. **Review the docs** - README.md has detailed explanations
4. **Check the checklist** - SETUP_CHECKLIST.md has troubleshooting

---

## 🚀 Ready to Start?

Pick your path above (A, B, or C) and let's build!

**Recommended for first time:** Start with Path A, get basic autofill working, then move to B and C.

---

Built with 🧠 by Cranium Inc.

**Next Step:** Open `QUICK_START.md` and follow the 10-minute guide!
