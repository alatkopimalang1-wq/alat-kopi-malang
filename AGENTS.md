# AGENTS.md — Base44 dev environment notes

## What this app is
Multi-page static storefront (plain HTML/CSS/JS) served by a dependency-free Node
HTTP server, `server.js`. There is **no package.json and no build step** — do not
run `npm install`; nothing needs installing.

## Running it
- `docker compose -f docker-compose.base44.yml up -d` → http://localhost:3000
- `server.js` binds `0.0.0.0:3000` (host port 3000 is the preview entry point) and
  does not check `Host`/`Origin`, so it needs no allowlist tuning.
- Runs as `node --watch server.js` from the bind-mounted repo: HTML/CSS/JS edits
  are picked up instantly (files are read from disk per request), and edits to
  `server.js` itself restart the process.

## Non-obvious bits
- `server.js` is also the API: `POST /api/shipping/calculate-cost` (zone-based
  fallback courier rates, no external service) and `POST /api/upload-media`
  (base64 write into `images/`). The `images/` dir is ~30 MB and **must stay
  writable** — admin uploads write there through the bind mount.
- Clean URLs are mapped in `server.js`: `/` → index.html, `/admin` → admin.html,
  `/about` → about.html. Other pages are plain `.html` files.
- `laravel-shipping/` is a **partial reference module** (controller, service,
  config, migration only — no composer.json, no Laravel app skeleton). It is not
  part of the running app and is not served. It would call the Biteship API with
  `BITESHIP_API_KEY`; the live app instead uses `server.js`'s local rate table,
  so no shipping credentials are required to run the preview.
- `admin.html` (`/admin`) is behind the app's own login, with demo credentials
  shown on the page (`admin` / `admin123`).

## Verifying changes
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` and per page
  e.g. `/shop.html`, `/product.html?id=prod-007`, `/admin`.
- The Base44 preview `navigate`/`path` helpers use SPA pushState routing and
  therefore **cannot** open these pages — they report "page content did not
  change". Verify secondary pages by fetching them, or by loading the URL in a
  same-origin iframe inside `preview_execute_code`.
- `.github/workflows/node.js.yml` runs `npm ci` / `npm test`, which fail because
  this repo has no package.json — pre-existing, unrelated to the dev setup.
