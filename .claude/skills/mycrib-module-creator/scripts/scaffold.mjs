#!/usr/bin/env node
// Scaffolds modules/<id>/ for myCrib. No dependencies.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const id = args.shift();
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);

if (!id || !/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(id)) {
  console.error('Usage: scaffold.mjs <id> [--name N] [--composition reading|data|dashboard|form|split|full] [--icon box] [--accent "#6366F1"] [--locales en,de] [--widget] [--api] [--dir modules]\nid: lowercase letters/digits/hyphens, 3-64 chars, alphanumeric at both ends.');
  process.exit(1);
}
const comps = ['reading', 'data', 'dashboard', 'form', 'split', 'full'];
const composition = opt('composition', 'reading');
if (!comps.includes(composition)) { console.error(`composition must be one of ${comps.join(', ')}`); process.exit(1); }
const accent = opt('accent', '#6366F1');
if (!/^#[0-9a-fA-F]{6}$/.test(accent)) { console.error('accent must be #RRGGBB'); process.exit(1); }

const name = opt('name', id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '));
const icon = opt('icon', 'box');
const locales = opt('locales', 'en,de').split(',').map((s) => s.trim()).filter(Boolean);
const widget = flag('widget');
const api = flag('api');
const root = resolve(opt('dir', 'modules'), id);
if (existsSync(root)) { console.error(`${root} already exists, refusing to overwrite.`); process.exit(1); }

const manifest = {
  manifestVersion: 1, id, name, version: '0.1.0', description: `${name} module for myCrib.`,
  entry: 'index.js', style: 'style.css', icon, accent,
  i18n: { defaultLocale: locales[0] },
  menu: { show: true, label: name, labelKey: 'menu', icon, order: 100 },
  page: { composition, width: composition === 'dashboard' ? 'wide' : 'reading', navigation: 'standard', responsive: 'standard' },
};
if (widget || api) {
  manifest.capabilities = { permissions: { module: { label: name, labelKey: 'module', icon } } };
  if (widget) {
    manifest.capabilities.permissions.widgets = [{ id: 'summary', label: 'Summary tile' }];
    manifest.capabilities.widgets = [{ id: 'summary', entry: 'widgets/summary.js', label: 'Summary tile', labelKey: 'widgets.summary', icon, defaultSize: '1x2', defaultVisible: false }];
  }
  if (api) manifest.capabilities.api = { prefix: `/api/extensions/${id}` };
}

const p = (rel) => { const f = join(root, rel); mkdirSync(join(f, '..'), { recursive: true }); return f; };
const prefix = `mod-${id}`;
writeFileSync(p('module.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(p('index.js'), `import { t } from '/i18n.js';
import { esc } from '/utils/html.js';
import { renderPageHeader, renderPageTitle, renderPageBody, renderPageSection } from '/utils/page-layout.js';

export async function render(container, context) {
  const { signal } = context;
  const title = t('extensions.${id}.title');
  container.replaceChildren();
  container.insertAdjacentHTML('beforeend',
    renderPageHeader({ title: renderPageTitle(title) })
    + renderPageBody({
      content: renderPageSection({
        content: \`<p class="${prefix}__hello">\${esc(context.user?.display_name ?? '')}</p>\`,
      }),
    }));
  if (signal.aborted) return;
}
`);
writeFileSync(p('style.css'), `.${prefix}__hello {\n  color: var(--color-text-secondary);\n}\n`);
const en = { menu: name, module: name, title: name };
if (widget) { en['widgets.summary'] = 'Summary tile'; }
for (const l of locales) writeFileSync(p(`locales/${l}.json`), JSON.stringify(en, null, 2) + '\n');
if (widget) writeFileSync(p('widgets/summary.js'), `import { esc } from '/utils/html.js';

export async function renderWidget(container, { size, options, user }) {
  container.replaceChildren();
  container.insertAdjacentHTML('beforeend', \`<p>\${esc(user?.display_name ?? '')}</p>\`);
}
`);
writeFileSync(p('README.md'), `# ${name}\n\nmyCrib module \`${id}\`. Copy this folder into \`modules/\`, then enable it in Settings -> Modules -> Active modules (admin).\n`);
console.log(`Created ${root}`);
