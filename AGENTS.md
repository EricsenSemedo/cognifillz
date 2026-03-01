# AGENTS.md

CogniFillz is a browser extension + FastAPI backend for AI-powered job application autofill, tracking, and resume tailoring.

## Services

| Service | Command | Port |
|---------|---------|------|
| Extension (Chrome) | `cd apps/extension && npm run build:chrome` | N/A |
| Extension (dev) | `cd apps/extension && npm run dev` | N/A |
| Website (dev) | `cd apps/website && npx serve . -l 3000` | 3000 |
| FastAPI backend | `cd apps/server && source venv/bin/activate && uvicorn main:app --reload` | 8000 |

## Key commands

- **Install deps**: `npm install` (root) + `cd apps/server && source venv/bin/activate && pip install -r requirements.txt`
- **Build extension**: `npm run build:extension` or `cd apps/extension && npm run build`
- **Type-check**: `cd apps/extension && npm run type-check`
- **Tests**: No automated test framework. Manual testing only.

## Gotchas

- Icon PNGs don't exist by default -- run `apps/extension/create-icons.sh` (needs ImageMagick).
- Python venv goes in `apps/server/venv/`. May need `sudo apt-get install -y python3.12-venv`.
- `/health` reports `"llm_connected": false` without a local LLM -- expected, not a bug.
- Webpack: `webpack.chrome.js` and `webpack.firefox.js` extend `webpack.common.js`. The standalone `webpack.config.js` is unused.
- Supabase is optional; extension works with `chrome.storage.local` alone.
- Extension fonts are self-hosted (no external Google Fonts requests in MV3).
