# AGENTS.md

## Key commands

- **Install deps**: `npm install` (root) + `cd apps/server && source venv/bin/activate && pip install -r requirements.txt`
- **Build extension**: `npm run build:extension` or `cd apps/extension && npm run build`
- **Type-check**: `cd apps/extension && npm run type-check`
- **Run backend**: `cd apps/server && source venv/bin/activate && uvicorn main:app --reload` (port 8000)
- **Run website**: `cd apps/website && npx serve . -l 3000`

## Gotchas

- Icon PNGs don't exist by default — run `apps/extension/create-icons.sh` (needs ImageMagick) or extension won't load.
- Python venv goes in `apps/server/venv/`. May need `sudo apt-get install -y python3.12-venv`.
- `/health` reports `"llm_connected": false` without a local LLM — this is expected, not a bug.
- Webpack: `webpack.chrome.js` and `webpack.firefox.js` extend `webpack.common.js`. The standalone `webpack.config.js` is unused.
- No automated tests. Manual testing only.
