# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

CogniFillz is a browser extension (Chrome/Firefox) + FastAPI backend monorepo for AI-powered job application autofill. See `README.md` for full details.

### Services

| Service | How to run | Port | Notes |
|---------|-----------|------|-------|
| **Extension** (Chrome) | `cd apps/extension && npm run build:chrome` | N/A | Load `dist/chrome/` as unpacked extension in Chrome |
| **Extension** (dev watch) | `cd apps/extension && npm run dev` | N/A | Webpack watch mode; reload extension manually in `chrome://extensions/` |
| **FastAPI backend** | `cd apps/server && source venv/bin/activate && uvicorn main:app --reload` | 8000 | Swagger docs at `/docs`. Needs `.env` (copy from `.env.example`) |

### Key commands

- **Install all deps**: `npm install` (root, hoists extension deps via workspaces) + `cd apps/server && source venv/bin/activate && pip install -r requirements.txt`
- **Build extension**: `npm run build:extension` (from root) or `cd apps/extension && npm run build`
- **Type-check**: `cd apps/extension && npm run type-check`
- **Lint**: No ESLint configured. TypeScript type-check (`tsc --noEmit`) is the primary static check.
- **Tests**: No automated test framework. Manual testing only (see `DEVELOPMENT_GUIDE.md`).

### Non-obvious gotchas

- The extension manifest references PNG icon files (`icon16.png`, `icon48.png`, `icon128.png`) that don't exist by default. Run `apps/extension/create-icons.sh` (requires ImageMagick) to generate them from the SVG source, or the extension will fail to load in Chrome.
- The Python venv must be created under `apps/server/venv/`. The system Python may lack `python3-venv` package — install it with `sudo apt-get install -y python3.12-venv` if `python3 -m venv` fails.
- The `/health` endpoint reports `"llm_connected": false` when no local LLM (LM Studio / Ollama) is running — this is expected in headless/CI environments and does not indicate a bug. The server still starts and serves all other endpoints normally.
- The extension `webpack.chrome.js` and `webpack.firefox.js` configs inherit from `webpack.common.js`. The `webpack.config.js` at the same level is a standalone config (not used by the npm scripts).
- Supabase is optional; the extension works with `chrome.storage.local` alone.
