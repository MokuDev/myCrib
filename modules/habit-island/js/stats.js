import { t } from '/i18n.js';
import { esc } from '/utils/html.js';
import { get, localDate } from './api.js';
import { icon, refreshIcons, weekdayLabels, monthLabels, nf } from './ui.js';
import { lineChart, gauge, bars, heatmap } from './charts.js';

const L = (k, p) => t(`extensions.habit-island.${k}`, p);

export async function renderStats(root, ctx) {
  const { state, signal } = ctx;
  const today = localDate();
  let habit = '';
  let year = Number(today.slice(0, 4));

  async function paint() {
    let s;
    try { s = await get('/stats', { today, year, ...(habit ? { habit } : {}) }, signal); }
    catch (err) { if (err?.name === 'AbortError' || signal.aborted) return; ctx.fail(err); return; }
    if (signal.aborted) return;
    const fmt = new Intl.DateTimeFormat(ctx.locale || undefined, { day: 'numeric', month: 'short' });
    const first = s.series[0]?.date; const last = s.series.at(-1)?.date;
    const months = monthLabels(ctx.locale);
    const tile = (ic, val, label, tone) => `<div class="hi-tile hi-tile--${tone}">${icon(ic)}<strong>${nf(val)}</strong><span>${esc(label)}</span></div>`;
    const card = (title, ic, body, cls = '') => `<section class="hi-card ${cls}"><header class="hi-card__head"><h3>${esc(title)}</h3><span class="hi-badge">${icon(ic)}</span></header>${body}</section>`;

    root.replaceChildren();
    root.insertAdjacentHTML('beforeend', `
      <div class="hi-chips hi-filter" role="group" aria-label="${esc(L('stats.filter'))}">
        <button type="button" class="hi-pill" data-habit="" aria-pressed="${habit === ''}">${esc(L('stats.all'))}</button>
        ${state.habits.map((h) => `<button type="button" class="hi-pill" data-habit="${h.id}" aria-pressed="${String(h.id) === habit}">${esc(h.name)}</button>`).join('')}
      </div>
      <div class="hi-yearnav">
        <button type="button" class="hi-iconbtn" data-year="-1" aria-label="${esc(L('stats.prevYear'))}">${icon('chevron-left')}</button>
        <strong>${s.year}</strong>
        <button type="button" class="hi-iconbtn" data-year="1" ${s.year >= Number(today.slice(0, 4)) ? 'disabled' : ''} aria-label="${esc(L('stats.nextYear'))}">${icon('chevron-right')}</button>
      </div>
      <section class="hi-card">${heatmap(s.heat, s.year, L('stats.heatAria', { year: s.year }))}</section>
      <div class="hi-tiles">
        ${tile('hash', s.total, L('stats.total'), 'a')}${tile('trophy', s.bestStreak, L('stats.best'), 'b')}
        ${tile('flame', s.currentStreak, L('stats.current'), 'c')}${tile('percent', s.rate90, `${L('stats.rate')} (90 ${L('stats.days')})`, 'd')}
      </div>
      ${card(L('stats.completed'), 'check-circle-2', `<dl class="hi-dl">
        <div><dt>${esc(L('stats.week'))}</dt><dd>${nf(s.thisWeek)}</dd></div><div><dt>${esc(L('stats.month'))}</dt><dd>${nf(s.thisMonth)}</dd></div>
        <div><dt>${esc(L('stats.year'))}</dt><dd>${nf(s.thisYear)}</dd></div><div><dt>${esc(L('stats.all'))}</dt><dd>${nf(s.total)}</dd></div></dl>`)}
      <div class="hi-grid">
        ${card(L('stats.seriesDev'), 'trending-up', lineChart(s.series, { ariaLabel: L('stats.seriesDev'), labels: first ? (first === last ? [{ at: 0, text: fmt.format(new Date(`${first}T00:00:00`)) }] : [{ at: 0, text: fmt.format(new Date(`${first}T00:00:00`)) }, { at: s.series.length - 1, text: fmt.format(new Date(`${last}T00:00:00`)) }]) : [] }))}
        ${card(L('stats.perMonth'), 'line-chart', lineChart(s.monthly.map((v) => ({ value: v })), { ariaLabel: L('stats.perMonth'), labels: [0, 3, 6, 9, 11].map((i) => ({ at: i, text: months[i] })) }))}
        ${card(L('stats.consistency'), 'target', gauge(s.rate90, L('stats.last90')))}
        ${card(L('stats.weekday'), 'calendar', bars(s.weekday, weekdayLabels(ctx.locale), L('stats.weekday')))}
      </div>
      ${s.currentStreak > 1 ? `<div class="hi-banner">${icon('flame')}<strong>${esc(L('stats.banner', { n: s.currentStreak }))}</strong></div>` : ''}`);
    refreshIcons(root);
    const heat = root.querySelector('.hi-heat');
    if (heat && s.year === Number(today.slice(0, 4))) heat.scrollLeft = heat.scrollWidth; // heute rechts im Blick
  }

  root.addEventListener('click', (ev) => {
    const h = ev.target.closest('[data-habit]');
    const y = ev.target.closest('[data-year]');
    if (h) { habit = h.dataset.habit; paint(); }
    if (y && !y.disabled) { year += Number(y.dataset.year); paint(); }
  }, { signal });

  await paint();
}
