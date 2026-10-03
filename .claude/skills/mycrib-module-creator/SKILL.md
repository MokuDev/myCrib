---
name: mycrib-module-creator
description: End-to-end workflow for creating a custom myCrib module (third-party module under modules/<id>/). Use whenever the user wants to build, scaffold, extend or ship a myCrib module, plugin or extension, a new page, widget or sidecar for myCrib, or says "Module Creator", "neues Modul", "Modul erstellen". Runs interview, scaffold, build, validate and handoff. Delegates to mycrib-module-frontend and mycrib-module-backend.
---

# myCrib Module Creator

Creates a third-party module in `modules/<id>/`. **Never edit myCrib core files** (`server/`, `public/`, ...) to install a module. `modules/*` is gitignored (except `.gitkeep`), so a module is its own deliverable.

Sources of truth, read before deviating from this skill: `MODULES.md` (contract), `docs/PAGE-COMPOSITION.md` (layout), `DESIGN.md` (visual language), `server/services/modules.js` (`normalizeManifest`, the real validator).

## Workflow

### 1. Interview (skip what the user already said)
Ask only what you cannot decide sensibly; propose defaults instead of open questions.
- **Purpose** in one sentence, and the main user task.
- **Name -> id**: lowercase letters/digits/hyphens, 3-64 chars, start and end alphanumeric, must equal the folder name.
- **Page composition**: `reading` (lists, forms; default), `data`, `dashboard`, `form`, `split` (master/detail), `full`.
- **Needs a backend?** Only if it needs stored state, scheduled work, or a third-party secret. Otherwise stay frontend-only and use `/api/v1` (e.g. existing endpoints) or `localStorage` for per-viewer convenience.
- **Dashboard widget?** **Own permissions?** **Languages** (default: `en` + `de`).
- **Tone**: `accent` as `#RRGGBB` that reads on light and dark surfaces.

Decide the tier and say it in one line:
| Tier | Contents | Skills |
|------|----------|--------|
| A: page only | manifest, entry, style | frontend |
| B: + i18n/widget/permissions | `capabilities`, `locales/`, `widgets/` | frontend + backend (capabilities part) |
| C: + sidecar service | `/api/extensions/<id>/` service | frontend + backend |

### 2. Scaffold
```bash
node .claude/skills/mycrib-module-creator/scripts/scaffold.mjs <id> --name "Example" --composition reading --icon box --accent "#6366F1" --locales en,de [--widget] [--api]
```
Creates `modules/<id>/` with manifest, entry, style, locales (and optional widget). Refuses to overwrite an existing folder. Use `--dir <path>` to scaffold elsewhere (e.g. when `MODULES_DIR` points outside the checkout).

### 3. Build
- UI work: follow `mycrib-module-frontend`.
- Capabilities, widgets, permissions, sidecar, compatibility: follow `mycrib-module-backend`.
Keep the module self-contained in its folder. Add `README.md` inside it with purpose, install, required API token scopes and sidecar env vars if any.

### 4. Validate (mandatory before reporting done)
```bash
node .claude/skills/mycrib-module-creator/scripts/validate.mjs modules/<id>
```
Checks manifest rules mirroring `normalizeManifest`, file existence, locale key coverage, forbidden patterns (`innerHTML`, external CDN URLs, `eval`), `render`/`renderWidget` exports, and `signal` usage. Fix every error; justify every warning or fix it. If myCrib runs locally (`npm start`), also open the module and confirm Settings -> Modules shows it as loaded, not errored.

### 5. Handoff
Report: folder, tier, what it does, how to enable (Settings -> Modules -> Active modules; admin only), permission/role setup if `capabilities.permissions` exists, and any open items (sidecar deploy, API token request to the admin). Do not claim it was run in the real app unless you did.

## Hard rules (summary)
- No `innerHTML`; use `replaceChildren()` + `insertAdjacentHTML()` and `esc()` for every untrusted value.
- No external CDNs, no inline secrets, no tokens in the module folder.
- Pass `context.signal` to every listener, check `signal.aborted` after each `await`.
- Never invent page width, gutters or breakpoints; declare `page.composition`.
- Never open `yuvomi.db`; use `/api/v1` only.
- Missing core data endpoint = issue for myCrib, not a workaround.
