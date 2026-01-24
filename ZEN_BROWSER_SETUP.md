# 🌐 CogniFillz for Zen Browser - Complete Setup Guide

This guide is specifically for **Zen Browser** users. Zen Browser is Firefox-based, so we use the Firefox version of the extension.

---

## 🚀 Quick Start (10 Minutes)

### Method 1: Temporary Add-on (Fastest - For Testing)

1. **Navigate to Zen's extension debugging page:**
   - Open Zen Browser
   - Type in address bar: `about:debugging#/runtime/this-firefox`
   - Press Enter

2. **Load the extension:**
   - Click "This Zen" or "This Firefox"
   - Click "Load Temporary Add-on..."
   - Navigate to: `/home/jamaal/projects/cognifillz/apps/extension/dist/firefox/`
   - Select `manifest.json`
   - Click "Open"

3. **Verify it loaded:**
   - You should see "CogniFillz" in the loaded extensions list
   - Look for the CF icon in your Zen toolbar

4. **Create your profile:**
   - Click the CogniFillz icon (CF)
   - Fill in your information
   - Click "Save Profile"

5. **Test it:**
   - Go to LinkedIn: https://www.linkedin.com/jobs/
   - Find a job with "Easy Apply"
   - Click "Easy Apply"
   - Open DevTools (F12) → Console tab
   - You should see: `🧠 CogniFillz: Content script loaded`
   - Click the CogniFillz icon
   - Click "🚀 Autofill Application"

**Note:** Temporary add-ons are removed when you close Zen Browser.

---

### Method 2: Permanent Installation (Recommended)

1. **Build the extension** (if not already done):
   ```bash
   cd /home/jamaal/projects/cognifillz/apps/extension
   npm run build:firefox
   ```

2. **Create .xpi package:**
   ```bash
   # Option A: Using the script
   ./package-firefox.sh
   
   # Option B: Manual
   cd dist/firefox
   zip -r ../cognifillz-firefox.xpi *
   cd ../..
   ```

3. **Install in Zen:**
   - Open Zen Browser
   - Type: `about:addons`
   - Click the gear/settings icon (⚙️)
   - Click "Install Add-on From File..."
   - Navigate to: `/home/jamaal/projects/cognifillz/apps/extension/dist/`
   - Select: `cognifillz-firefox.xpi`
   - Click "Open"
   - Click "Add" when prompted

4. **Accept the permissions:**
   - Zen will show: "CogniFillz wants to access..."
   - Review permissions
   - Click "Okay, Got It" or "Add"

5. **Extension is now installed permanently!**
   - Icon appears in toolbar
   - Persists after restart
   - Appears in `about:addons` list

---

## ✅ Verification Steps

After installation, verify everything works:

### 1. Extension Loaded
- [ ] CF icon visible in Zen toolbar
- [ ] Clicking icon opens popup
- [ ] No errors in `about:debugging`

### 2. Profile Creation
- [ ] Can fill in profile form
- [ ] "Save Profile" button works
- [ ] Success message appears
- [ ] Profile persists after reload

### 3. Field Detection
- [ ] Go to a job site (LinkedIn, Indeed, etc.)
- [ ] Open DevTools (F12) → Console
- [ ] See: `🧠 CogniFillz: Content script loaded`
- [ ] See: `🧠 CogniFillz: Detected X fields`
- [ ] Green outlines appear on form fields

### 4. Autofill Works
- [ ] Click CogniFillz icon
- [ ] See detected field count
- [ ] Click "Autofill" button
- [ ] Fields fill with your data
- [ ] No errors in console

---

## 🎯 Recommended Test Sites

Start with these (easiest to hardest):

1. ✅ **LinkedIn Easy Apply** (Easiest)
   - Go to: https://www.linkedin.com/jobs/
   - Search for jobs
   - Click job with "Easy Apply"
   - Expected: 8-12 fields detected

2. ✅ **Indeed** (Easy)
   - Go to: https://www.indeed.com/
   - Search and apply
   - Expected: 5-10 fields detected

3. ⚠️ **Greenhouse** (Medium)
   - Find jobs on sites using Greenhouse
   - Expected: 6-15 fields detected
   - May need to manually click some fields

4. ❌ **Workday** (Hard - Advanced)
   - Uses iframes, more complex
   - Will improve in future updates

---

## 🐛 Troubleshooting

### Issue: Extension won't load

**Symptoms:** Error message when loading temporary add-on

**Solutions:**
1. Check manifest is valid:
   ```bash
   cd /home/jamaal/projects/cognifillz/apps/extension/dist/firefox
   cat manifest.json | python3 -m json.tool
   ```
2. Rebuild extension:
   ```bash
   npm run build:firefox
   ```
3. Check for errors in: `about:debugging`

