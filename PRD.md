# PRD — CogniFillz Smart Job Application Autofill

## Overview

Privacy-focused, AI-powered job application automation tool that detects and fills
form fields across desktop browsers (Zen, Firefox, Chrome, Edge, Brave) and mobile
(Phase 3), using local LLMs for resume analysis and scoring — by **Cranium Inc.**

## Problem

Applying to jobs is repetitive: the same name, email, LinkedIn, work history gets
typed into dozens of different ATS platforms every week. Existing tools like Simplify
cost $30/month, send your data to the cloud, and don't work on mobile. Job seekers
need a free, private, cross-platform autofill that learns their profile once and
fills everything — with AI-powered resume scoring so they apply smarter, not just
faster.

## Goals

- [ ] One-click autofill — profile created once, fills any supported job form
- [ ] Cross-browser support — Zen, Firefox, Chrome, Edge, Brave with identical UX
- [ ] Local AI scoring — resume-to-job match score via LM Studio / Ollama, no cloud
- [ ] Resume tailoring — AI rewrites resume sections to match specific job postings
- [ ] Mobile support — custom browser app for mobile job applications (Phase 3)
- [ ] Application tracking — Supabase-backed dashboard of where you've applied
- [ ] Heuristic learning — unknown fields get smarter over time via custom mappings

## Non-Goals

- Selling user data or analytics (privacy-first, always)
- Requiring a paid subscription for core features
- Cloud-only LLM processing (local-first, cloud is optional fallback)
- Replacing the owner's learning — the agent accelerates, the owner stays in control
- Auto-submitting applications (always requires human confirmation)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
└─────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌───────────────┐     ┌────────────────┐    ┌────────────────┐
│   Desktop     │     │  Mobile App    │    │  Web Dashboard │
│   Browser     │     │  (Phase 3)     │    │  (Phase 4)     │
│   Extension   │     │                │    │                │
└───────┬───────┘     └────────┬───────┘    └────────┬───────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────────────┐
                    │   SUPABASE       │
                    │   PostgreSQL     │
                    │   + Auth         │
                    │   + Storage      │
                    └──────────────────┘
                               │
                    ┌──────────────────┐
                    │   FastAPI        │
                    │   Backend        │
                    │   (localhost)    │
                    └──────────────────┘
                               │
                    ┌──────────────────┐
                    │   LM Studio     │
                    │   or Ollama     │
                    │   (Local LLM)   │
                    └──────────────────┘
```

### Component Stack

| Component | Technology | Status |
|-----------|-----------|--------|
| Browser Extension | TypeScript, React 18, Webpack 5, Manifest V3 | Sprint 1 complete |
| FastAPI Backend | Python 3.9+, FastAPI, OpenAI SDK | Sprint 1 complete |
| Database | Supabase PostgreSQL + RLS + Auth | Schema ready |
| Local LLM | LM Studio / Ollama (llama-3.2-3b or mistral-7b) | Ready |
| Mobile App | React Native + Expo (Phase 3) | Planned |
| Web Dashboard | Next.js on Vercel (Phase 4) | Planned |

## Data Flow

### Autofill Flow
```
User navigates to job page
  → Content script detects form fields (<100ms)
  → Background fetches profile from chrome.storage
  → Content script fills fields (<50ms per field)
  → User reviews and submits
```

### AI Analysis Flow
```
User clicks "Analyze Job"
  → Popup scrapes job description
  → Background calls FastAPI /score endpoint
  → FastAPI sends to local LLM (2-10s)
  → LLM returns structured analysis
  → Popup displays match score + suggestions
