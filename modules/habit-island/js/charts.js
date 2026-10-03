// Kleine Inline-SVG-Diagramme. Farben ueber --active-module-accent und Tokens, damit Hell/Dunkel stimmt.
import { esc } from '/utils/html.js';

const ACC = 'var(--active-module-accent)';
const GRID = 'var(--color-border)';
const MUTED = 'var(--color-text-tertiary)';

export function lineChart(points, { labels = [], height = 160, avg = true, ariaLabel = '' } = {}) {
  const W = 320; const H = height; const padL = 26; const padB = 22; const padT = 8; const padR = 8;
  const max = Math.max(4, ...points.map((p) => p.value));
  const top = Math.ceil(max / 4) * 4;
  const n = Math.max(points.length - 1, 1);
  const x = (i) => padL + (i / n) * (W - padL - padR);
  const y = (v) => padT + (1 - v / top) * (H - padT - padB);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = points.length ? `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z` : '';
  const mean = points.length ? points.reduce((s, p) => s + p.value, 0) / points.length : 0;
  const grid = [0, 0.5, 1].map((f) => {
    const v = Math.round(top * f);
    return `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" stroke="${GRID}" stroke-dasharray="3 4"/><text x="${padL - 6}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="${MUTED}">${v}</text>`;
  }).join('');
  const xl = labels.map((l, i) => `<text x="${x(l.at)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}" font-size="9" fill="${MUTED}">${esc(l.text)}</text>`).join('');
  const dots = points.length <= 14 ? points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value)}" r="3" fill="${ACC}"/>`).join('') : '';
  return `<svg class="hi-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">
    ${grid}
    ${area ? `<path d="${area}" fill="${ACC}" opacity=".12"/>` : ''}
    ${avg && mean > 0 ? `<line x1="${padL}" x2="${W - padR}" y1="${y(mean)}" y2="${y(mean)}" stroke="${MUTED}" stroke-dasharray="4 3"/><text x="${W - padR}" y="${y(mean) - 4}" text-anchor="end" font-size="9" fill="${MUTED}">Ø ${Math.round(mean * 10) / 10}</text>` : ''}
    <path d="${line}" fill="none" stroke="${ACC}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${xl}
  </svg>`;
}

export function gauge(pct, caption) {
  const r = 52; const c = Math.PI * r; // Halbkreis
  const off = c * (1 - Math.min(Math.max(pct, 0), 100) / 100);
  return `<svg class="hi-gauge" viewBox="0 0 140 90" role="img" aria-label="${esc(`${pct}% ${caption}`)}">
    <path d="M18,76 A52,52 0 0 1 122,76" fill="none" stroke="${GRID}" stroke-width="12" stroke-linecap="round"/>
    <path d="M18,76 A52,52 0 0 1 122,76" fill="none" stroke="${ACC}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
    <text x="70" y="64" text-anchor="middle" font-size="24" font-weight="700" fill="var(--color-text-primary)">${pct}%</text>
    <text x="70" y="82" text-anchor="middle" font-size="9" fill="${MUTED}">${esc(caption)}</text>
  </svg>`;
}

export function bars(values, labels, ariaLabel) {
  const W = 220; const H = 130; const top = Math.max(3, ...values); const bw = 20; const gap = (W - values.length * bw) / (values.length + 1);
  const b = values.map((v, i) => {
    const h = (v / top) * (H - 30);
    const bx = gap + i * (bw + gap);
    return `<rect x="${bx}" y="8" width="${bw}" height="${H - 30}" rx="6" fill="${GRID}" opacity=".35"/>
      <rect x="${bx}" y="${8 + (H - 30) - h}" width="${bw}" height="${Math.max(h, v ? 4 : 0)}" rx="6" fill="${ACC}"/>
      <text x="${bx + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${MUTED}">${esc(labels[i])}</text>`;
  }).join('');
  return `<svg class="hi-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${b}</svg>`;
}

/** Jahres-Heatmap: Spalten = Wochen (Mo oben), Intensitaet nach Anzahl Abschluesse. */
export function heatmap(heat, year, ariaLabel) {
  const cell = 11; const gap = 3; const start = new Date(Date.UTC(year, 0, 1));
  const offset = (start.getUTCDay() + 6) % 7;
  const max = Math.max(1, ...Object.values(heat));
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  let out = '';
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(year, 0, 1 + i)).toISOString().slice(0, 10);
    const col = Math.floor((i + offset) / 7); const row = (i + offset) % 7;
    const v = heat[d] || 0;
    const op = v ? 0.3 + 0.7 * (v / max) : 0;
    out += `<rect x="${col * (cell + gap)}" y="${row * (cell + gap)}" width="${cell}" height="${cell}" rx="3" fill="${v ? ACC : GRID}" opacity="${v ? op.toFixed(2) : 0.35}"><title>${d}: ${v}</title></rect>`;
  }
  const cols = Math.ceil((days + offset) / 7);
  const w = cols * (cell + gap);
  return `<div class="hi-heat" tabindex="0" role="img" aria-label="${esc(ariaLabel)}"><svg viewBox="0 0 ${w} ${7 * (cell + gap)}" width="${w}" height="${7 * (cell + gap)}">${out}</svg></div>`;
}
