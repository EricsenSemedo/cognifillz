# CogniFillz - Key Decisions for Review

This document outlines important architectural and implementation decisions that require your review and approval.

---

## 1. Authentication & User Management

### Current Implementation
- **Web App**: Full Supabase Auth with email/password signup and login
- **Extension**: Local storage only (no auth required for basic usage)
- **Optional Cloud Sync**: Users can connect extension to web account

### Decision Required
**Should the extension require login, or remain optional?**

**Option A: Login Required (Recommended)**
- ✅ Better user experience with cloud sync
- ✅ Easier application tracking across devices
- ✅ Single source of truth for profile data
- ❌ Higher barrier to entry
- ❌ Requires internet connection

**Option B: Login Optional (Current)**
- ✅ Lower barrier to entry - works offline
- ✅ Privacy-first approach
- ❌ Profile data stuck on one device
- ❌ No application tracking without login

**Option C: Hybrid**
- ✅ Best of both worlds
- ✅ Works offline, syncs when online
- ❌ More complex implementation
- ❌ Potential sync conflicts

**Your Choice**: ___________

---

## 2. AI/LLM Integration

### Current Implementation
- Local LLM via LM Studio/Ollama (default: localhost:1234)
- No cloud AI services (OpenAI, Anthropic, etc.)
- AI features are optional

### Decision Required
**Should we add cloud AI options for users without local LLM?**

**Option A: Local Only (Current - Recommended)**
- ✅ Privacy-first, no data leaves device
- ✅ Free for users
- ✅ No API costs
- ❌ Requires technical setup
- ❌ Not accessible to average users

**Option B: Add Cloud AI (OpenAI/Anthropic)**
- ✅ Easier for non-technical users
- ✅ Better AI quality
- ❌ Privacy concerns
- ❌ Costs money (paid tier or API costs)
- ❌ Requires API key management

**Option C: Hybrid (Best UX)**
- ✅ Local LLM for free tier
- ✅ Cloud AI for premium tier
- ✅ Monetization opportunity
- ❌ More complex implementation
- ❌ Need to manage API keys securely

**Your Choice**: ___________

---

## 3. Pricing Model

### Current Implementation
- Completely free
- No paid tiers
- No limitations

### Decision Required
**Should CogniFillz be free or freemium?**

**Option A: Free Forever (Current)**
- ✅ Maximum adoption
- ✅ Helps job seekers (social good)
- ❌ No revenue
- ❌ Hard to sustain long-term

**Option B: Freemium**
- ✅ Sustainable business model
- ✅ Can fund development
- ❌ Limits features for free users
- ❌ Requires payment infrastructure

**Suggested Freemium Tiers:**
- **Free**: 
  - Basic autofill (9 fields)
  - Local profile only
  - Track 10 applications
  - Local LLM only

- **Pro ($9/month)**:
  - Advanced autofill (all fields)
  - Cloud sync across devices
  - Unlimited application tracking
  - Cloud AI analysis
  - Resume tailoring
  - Priority support

**Your Choice**: ___________

---

## 4. Data Storage & Privacy

### Current Implementation
- Extension: Local storage via `chrome.storage.local`
- Web App: Supabase PostgreSQL (optional)
- No analytics or tracking
- No data collection

### Decision Required
**How much data should we collect?**

**Option A: Zero Collection (Current - Recommended)**
- ✅ Maximum privacy
- ✅ GDPR/CCPA compliant by default
- ✅ No liability
- ❌ No usage insights
- ❌ Can't improve product based on data

**Option B: Anonymous Analytics**
- ✅ Understand user behavior
- ✅ Improve product
- ✅ Still privacy-respecting
- ❌ Requires consent UI
- ❌ Some users may be concerned

**What to track (if Option B):**
- Number of fields autofilled
- Success/failure rates
- Browser type and version
- Job sites visited (domains only)
- Feature usage (which features are used)

**Your Choice**: ___________

---

## 5. Job Site Coverage

### Current Implementation
Supports 7 major ATS platforms:
- LinkedIn Easy Apply
- Indeed
- Greenhouse
- Lever
- Workday
- SmartRecruiters
- Jobvite

