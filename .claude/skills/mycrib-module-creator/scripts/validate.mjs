#!/usr/bin/env node
// Validates a myCrib module folder. Mirrors server/services/modules.js rules. No dependencies.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const dir = resolve(process.argv[2] || '');
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
if (!process.argv[2] || !existsSync(dir) || !statSync(dir).isDirectory()) { console.error('Usage: validate.mjs modules/<id>'); process.exit(1); }

let m;
try { m = JSON.parse(readFileSync(join(dir, 'module.json'), 'utf8')); } catch (e) { console.error(`module.json: ${e.message}`); process.exit(1); }

const SAFE = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;
const safe = (f) => typeof f === 'string' && SAFE.test(f) && !f.split('/').includes('..');
const id = m.id;
if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(id || '')) err('id: lowercase letters/digits/hyphens, 3-64 chars, alphanumeric at both ends');
if (id !== basename(dir)) err(`id "${id}" must equal folder name "${basename(dir)}"`);
if (m.manifestVersion !== undefined && (!Number.isInteger(m.manifestVersion) || m.manifestVersion < 1 || m.manifestVersion > 1)) err('manifestVersion must be 1');
if (!safe(m.entry) || !String(m.entry).endsWith('.js')) err('entry must be a safe relative .js path'); else if (!existsSync(join(dir, m.entry))) err(`entry file missing: ${m.entry}`);
if (m.style) { if (!safe(m.style) || !m.style.endsWith('.css')) err('style must be a safe relative .css path'); else if (!existsSync(join(dir, m.style))) err(`style file missing: ${m.style}`); }
if (m.accent && !/^#[0-9a-fA-F]{6}$/.test(m.accent)) warn('accent is not #RRGGBB, myCrib falls back to #6366F1');
if (!m.version) warn('version missing');
if (m.description && m.description.length > 240) warn('description > 240 chars gets truncated');
const comps = ['reading', 'data', 'dashboard', 'form', 'split', 'full'];
if (!m.page?.composition) warn('page.composition not declared');
else if (!comps.includes(m.page.composition)) err(`page.composition must be one of ${comps.join('|')}`);
if (m.page?.width && !['reading', 'content', 'wide'].includes(m.page.width)) err('page.width must be reading|content|wide');

// capabilities
const cap = m.capabilities;
if (cap) {
  if ((cap.widgets?.length || cap.api) && !cap.permissions?.module) err('capabilities.permissions.module is required with widgets/api');
  if (cap.api) {
    const pre = String(cap.api.prefix || '').replace(/\/$/, '');
    if (pre !== `/api/extensions/${id}`) err(`capabilities.api.prefix must be exactly /api/extensions/${id}`);
  }
  for (const w of cap.widgets || []) {
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(w.id || '')) err(`widget id invalid: ${w.id}`);
    if (w.defaultSize && !/^[1-4]x[1-4]$/.test(w.defaultSize)) err(`widget ${w.id}: defaultSize must be 1x1..4x4`);
    if (!safe(w.entry) || !existsSync(join(dir, w.entry || ''))) err(`widget ${w.id}: entry missing or unsafe`);
    else if (!/export\s+(async\s+)?function\s+renderWidget|export\s*\{[^}]*renderWidget/.test(readFileSync(join(dir, w.entry), 'utf8'))) err(`widget ${w.id}: entry must export renderWidget`);
    const keys = Object.keys(w.optionsSchema || {});
    if (keys.length > 8) err(`widget ${w.id}: optionsSchema max 8 keys`);
    for (const k of keys) if (!/^[a-z0-9_]+$/.test(k)) err(`widget ${w.id}: option key "${k}" invalid`);
  }
}

