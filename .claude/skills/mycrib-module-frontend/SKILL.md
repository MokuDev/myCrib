---
name: mycrib-module-frontend
description: Build the browser side of a myCrib module - module.json manifest, render(container, context) entry, page layout composition, CSS with design tokens, i18n, API calls and frontend security rules. Use when writing or reviewing index.js, style.css, locales/ or module.json of a modules/<id>/ folder.
---

# myCrib Module Frontend

## Manifest essentials
```json
{
  "manifestVersion": 1,
  "id": "example-module",
  "name": "Example Module",
  "version": "1.0.0",
  "description": "One sentence, max 240 chars.",
  "entry": "index.js",
  "style": "style.css",
  "icon": "box",
  "accent": "#6366F1",
  "i18n": { "defaultLocale": "en" },
  "menu": { "show": true, "label": "Example", "labelKey": "menu", "icon": "box", "order": 100 },
  "page": { "composition": "reading", "width": "reading", "navigation": "standard", "responsive": "standard" }
}
```
- `id` == folder name. `entry` is a safe relative `.js`, `style` a relative `.css`. `icon` / `menu.icon` are Lucide names.
- `accent` is the module's tone (`--active-module-accent`, status bar, module mark). It does not recolor app chrome. Pick one that works on light and dark.
- `manifestVersion` is the manifest *format* (currently 1), not the module version.
- Compositions: `reading` | `data` | `dashboard` | `form` | `split` | `full`. `width`: `reading` | `content` | `wide` (ignored by `split`/`full`). Choose by content, see `docs/PAGE-COMPOSITION.md`.

## Entry skeleton
```js
import { api } from '/api.js';
import { t } from '/i18n.js';
import { esc } from '/utils/html.js';
import { renderPageHeader, renderPageTitle, renderPageBody, renderPageSection } from '/utils/page-layout.js';

export async function render(container, context) {
  const { signal } = context;
  const me = await api.get('/auth/me');
  if (signal.aborted) return;

  container.replaceChildren();
  container.insertAdjacentHTML('beforeend',
    renderPageHeader({ title: renderPageTitle(t('extensions.example-module.title')) })
    + renderPageBody({ content: renderPageSection({
        content: `<p>${esc(me.user.display_name)}</p>`,
      }) }));

  container.querySelector('[data-action="save"]')
    ?.addEventListener('click', onSave, { signal });
}
```
`container` is already the `.app-page--<composition>` root. Do not call `renderAppPage()`, do not nest a second page root.

## Rules
1. **DOM**: `replaceChildren()` / `insertAdjacentHTML()` only. Escape every dynamic value with `esc()`. No `innerHTML`, no `document.write`, no `eval`.
2. **Lifecycle**: `{ signal }` on every `addEventListener`; clear timers/intervals on `signal`'s `abort`; check `signal.aborted` after every `await` before touching the DOM; pass `signal` to fetches where supported.
3. **API**: built-in REST via `api` from `/api.js` (prefix `/api/v1`, CSRF and credentials handled). Dynamic module backend only under `/api/extensions/<id>/...` (service worker bypasses `/api/`; other GETs may be cached stale).
4. **Layout**: header and body via `/utils/page-layout.js` (`renderPageHeader`, `renderPageTitle`, `renderPageActions`, `renderPageBody`, `renderPageSection`, `renderListSection`, `renderMetricBand`). The module owns data/components/content, not page width, gutters, breakpoints or position vs shell.
5. **CSS**: scope every selector under a module prefix (`.ex-...` or `.mod-<id>-...`); use tokens from `public/styles/tokens.css` (`--color-surface`, `--color-text-primary`, `--color-border`, `--active-module-accent`, ...), never hard-coded hex for surfaces/text. It must work in light and dark. No `!important`, no global element selectors, no `@import` of external URLs or external fonts.
6. **i18n**: user-visible strings via `t('extensions.<id>.key')`; flat keys in `locales/<locale>.json`; ship at least `defaultLocale`. Shell labels use `labelKey`/`titleKey`. Core strings (`common.save`) come from core locales.
7. **Accessibility/mobile**: real `<button>`/`<label>`, visible focus, touch targets, test at phone width, no horizontal page scroll.
8. **Failure states**: render explicit loading, empty and error states; on `404`/`405` from a previously working endpoint, degrade (read-only or dependency error with retry) instead of retrying writes. Check `GET /api/v1/version` when behavior depends on a release.
9. Check `DESIGN.md` before inventing components: buttons, chips, inputs, empty states, widget header already exist as patterns. Reuse `/utils/*` helpers (`html.js`, `empty-state.js`, `fab.js`, `date.js`, ...) rather than reimplementing.

## Review checklist
- [ ] `node .claude/skills/mycrib-module-creator/scripts/validate.mjs modules/<id>` has no errors
- [ ] No `innerHTML`, no external URLs, all listeners have `{ signal }`
- [ ] Every user string localized, no raw key shown
- [ ] Light + dark + phone width checked