Plus generic fallback for unknown sites

### Decision Required
**Should we prioritize more job sites or improve existing coverage?**

**Option A: Depth First (Recommended)**
- Focus on making existing 7 sites work perfectly
- Handle edge cases (e.g., Workday iframes)
- 95%+ success rate on supported sites

**Option B: Breadth First**
- Add 20+ more ATS platforms
- Cover 80% of all job sites
- May have lower success rate per site

**Option C: Community-Driven**
- Let users report unsupported sites
- Add sites based on user requests
- Heuristic learning from user corrections

**Your Choice**: ___________

---

## 6. Browser Extension Distribution

### Current Implementation
- Manual download (not in stores)
- Users load unpacked extension
- Firefox: Temporary extension only

### Decision Required
**Should we publish to official stores?**

**Chrome Web Store:**
- ✅ Easy installation for users
- ✅ Auto-updates
- ✅ More trust/legitimacy
- ❌ $5 one-time fee
- ❌ Review process (1-3 days)
- ❌ Must comply with store policies

**Firefox Add-ons:**
- ✅ Free submission
- ✅ Auto-updates
- ✅ Permanent installation
- ❌ Review process (2-7 days)
- ❌ Must sign extension

**Your Choice**: 
- Publish to Chrome Web Store? ___________
- Publish to Firefox Add-ons? ___________

---

## 7. Resume Tailoring Feature

### Current Implementation
- Backend API ready (`/tailor` endpoint)
- Not connected to extension UI yet
- Requires LLM to generate custom content

### Decision Required
**How aggressive should resume tailoring be?**

**Option A: Suggestions Only (Recommended)**
- Show AI suggestions
- User manually applies changes
- User stays in control
- More ethical

**Option B: Auto-Apply**
- AI rewrites content automatically
- Faster for user
- Risk of AI "hallucinations"
- Potentially misleading to employers

**Option C: One-Click Apply**
- Show suggestions with checkboxes
- User reviews and approves
- Best balance of speed + control

**Your Choice**: ___________

---

## 8. Application Tracking Features

### Current Implementation
Web app has:
- Application list with filters
- Status tracking (saved, applied, interviewing, rejected, accepted)
- Notes field
- Match score display

### Decision Required
**What additional features should we add?**

**Priority Features (Pick 3-5):**
- [ ] Interview scheduling/calendar integration
- [ ] Email reminders (follow-up after 1 week, etc.)
- [ ] Application stats/analytics dashboard
- [ ] Salary expectations tracking
- [ ] Company research notes
- [ ] Contact person tracking (recruiter info)
- [ ] Document attachments (resume versions, cover letters)
- [ ] Chrome/email integration (track replies)
- [ ] Deadline tracking
- [ ] Application templates/checklists

**Your Choices**: ___________

---

## 9. Extended Profile Fields

### Current Implementation
Profile includes:
- Basic: name, email, phone, location
- Links: LinkedIn, GitHub, portfolio
- Summary
- **NEW**: Work experience, education, skills

### Decision Required
**What else should we add to the profile?**

**Potential Fields:**
- [ ] Certifications
- [ ] Languages spoken
- [ ] Availability date
- [ ] Salary expectations (range)
- [ ] Visa status / work authorization
- [ ] Disability status (for diversity questions)
- [ ] Veteran status
- [ ] Gender (for diversity questions)
- [ ] Ethnicity (for diversity questions)
- [ ] References
- [ ] Projects/Publications

**Note**: Some diversity fields are legally sensitive. We should:
- Make them optional
- Explain why employers ask
- Allow users to skip

**Your Choices**: ___________

---

## 10. Mobile App Priority

### Current Implementation
- No mobile app yet
- Extension only (desktop browsers)

### Decision Required
**Should we build a mobile app? If yes, when?**

**Use Cases for Mobile:**
- Quick profile edits on-the-go
- View application status
- Get notifications
- ❌ Can't autofill (no mobile extensions)

