# 🚀 Quick Start Guide - Sprint 1

Get CogniFillz running in 10 minutes!

---

## 🌐 Choose Your Browser

**Using Zen Browser?** → See [ZEN_BROWSER_SETUP.md](ZEN_BROWSER_SETUP.md) for detailed Zen-specific guide!

**Using Chrome/Edge/Brave?** → Continue below

---

## ⚡ Fast Track (Chrome/Chromium Browsers)

### 1. Install Dependencies (2 minutes)

```bash
# From the project root
cd apps/extension
npm install
```

### 2. Build Extension (1 minute)

```bash
npm run build:chrome
```

### 3. Load in Chrome (1 minute)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select `cognifillz/apps/extension/dist/chrome` folder (note: /chrome not /dist)

### 4. Test It! (5 minutes)

1. Click the CogniFillz icon in Chrome toolbar
2. Fill in the profile form with your info
3. Click "Save Profile"
4. Go to any LinkedIn job with "Easy Apply"
5. Click the CogniFillz icon again
6. Click "🚀 Autofill Application"
7. Watch the magic happen!

## 🎯 What Should Happen

✅ **Green outlines** appear around detected fields  
✅ **Console logs** show detected fields (open DevTools with F12)  
✅ **Popup shows** the count of detected fields  
✅ **Clicking autofill** fills in your information  

## ❓ Not Working?

### No fields detected?
- Refresh the page
- Check DevTools console for errors
- Make sure you're on a job application form

### Autofill button does nothing?
- Make sure you saved a profile first
- Check that some fields were detected
- Try a simpler site like LinkedIn Easy Apply

### Extension won't load?
- Make sure `dist/` folder exists
- Check for errors in `chrome://extensions/`
- Try `npm run build` again

## 🌐 For Zen Browser / Firefox Users

If you're using Zen Browser or Firefox:

```bash
# Build Firefox version
npm run build:firefox

# Then follow the instructions in ZEN_BROWSER_SETUP.md
```

Or see the complete guide: [ZEN_BROWSER_SETUP.md](ZEN_BROWSER_SETUP.md)

---

## 🎓 Next Steps

Once basic autofill is working:

1. **Test on multiple sites**:
   - LinkedIn Easy Apply ✅ (easiest)
   - Indeed ✅ (easy)
   - Greenhouse ⚠️ (medium)
   - Workday ❌ (hard - Phase 2)

2. **Set up the AI backend** (see README.md Phase 2)

3. **Connect to Supabase** for cloud sync

## 💡 Pro Tips

- Open DevTools console when testing - you'll see helpful logs
- The green highlights are just for debugging - we'll remove them later
- Start with simple forms before trying complex ATS systems
- Keep a list of sites that work well vs. poorly

## 🐛 Common Issues

**"Uncaught TypeError" in console**
→ A field type isn't in your profile. Just fill in more profile fields.

**Fields highlighted but not filled**
→ Some sites block programmatic filling. This is expected - we'll handle it in Phase 2.

**No green highlights appear**
→ Content script may not have loaded. Refresh the page and wait 2-3 seconds.

## 📞 Getting Help

Check the console logs first - they're very helpful!

Look for messages like:
```
🧠 CogniFillz: Content script loaded
🧠 CogniFillz: Detected 5 fields:
  - firstName (90% confidence)
  - email (100% confidence)
  ...
```

---

**Time to first autofill: ~10 minutes** ⏱️

Let's build something awesome! 🧠
