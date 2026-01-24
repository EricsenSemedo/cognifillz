# 📚 CogniFillz Documentation Index

**Welcome to CogniFillz!** Use this index to quickly find what you need.

---

## 🚀 Getting Started (Choose ONE)

| Document | Time | Best For |
|----------|------|----------|
| **[START_HERE.md](START_HERE.md)** | 5 min read | First-time users - choose your path |
| **[QUICK_START.md](QUICK_START.md)** | 10 min | Just want to see it work NOW |
| **[setup.sh](setup.sh)** | 2 min | Automated setup (run this!) |

**Recommendation:** Run `./setup.sh` first, then read START_HERE.md

---

## 📖 Documentation by Purpose

### I want to understand the project
→ **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - What you have, metrics, roadmap

### I want to set up everything correctly
→ **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step verification

### I want to understand how it works
→ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep dive, data flow

### I want to build and customize
→ **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - How to extend, debug, test

### I want features and roadmap
→ **[README.md](README.md)** - Complete overview, features, vision

---

## 🎯 Quick Links by Task

### "I want to install the extension"
1. Run: `./setup.sh` (choose option 1)
2. Load in Chrome: `chrome://extensions/` → Load unpacked → `apps/extension/dist`
3. Done!

### "I want AI features"
1. Download [LM Studio](https://lmstudio.ai/)
2. Start local server in LM Studio
3. Run: `cd apps/server && python main.py`
4. See: [START_HERE.md](START_HERE.md) Path B

### "I want cloud sync"
1. Create [Supabase](https://supabase.com) account
2. Run SQL from: `supabase-schema.sql`
3. Configure extension with credentials
4. See: [START_HERE.md](START_HERE.md) Path C

### "I want to customize the code"
→ [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) sections:
- Extension Development
- Adding New Fields
- Customizing UI
- Common Tasks

### "Something's not working"
1. Check: [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) Troubleshooting section
2. Check: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) Debugging section
3. Check browser console (F12) for errors

---

## 📂 Project Structure

```
cognifillz/
│
├── 📄 Documentation (You are here!)
│   ├── INDEX.md                    ← Navigation hub
│   ├── START_HERE.md               ← Entry point
│   ├── QUICK_START.md              ← Fastest path
│   ├── README.md                   ← Overview
│   ├── PROJECT_SUMMARY.md          ← What you have
│   ├── SETUP_CHECKLIST.md          ← Verification
│   ├── ARCHITECTURE.md             ← Technical details
│   └── DEVELOPMENT_GUIDE.md        ← How to build
│
├── 🔧 Setup
│   ├── setup.sh                    ← Run this to start!
│   ├── package.json                ← Root dependencies
│   └── supabase-schema.sql         ← Database setup
│
├── 🎨 Apps
│   ├── extension/                  ← Chrome Extension
│   │   ├── src/
│   │   │   ├── content-script/    ← Detects fields
│   │   │   ├── background/        ← Message handling
│   │   │   └── popup/             ← UI
│   │   ├── manifest.json          ← Extension config
│   │   ├── package.json
│   │   └── webpack.config.js
│   │
│   ├── server/                     ← AI Backend
│   │   ├── main.py                ← FastAPI app
│   │   └── requirements.txt
│   │
│   └── mobile/                     ← (Phase 3)
│
└── 📦 Packages
    ├── shared/                     ← TypeScript types
    │   ├── index.ts
    │   └── package.json
    └── database/                   ← (Future)
```

---

## 🎓 Learning Path

### Week 1: Foundation
**Read:**
- START_HERE.md
- QUICK_START.md
- PROJECT_SUMMARY.md

**Do:**
- Run setup.sh
- Load extension in Chrome
- Test on 5+ job sites

### Week 2: Deep Dive
**Read:**
- ARCHITECTURE.md
- DEVELOPMENT_GUIDE.md

**Do:**
- Set up LM Studio
- Test AI features
- Customize field detection

### Week 3: Advanced
**Read:**
- Chrome Extension docs
- FastAPI docs

**Do:**
- Add new features
- Improve accuracy
- Start mobile app

---

## 📊 Documentation Stats

```
Total Documents:     8 files
Total Words:         ~15,000
Total Characters:    ~100,000
Estimated Read Time: 60 minutes (all docs)
Code Comments:       500+ lines
```

---

## 🔍 Search Guide

**Can't find something?** Use this guide:

| Looking for... | Check... |
|----------------|----------|
| Installation steps | QUICK_START.md or setup.sh |
| How feature X works | ARCHITECTURE.md |
| How to build feature X | DEVELOPMENT_GUIDE.md |
| Project overview | README.md or PROJECT_SUMMARY.md |
| Troubleshooting | SETUP_CHECKLIST.md |
| What to do next | START_HERE.md |
| Technical details | ARCHITECTURE.md |
| Code examples | DEVELOPMENT_GUIDE.md |

---

## ✅ Completion Checklist

Track your progress through setup:

### Phase 1: Basic Setup
- [ ] Read START_HERE.md
- [ ] Run setup.sh
- [ ] Extension loads in Chrome
- [ ] Can create profile
- [ ] Autofill works on 1+ sites

### Phase 2: AI Integration
- [ ] LM Studio installed
- [ ] Backend server running
- [ ] Can score resumes
- [ ] Can tailor content

### Phase 3: Cloud Sync
- [ ] Supabase project created
- [ ] Database schema installed
- [ ] Extension syncs to cloud
- [ ] Profile accessible on multiple devices

### Phase 4: Advanced
- [ ] Mobile app built
- [ ] Custom field mappings
- [ ] Advanced ATS support
- [ ] Dashboard created

---

## 🎯 Quick Commands Reference

```bash
# Setup
./setup.sh                           # Automated setup

# Extension Development
cd apps/extension
npm install                          # Install dependencies
npm run dev                          # Watch mode
npm run build                        # Production build

# Backend Development
cd apps/server
python3 -m venv venv                 # Create virtual environment
source venv/bin/activate             # Activate (Linux/Mac)
pip install -r requirements.txt      # Install dependencies
python main.py                       # Start server
uvicorn main:app --reload           # Start with auto-reload

# Testing
curl http://localhost:8000/health    # Test backend
# Load extension: chrome://extensions/

# Project Structure
tree -L 3 -I 'node_modules|venv'    # View structure
```

---

## 📞 Help & Support

### Self-Service (Fastest)
1. Check console logs (F12 in browser)
2. Read error message carefully
3. Search this documentation (Ctrl+F)
4. Check SETUP_CHECKLIST.md troubleshooting

### Documentation
- All docs have troubleshooting sections
- DEVELOPMENT_GUIDE.md has debugging tips
- Comments in code explain logic

### External Resources
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Supabase Docs](https://supabase.com/docs)

---

## 🗺️ Document Relationships

```
                    INDEX.md (You are here)
                         │
                         ├─→ START_HERE.md ──→ Choose Path A/B/C
                         │        │
                         │        ├─→ Path A: QUICK_START.md
                         │        ├─→ Path B: + AI (README Phase 2)
                         │        └─→ Path C: + Cloud (README Phase 3)
                         │
                         ├─→ PROJECT_SUMMARY.md ──→ Overview
                         │
                         ├─→ SETUP_CHECKLIST.md ──→ Verification
                         │
                         ├─→ ARCHITECTURE.md ──→ Technical Deep Dive
                         │
                         └─→ DEVELOPMENT_GUIDE.md ──→ Build & Customize
```

---

## 🎉 You're Ready!

Everything is set up and documented. Here's what to do:

**Right Now:**
1. Open [START_HERE.md](START_HERE.md)
2. Choose your path (A, B, or C)
3. Follow the steps
4. Start building!

**This Week:**
- Get basic autofill working
- Test on multiple job sites
- Document what works/doesn't

**This Month:**
- Add AI features
- Set up cloud sync
- Start mobile app

---

**Built with 🧠 by Cranium Inc.**

*Last updated: January 2026*

---

## Quick Navigation

- **[← Back to START_HERE.md](START_HERE.md)**
- **[→ Go to QUICK_START.md](QUICK_START.md)**
- **[↑ View Project Structure](#-project-structure)**
