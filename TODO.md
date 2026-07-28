# Backend API URL Migration — Frontend

## Steps
- [x] Search all frontend files for hardcoded API URLs, base URLs, fetch calls, config objects
- [x] Read all relevant frontend JS and HTML files
- [x] Analyze API URL resolution architecture
- [x] Present plan and get approval
- [x] **Update `frontend/js/runtime-config.js`** — Set default API_BASE_URL to `https://nanas-api.onrender.com`
- [x] **Update `frontend/js/runtime-config.template.js`** — Add Render URL as default fallback
- [x] **Verify** — Confirmed no frontend files still reference old empty/default URL