```

## Phase Specification

### Phase 1: Extension Core (Sprint 1) — COMPLETE

- [x] Field detection algorithm with fuzzy matching (15+ field types)
- [x] Basic autofill across LinkedIn, Indeed, Greenhouse
- [x] React popup UI with profile management
- [x] Background service worker with message passing
- [x] Dual build system (Chrome Manifest V3 + Firefox WebExtension)
- [x] Zen Browser .xpi package and documentation
- [x] FastAPI server with `/health`, `/score`, `/tailor` endpoints
- [x] Supabase schema with RLS

### Phase 2: AI Integration (Sprint 2) — IN PROGRESS

- [ ] Resume scoring endpoint connected to extension
- [ ] Job description scraping from page content
- [ ] Supabase cloud sync for profile data
- [ ] Field highlighting improvements (confidence-based)
- [ ] Advanced ATS support: Workday iframes, Lever custom components
- [ ] Custom field mapping learning system
- [ ] Extension performance optimization (<500KB total)

### Phase 3: Mobile (Sprint 3+) — PLANNED

- [ ] React Native app with Expo
- [ ] WebView content injection (reuse content script logic)
- [ ] Profile sync via Supabase (shared with desktop)
- [ ] Mobile LLM strategy (local network to desktop, small models, or cloud fallback)
- [ ] App Store / Google Play submission

### Phase 4: Dashboard & Analytics — PLANNED

- [ ] Next.js web dashboard on Vercel
- [ ] Application tracking with status pipeline
- [ ] Resume builder with AI suggestions
- [ ] Analytics: applications/week, response rates, match score trends

## Task Tracker

### Completed
- [x] Project structure and monorepo setup
- [x] Chrome extension boilerplate (Manifest V3)
- [x] Field detection algorithm
- [x] Basic autofill functionality
- [x] React popup UI
- [x] FastAPI server with LLM integration
- [x] Supabase schema
- [x] Zen Browser / Firefox cross-browser support
- [x] Dual build system (webpack.chrome.js + webpack.firefox.js)
- [x] Documentation suite (7 docs)

### In Progress
- [ ] Test extension on 10+ real job sites and document results
- [ ] Set up LM Studio and test AI scoring end-to-end
- [ ] Connect extension popup to FastAPI backend
- [ ] Integrate Supabase client in extension

### Backlog
- [ ] Unit tests (Jest for TS, pytest for Python)
- [ ] CI/CD via GitHub Actions
- [ ] Chrome Web Store submission
- [ ] Heuristic learning for unknown fields
- [ ] Resume PDF parsing and import
- [ ] Multi-profile support (different resumes for different roles)
- [ ] Job tracking dashboard
- [ ] Mobile app foundation
- [ ] Obsidian vault integration for learning notes

## Success Metrics

| Metric | Target |
|--------|--------|
| Supported ATS platforms | 10+ |
| Field detection accuracy | > 90% |
| Autofill time per form | < 5 seconds |
| LLM scoring response time | < 10 seconds |
| Extension size (gzipped) | < 500KB |
| Memory usage | < 50MB |
| Setup time for new user | < 10 minutes |
| Time saved per application | 5+ minutes |
| False data leaks to cloud | 0 (local-first) |
| Owner can explain every merged line | 100% |

## Security & Privacy

### Design Principles
1. **Local-First** — all AI processing on user's machine, never leaves
2. **Minimal Cloud** — only optional Supabase for profile sync
3. **No Tracking** — zero analytics, zero telemetry
4. **Minimal Permissions** — `activeTab`, `storage`, `scripting` only
5. **Open Source** — fully auditable codebase (MIT)

### Data Residency

| Data Type | Location | Rationale |
|-----------|----------|-----------|
| Profile data | chrome.storage.local + optional Supabase | Sync across devices |
| LLM processing | Never leaves machine | Privacy |
| Job descriptions | Temporary RAM only | Not stored |
| Application history | Optional Supabase | User tracking |
| Resumes | Local only | Never uploaded |

## Competitive Positioning

| Feature | Simplify ($30/mo) | CogniFillz (Free) |
|---------|-------------------|-------------------|
| Desktop autofill | Yes | Yes |
| Mobile support | No | Yes (Phase 3) |
| Local AI | No | Yes |
| Privacy | Cloud-processed | Local-first |
| Open source | No | Yes |
| Cost | $30/month | Free forever |
| Custom LLM | No | Any model |
| Heuristic learning | No | Yes |

## Learning-First Philosophy

CogniFillz is a learning project as much as a product. Every PR, every commit
message, every code comment is written so the owner levels up their engineering
skills. Agents must check `LEARNING.md` before writing explanations and calibrate
depth to the owner's proficiency level. See AGENTS.md for agent conventions.

## Revision History

| Date | Change |
|------|--------|
| 2026-04-13 | Initial PRD created, modeled after Stitch pipeline PRD |