---

### Issue: No icon in toolbar

**Symptoms:** Extension loaded but no CF icon visible

**Solutions:**
1. Click the "puzzle piece" icon in Zen toolbar
2. Look for CogniFillz in the dropdown
3. Click "pin" icon next to it
4. Icon should now appear in main toolbar

---

### Issue: Fields not detected

**Symptoms:** Console shows "Detected 0 fields"

**Solutions:**
1. Refresh the page (Ctrl+R or F5)
2. Wait 2-3 seconds for page to fully load
3. Check if site is in manifest:
   ```bash
   grep "linkedin.com" apps/extension/manifest.firefox.json
   ```
4. If not listed, the site needs to be added to content_scripts.matches

---

### Issue: Autofill doesn't work

**Symptoms:** Button clicks but nothing happens

**Solutions:**
1. Open DevTools → Console
2. Look for errors
3. Check profile was saved:
   - Click extension icon
   - Should show your name
4. Try manually clicking a field first
5. Some sites block programmatic filling (normal)

---

### Issue: Extension disappears after restart

**Symptoms:** Was working, gone after closing Zen

**Cause:** You used temporary add-on method

**Solution:** Use Method 2 (Permanent Installation) instead

---

## 🔧 Advanced: Development Mode

If you're modifying the extension code:

1. **Enable auto-rebuild:**
   ```bash
   npm run dev:firefox
   ```

2. **After code changes:**
   - Webpack auto-rebuilds
   - In Zen: `about:debugging`
   - Click "Reload" next to CogniFillz

3. **View background script logs:**
   - `about:debugging`
   - Click "Inspect" next to CogniFillz
   - DevTools opens for background script

4. **View content script logs:**
   - Open job page
   - F12 → Console
   - Logs appear in page console

---

## 📊 What Data is Stored?

CogniFillz stores:

**Locally (in Zen):**
- Your profile data (name, email, etc.)
- Extension settings
- Application history (optional)

**NOT stored:**
- Job descriptions (analyzed in memory, then discarded)
- Passwords or sensitive data
- Browsing history

**Where stored:**
- Zen's built-in `browser.storage.local`
- Encrypted by Zen Browser
- Only accessible to this extension

---

## 🔒 Privacy & Permissions

CogniFillz requests these permissions:

| Permission | Why Needed | What It Does |
|------------|------------|--------------|
| `storage` | Save your profile | Store name, email, etc. locally |
| `activeTab` | Access current page | Detect form fields on job sites |
| `scripting` | Fill forms | Inject data into detected fields |
| `https://*/*` | Work on all sites | Detect fields on any job board |

**What CogniFillz DOESN'T do:**
- ❌ Track your browsing
- ❌ Send data to servers (except local LLM if enabled)
- ❌ Access sites you don't visit
- ❌ Modify pages except when you click "Autofill"

---

## 🆚 Zen Browser vs Chrome

| Feature | Zen (Firefox) | Chrome |
|---------|---------------|--------|
| Extension works | ✅ Yes | ✅ Yes |
| Installation method | .xpi file | Load unpacked |
| Auto-update | ❌ Manual (for now) | ❌ Manual (for now) |
| Local LLM support | ✅ Yes | ✅ Yes |
| Privacy | ✅✅ Better | ✅ Good |

**Recommendation:** Use Zen for better privacy!

---

## 🎓 Next Steps

After getting basic autofill working:

1. **Set up AI features:**
   - Install LM Studio: https://lmstudio.ai/
   - Download a model (llama-3.2-3b-instruct)
   - Start local server
   - See: `/home/jamaal/projects/cognifillz/README.md` Phase 2

2. **Expand your profile:**
   - Add work experience
   - Add skills
   - Add education
   - Test on more sites

3. **Help improve CogniFillz:**
   - Note which sites work well
   - Report issues
   - Suggest new features

---

## 📞 Getting Help

**If extension doesn't work:**
1. Check DevTools console (F12) for errors
2. Verify build succeeded: `ls dist/firefox/`
3. Rebuild: `npm run build:firefox`
4. Check logs in `about:debugging`

**Common solutions:**
- 90% of issues: Refresh page or reload extension
- 9% of issues: Rebuild extension
- 1% of issues: Actual bugs (report these!)

---

## 🎉 Success!

If you can:
- ✅ Load extension in Zen
- ✅ Create and save profile
- ✅ See fields detected on LinkedIn
- ✅ Autofill at least one job application

**You're all set!** CogniFillz is working correctly.

---

**Built with 🧠 by Cranium Inc.**

For more information, see:
- Main README: `/home/jamaal/projects/cognifillz/README.md`
- Development Guide: `/home/jamaal/projects/cognifillz/DEVELOPMENT_GUIDE.md`
