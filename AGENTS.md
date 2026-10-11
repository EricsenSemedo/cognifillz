# CogniFillz

Personal job-search pipeline. See README.md for the steps and commands.

## Privacy rules

- Nothing personal is committed: home town, commute places and target companies live in the gitignored `config/portals.json`; `config/portals.example.json` stays generic. Tests use made-up companies and places.
- The tracker holds public job data and status only. Never store contact details, resumes, form answers, citizenship/EEO answers or account credentials in `state/`, `config/` or tests.
- Importers only read their sources (`~/job_search/job-review`, `Applied_Jobs.md`, roles files). Never write to them from here; job-review's `state/selections.sqlite` is opened read-only.
- Do not open contact-detail files, finished private resume PDFs or unredacted resumes from this project. The private-resume CLI and local-autofill handle those.
- The scanner uses only public board APIs listed in `src/scan/providers.js`. Do not scrape or automate LinkedIn, and never solve or bypass CAPTCHAs.
- Nothing here submits an application. Statuses `submitted` and beyond are set only after the user confirms.

## Working on it

- Bun only (`bun test`, `bun run cogni ...`); no dependencies.
- Tests use in-memory databases and synthetic fixtures; they never read real job-search data or the network.
- `state/` is gitignored and holds the real tracker. Don't delete it to "reset"; use `COGNI_DB=/tmp/x.sqlite` for experiments.
- Statuses only move forward on scan/import (`src/statuses.js`); manual `set` can move anywhere and is logged in history.