**Options:**
- **Build Now**: React Native app (2-3 weeks)
- **Build Later**: After extension is stable
- **Don't Build**: Focus on core product
- **Mobile Web Only**: Responsive web app (no native app)

**Your Choice**: ___________

---

## 11. Notifications & Alerts

### Not Yet Implemented

### Decision Required
**What notifications should users receive?**

**Extension Notifications:**
- [ ] Profile successfully synced to cloud
- [ ] Fields autofilled successfully
- [ ] AI analysis complete (match score)
- [ ] New job posting matches your profile (future feature)

**Web/Email Notifications:**
- [ ] Application deadline approaching
- [ ] Time to follow up (7 days after applying)
- [ ] Weekly summary (X applications this week)
- [ ] Resume tips based on rejections

**Your Choices**: ___________

---

## 12. Error Handling & User Feedback

### Current Implementation
- Uses `alert()` for messages (not ideal)
- Console.log for debugging (needs cleanup)
- No toast/notification system

### Decision Required
**How should we handle errors and user feedback?**

**Should we add:**
- [ ] Toast notifications (non-blocking)
- [ ] Error reporting/logging service (Sentry)
- [ ] User feedback widget
- [ ] In-app help/tutorial

**Your Choices**: ___________

---

## 13. Heuristic Learning

### Not Yet Implemented

### Decision Required
**Should the extension learn from user corrections?**

**How it works:**
- User manually fills a field extension missed
- Extension asks: "Is this a [field type]?"
- System learns pattern for future use
- Improves over time

**Options:**
- **Local Only**: Learns on your device
- **Crowd-Sourced**: Shares patterns (anonymous) with all users
- **Don't Implement**: Manual patterns only

**Privacy Consideration**: Crowd-sourcing could help all users but requires data sharing.

**Your Choice**: ___________

---

## 14. Development Priorities

### Current Status
✅ Core autofill working
✅ AI analysis working
✅ Web app created
✅ Profile management
✅ Application tracking
⏳ Supabase integration (partial)
❌ Testing infrastructure
❌ Production polish (toasts, logging, errors)
❌ Documentation for users
❌ Marketing website

### Decision Required
**What should we focus on next?**

**Rank these priorities (1 = highest):**
- ___ Polish existing features (toasts, error handling)
- ___ Add testing (Jest/pytest)
- ___ Complete Supabase integration
- ___ Publish to extension stores
- ___ Build marketing website
- ___ Add more job sites
- ___ Implement heuristic learning
- ___ Mobile app development
- ___ Add premium features
- ___ User documentation/tutorials

**Your Ranking**: ___________

---

## 15. Supabase Setup

### Required Configuration

To enable cloud sync, you need to:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note the project URL and anon key

2. **Run Database Migration**
   ```bash
   # Use the existing schema file
   psql -h <supabase-host> -U postgres -d postgres -f supabase-schema.sql
   ```

3. **Update Environment Variables**
   
   **Web App** (`apps/web/.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   **Extension** (set in settings):
   - Users enter Supabase URL and key in extension settings
   - Or hardcode in `apps/extension/src/lib/supabase.ts`

4. **Enable Row Level Security**
   - Already configured in schema
   - Users can only access their own data

### Decision Required
**Should Supabase credentials be:**

**Option A: User-Provided**
- Users enter their own Supabase project
- Maximum privacy
- ❌ Complex for average users

**Option B: Hardcoded (Your Project)**
- One Supabase project for all users
- Simpler UX
- ❌ You pay for hosting
- ❌ All data in your project

**Option C: Config File**
- Different for development vs production
- Use environment variables
- Standard practice

**Your Choice**: ___________

---

## Summary of Decisions

Please review and fill in your choices for each decision above. Once you've made these decisions, I'll implement them accordingly.

**Priority Decisions** (Answer these first):
1. Authentication approach: ___________
2. AI integration: ___________
3. Pricing model: ___________
4. Development priorities: ___________
5. Supabase setup approach: ___________

Feel free to add notes, questions, or custom requirements below:

---

## Your Notes:

[Add your thoughts here]
