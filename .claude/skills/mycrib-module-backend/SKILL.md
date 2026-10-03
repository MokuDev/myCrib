---
name: mycrib-module-backend
description: Add capabilities to a myCrib module - permissions (ext:<id>), dashboard widgets, API prefix, locales, and an optional sidecar backend service under /api/extensions/<id>/ with session re-check, CSRF, API tokens and release compatibility. Use when a modules/<id>/ folder needs a widget, household permissions, stored state, scheduled jobs or third-party credentials.
---

# myCrib Module Capabilities & Sidecar

Details and templates: `references/sidecar.md`. Contract source: `MODULES.md`.

## capabilities block
```json
"capabilities": {
  "permissions": {
    "module": { "label": "My Module", "labelKey": "module", "icon": "box" },
    "widgets": [{ "id": "summary", "label": "Summary tile" }]
  },
  "widgets": [{
    "id": "summary", "entry": "widgets/summary.js",
    "label": "Summary tile", "labelKey": "widgets.summary", "icon": "box",
    "defaultSize": "1x2", "defaultVisible": false,
    "optionsSchema": { "compact": { "type": "boolean", "title": "Compact", "titleKey": "options.compact", "default": false } }
  }],
  "api": { "prefix": "/api/extensions/<id>" }
}
```
Rules:
- `permissions.module` is **required** when declaring widgets and/or `api.prefix`. Permission key: `ext:<id>`; widget id on the dashboard: `<id>:<widget-id>`.
- `api.prefix` must be exactly `/api/extensions/<id>` (trailing slash optional) or the module errors out.
- Widget `id`: lowercase start, then lowercase/digits/hyphens, max 32. `defaultSize` `1x1`..`4x4`. `entry` exports `renderWidget(container, { size, options, user })`; fetch own data, follow the "Widget-Kopf" pattern in `DESIGN.md`; core renders error/retry chrome.
- `optionsSchema`: max 8 keys (`[a-z0-9_]`), `type` boolean|number|string|array, optional `enum` (max 20).
- Roles: admins assign `ext:<id>` none/read/write under Settings -> Household -> Roles & permissions.

## Decide: sidecar or not
Use a sidecar only for stored state, scheduled work or a third-party secret. Otherwise no backend. A sidecar is a separate service beside an unmodified myCrib image; never patch core.

## Sidecar non-negotiables
1. Served same-origin at `/api/extensions/<id>/` via reverse proxy.
2. Never open `yuvomi.db`. Use `/api/v1`; missing endpoint = upstream issue.
3. Per request, forward the caller's session cookie to `GET <internal myCrib>/api/v1/auth/me`; trust only that for user id/role/permissions. Never accept user id or role from a body.
4. Cache the `/auth/me` answer a few seconds keyed by session cookie (core rate limit is 300 req/min/IP; do not burn it from one container IP).
5. State-changing routes: valid session + `Origin` equals public host + own double-submit CSRF cookie/header + role or ownership check. myCrib's CSRF does not cover the sidecar.
6. Enforce `permissions.modules['ext:<id>']`: `'none'` -> 403, `'read'` -> no mutating routes.
7. Scheduled jobs: API token from Settings -> Household -> API access (admin only; ask the admin), scopes `ext:<id>:read` / `:write`. Keep it in the service's secrets, never in the module folder, Compose file or browser. Store secrets write-only; expose `has_api_token: true`, never a fragment.
8. Own state in the service's own DB.

## Compatibility
Build on `/api/v1` + public browser libs only. Check `GET /api/v1/openapi.json` (admin) during development and when myCrib releases; at runtime watch `GET /api/v1/version` and treat `404`/`405` as "operation moved": run normally, read-only with data intact, or dependency error + retry. Deprecations in `CHANGELOG.md` hold at least 90 days.

## Locales
`locales/<locale>.json`, flat keys, `i18n.defaultLocale` in manifest, file for the default locale must exist when any `labelKey` is used. Lookup: user locale -> module default -> `en` -> `de` -> static label.

## Done when
- [ ] `validate.mjs` passes; widget entry exports `renderWidget`
- [ ] Sidecar checks 3-7 are implemented and tested (unauthenticated, wrong origin, missing CSRF, `none`/`read` permission)
- [ ] Module README lists token scopes, env vars, proxy route
