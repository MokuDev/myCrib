import { esc } from '/utils/html.js';

export const ICON_CHOICES = ['check', 'tooth', 'droplet', 'book-open', 'dumbbell', 'bed', 'footprints', 'apple', 'code', 'brain', 'sparkles', 'pill', 'heart', 'music', 'pencil', 'sun'];
// Lucide kennt "tooth" nicht in jeder Version; Fallback-Name pro Icon.
export const LUCIDE = { tooth: 'smile' };
export const lucide = (name) => LUCIDE[name] || name;

export const icon = (name, cls = '') => `<i data-lucide="${esc(lucide(name))}" class="${esc(cls)}" aria-hidden="true"></i>`;

export function refreshIcons(el) { window.lucide?.createIcons?.({ el }); }

export function weekdayLabels(locale, style = 'narrow') {
  const f = new Intl.DateTimeFormat(locale || undefined, { weekday: style, timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2026, 9, 5 + i)))); // 5.10.2026 = Montag
}

export function monthLabels(locale) {
  const f = new Intl.DateTimeFormat(locale || undefined, { month: 'short', timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, i) => f.format(new Date(Date.UTC(2026, i, 1))));
}

export const nf = (n) => new Intl.NumberFormat(document.documentElement.lang || undefined).format(n);
