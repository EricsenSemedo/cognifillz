# Installing Unsigned CogniFillz in Zen Browser

Since CogniFillz is not yet signed by Mozilla, you need to use one of these methods:

---

## Method 1: Temporary Add-on (Easiest - Recommended)

**Use this for testing and development.**

1. Open Zen Browser
2. Type: `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to: `/home/jamaal/projects/cognifillz/apps/extension/dist/firefox/`
5. Select: `manifest.json`
6. Click "Open"

**Pros:**
- ✅ Works immediately
- ✅ No configuration needed
- ✅ Safe

**Cons:**
- ❌ Removed when browser closes
- ❌ Must reload after each restart

---

## Method 2: Disable Signature Check (Firefox Developer/Nightly Only)

**Warning:** This only works in Firefox Developer Edition, Firefox Nightly, or Firefox ESR. Regular Firefox and most Zen builds don't support this.

1. Type: `about:config`
2. Click "Accept the Risk and Continue"
3. Search for: `xpinstall.signatures.required`
4. Double-click to set to `false`
5. Now install the .xpi normally

**Note:** This likely won't work in standard Zen Browser builds.

---

## Method 3: Sign the Extension (For Production)

When ready to distribute:

1. Create account at: https://addons.mozilla.org/
2. Go to: https://addons.mozilla.org/developers/addon/submit/distribution
3. Choose "On your own" (self-distribution)
4. Upload `cognifillz-firefox.xpi`
5. Mozilla validates and signs it (takes a few minutes)
6. Download signed .xpi
7. Can now install permanently

**Note:** This is free but requires Mozilla review for initial submission.

---

## Recommended Workflow

**For Development/Testing:**
- Use Method 1 (Temporary Add-on)
- Reload each time you restart browser
- Takes 10 seconds

**For Daily Use:**
- Once extension is stable, sign it (Method 3)
- Then install permanently

---

## Quick Commands

```bash
# After making code changes:
cd /home/jamaal/projects/cognifillz/apps/extension
npm run build:firefox

# Then in Zen:
# Go to about:debugging
# Click "Reload" next to CogniFillz
```

---

## Why This Happens

Firefox/Zen requires extensions to be signed by Mozilla for security. This prevents malicious extensions from being installed.

**Options:**
1. Load temporarily (no signing needed)
2. Self-sign through Mozilla (free, takes 5 min)
3. Use Firefox Developer Edition (can disable signing)

For now, use **Method 1** (temporary) for testing!
