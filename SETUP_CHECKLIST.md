# ✅ Setup Checklist for CogniFillz

Follow this step-by-step checklist to get everything working.

## 🎯 Sprint 1: Extension Basics

### Prerequisites
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Chrome or Edge browser
- [ ] Code editor (VS Code recommended)

### Extension Setup
- [ ] Navigate to `cognifillz/apps/extension`
- [ ] Run `npm install` (may take 2-3 minutes)
- [ ] Run `npm run build` (should create `dist/` folder)
- [ ] Open Chrome and go to `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top right)
- [ ] Click "Load unpacked" and select `apps/extension/dist` folder
- [ ] See CogniFillz icon in Chrome toolbar
- [ ] Click icon and see popup UI load

### First Test
- [ ] Click CogniFillz icon
- [ ] Fill out the profile form with your info
- [ ] Click "Save Profile"
- [ ] See success message
- [ ] Go to a LinkedIn Easy Apply job
- [ ] Open DevTools (F12) and check Console tab
- [ ] See "🧠 CogniFillz: Content script loaded" message
- [ ] See "🧠 CogniFillz: Detected X fields" message
- [ ] See green outlines on input fields
- [ ] Click CogniFillz icon - should show detected field count
- [ ] Click "🚀 Autofill Application"
- [ ] See your info filled in!

**🎉 If all checked, Sprint 1 is complete!**

---

## 🧠 Sprint 2: AI Integration

### Prerequisites
- [ ] Python 3.9+ installed (`python --version` or `python3 --version`)
- [ ] pip installed (`pip --version` or `pip3 --version`)
- [ ] LM Studio downloaded from https://lmstudio.ai/

### LM Studio Setup
- [ ] Install LM Studio
- [ ] Open LM Studio
- [ ] Go to "Search" tab
- [ ] Download model: `llama-3.2-3b-instruct` (or `mistral-7b-instruct`)
- [ ] Go to "Local Server" tab
- [ ] Click "Start Server"
- [ ] See "Server running on http://localhost:1234" message
- [ ] Test in browser: visit `http://localhost:1234/v1/models`
- [ ] Should see JSON with model info

### FastAPI Server Setup
- [ ] Navigate to `cognifillz/apps/server`
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate it:
  - Windows: `venv\Scripts\activate`
  - Mac/Linux: `source venv/bin/activate`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`
- [ ] Start server: `python main.py`
- [ ] See "Application startup complete" message
- [ ] Visit `http://localhost:8000` in browser
- [ ] See JSON response with service info
- [ ] Visit `http://localhost:8000/docs`
- [ ] See interactive API documentation (Swagger UI)

### AI Integration Test
- [ ] Both LM Studio and FastAPI server are running
- [ ] Visit `http://localhost:8000/health`
- [ ] See `"llm_connected": true` in response
- [ ] Open extension popup on a job page
- [ ] Click "Analyze" tab
- [ ] Click "🧠 Analyze with AI" button
- [ ] (This will work after we add job scraping in next sprint)

**🎉 If all checked, Sprint 2 is complete!**

---

## 🗄️ Sprint 3: Database Setup

### Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up for free account
- [ ] Verify email
- [ ] Create new project
- [ ] Choose region closest to you
- [ ] Set database password (save it!)
- [ ] Wait for project to provision (~2 min)

### Database Schema
- [ ] Open your Supabase project
- [ ] Go to "SQL Editor" in sidebar
- [ ] Click "New query"
- [ ] Copy all of `cognifillz/supabase-schema.sql`
- [ ] Paste into editor
- [ ] Click "Run" (or Ctrl+Enter)
- [ ] See "Success. No rows returned" message
- [ ] Go to "Table Editor" in sidebar
- [ ] See tables: `profiles`, `applications`, `custom_field_mappings`

### Extension Integration
- [ ] In Supabase, go to Settings > API
- [ ] Copy "Project URL" (starts with https://)
- [ ] Copy "anon public" key (starts with eyJ...)
- [ ] Create `apps/extension/src/config.ts`:
```typescript
export const SUPABASE_URL = 'your-project-url';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```
- [ ] Rebuild extension: `npm run build`
- [ ] Reload extension in Chrome
- [ ] Save profile - should sync to Supabase
- [ ] Check Supabase Table Editor - see your profile row

**🎉 If all checked, Sprint 3 is complete!**

---

## 🐛 Troubleshooting

### Extension won't load
**Problem:** Error in `chrome://extensions/`  
**Fix:** 
- Check that `dist/manifest.json` exists
- Run `npm run build` again
- Try removing and re-adding extension

### Fields not detected
**Problem:** No green highlights, no console logs  
**Fix:**
- Check DevTools Console for errors
- Refresh the page
- Make sure you're on an actual form page
- Wait 2-3 seconds for page to fully load

### Autofill doesn't work
**Problem:** Button does nothing  
**Fix:**
- Verify you saved a profile
- Check that fields were detected (see count in popup)
- Try a simpler site (LinkedIn Easy Apply)
- Some sites block autofill - this is expected

### LM Studio not connecting
**Problem:** "llm_connected": false  
**Fix:**
- Make sure LM Studio app is running
- Check that "Start Server" is clicked (green indicator)
- Verify port: should be 1234
- Try restarting LM Studio

### Python server won't start
**Problem:** Import errors or crashes  
**Fix:**
- Make sure virtual environment is activated (see `(venv)` in terminal)
- Run `pip install -r requirements.txt` again
- Try `python3` instead of `python`
- Check Python version: must be 3.9+

### Supabase connection fails
**Problem:** Authentication errors  
**Fix:**
- Double-check URL and key (no extra spaces)
- Make sure you used the "anon public" key, not service key
- Verify project is not paused (free tier auto-pauses after inactivity)

---

## 📊 Current Progress

Track your progress:

**Sprint 1: Extension Basics**
- [ ] Extension loads in Chrome
- [ ] Can create and save profile
- [ ] Fields are detected on job pages
- [ ] Autofill works on at least one site

**Sprint 2: AI Integration**
- [ ] LM Studio installed and running
- [ ] FastAPI server working
- [ ] Health check passes
- [ ] Can call API endpoints

**Sprint 3: Database**
- [ ] Supabase project created
- [ ] Schema installed
- [ ] Extension connects to Supabase
- [ ] Profile syncs to cloud

---

## 🎯 Next Steps After Setup

Once everything is checked off:

1. **Test extensively**: Try 10+ different job sites
2. **Document findings**: Note which sites work well
3. **Add features**: Expand profile with work experience
4. **Improve detection**: Tune the field matching algorithm
5. **Start Sprint 4**: Begin mobile app development

---

## 💡 Tips for Success

- **Start small**: Get one thing working before moving to the next
- **Check console logs**: They're incredibly helpful for debugging
- **Use the docs**: Both Chrome extension docs and FastAPI docs are excellent
- **Ask for help**: Check the error messages - they usually tell you what's wrong
- **Have fun**: You're building something cool!

---

**Questions?** Check README.md for detailed explanations of each step.

Built with 🧠 by Cranium Inc.