// locales
const locDir = join(dir, 'locales');
const locales = {};
if (existsSync(locDir)) for (const f of readdirSync(locDir)) {
  const mm = f.match(/^([a-z]{2,3})\.json$/); if (!mm) continue;
  try { locales[mm[1]] = JSON.parse(readFileSync(join(locDir, f), 'utf8')); } catch (e) { err(`locales/${f}: ${e.message}`); }
}
const def = m.i18n?.defaultLocale || 'en';
const usesKeys = JSON.stringify(m).includes('labelKey') || JSON.stringify(m).includes('titleKey');
if (usesKeys && !locales[def]) err(`locales/${def}.json must exist when labelKey/titleKey is used`);
if (locales[def]) for (const [l, o] of Object.entries(locales)) {
  const miss = Object.keys(locales[def]).filter((k) => !(k in o));
  if (miss.length) warn(`locales/${l}.json lacks ${miss.length} key(s) of ${def}: ${miss.slice(0, 5).join(', ')}`);
}

// source scan
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { if (f === 'node_modules') continue; const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } })(dir);
for (const f of files) {
  const rel = f.slice(dir.length + 1);
  if (/\.(js|mjs|css|html)$/.test(f) === false) continue;
  // sidecar/ ist Backend-Code: Hostnamen/Ursprungs-Beispiele sind dort legitim, die Browser-Regeln gelten nicht.
  if (rel.startsWith('sidecar/')) {
    if (/\beval\s*\(|new Function\s*\(/.test(readFileSync(f, 'utf8'))) err(`${rel}: eval/new Function forbidden`);
    continue;
  }
  const s = readFileSync(f, 'utf8');
  if (/\.js$/.test(f)) {
    if (/\binnerHTML\b/.test(s)) err(`${rel}: innerHTML is forbidden (use replaceChildren + insertAdjacentHTML)`);
    if (/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(s)) err(`${rel}: eval/new Function/document.write forbidden`);
    if (/yuvomi\.db|better-sqlite3|node:sqlite/.test(s)) err(`${rel}: direct database access is forbidden`);
  }
  if (/https?:\/\/(?!localhost|127\.0\.0\.1)/.test(s) && !/\.md$/.test(f)) {
    const lines = s.split('\n').filter((l) => /https?:\/\/(?!localhost|127\.0\.0\.1)/.test(l) && !/^\s*(\/\/|\*|\/\*)/.test(l));
    if (lines.length) err(`${rel}: external URL (no CDNs / external hosts): ${lines[0].trim().slice(0, 80)}`);
  }
  if (/\.css$/.test(f)) {
    if (/!important/.test(s)) warn(`${rel}: !important`);
    if (/@import\s+url\(/.test(s)) err(`${rel}: @import url() forbidden`);
    if (/#[0-9a-fA-F]{3,8}\b/.test(s)) warn(`${rel}: hard-coded hex colors; prefer design tokens (var(--color-*))`);
  }
}
if (m.entry && existsSync(join(dir, m.entry))) {
  const s = readFileSync(join(dir, m.entry), 'utf8');
  if (!/export\s+(async\s+)?function\s+render\b|export\s*\{[^}]*\brender\b/.test(s)) err(`${m.entry}: must export render(container, context)`);
  if (/addEventListener/.test(s) && !/\{\s*signal\s*\}|signal\s*[,}]/.test(s)) warn(`${m.entry}: addEventListener without { signal }`);
  if (/setInterval|setTimeout/.test(s) && !/signal/.test(s)) warn(`${m.entry}: timers without signal abort cleanup`);
  if (/await/.test(s) && !/signal\.aborted/.test(s)) warn(`${m.entry}: check signal.aborted after await`);
  if (/\bt\(['"]/.test(s)) { for (const k of new Set([...s.matchAll(/\bt\(['"]extensions\.[a-z0-9-]+\.([^'"]+)['"]/g)].map((x) => x[1]))) if (locales[def] && !(k in locales[def])) warn(`i18n key "${k}" used but missing in locales/${def}.json`); }
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK: ${id} (${warnings.length} warning(s))`);
process.exit(errors.length ? 1 : 0);
