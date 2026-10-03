import { t, getLocale } from '/i18n.js';
import { esc } from '/utils/html.js';
import { renderPageHeader, renderPageTitle, renderPageBody } from '/utils/page-layout.js';
import { get, localDate, SidecarError } from './js/api.js';
import { icon, refreshIcons, nf } from './js/ui.js';
import { renderToday } from './js/today.js';
import { renderIsland } from './js/island.js';
import { renderStats } from './js/stats.js';
import { renderLeaderboard } from './js/leaderboard.js';

const L = (k, p) => t(`extensions.habit-island.${k}`, p);
const TABS = [['today', 'calendar-check', renderToday], ['island', 'trees', renderIsland], ['stats', 'bar-chart-3', renderStats], ['board', 'trophy', renderLeaderboard]];
const TAB_KEY = 'habit-island:tab';

function savedTab() { try { const v = localStorage.getItem(TAB_KEY); return TABS.some(([id]) => id === v) ? v : 'today'; } catch { return 'today'; } }
function saveTab(v) { try { localStorage.setItem(TAB_KEY, v); } catch { /* optional */ } }

export async function render(container, context) {
  const { signal } = context;
  let tab = savedTab();
  let state = null;
  let body = null;

  const ctx = {
    get state() { return state; },
    signal,
    locale: getLocale?.() || document.documentElement.lang || undefined,
    reload: async () => { await loadState(); if (!signal.aborted) { updateSeeds(); paintTab(); } },
    updateSeeds,
    toast(msg) {
      const live = container.querySelector('[data-live]');
      if (!live) return;
      live.textContent = msg; live.classList.add('is-on');
      setTimeout(() => { if (!signal.aborted) live.classList.remove('is-on'); }, 2500);
    },
    fail(err) { showError(err); },
  };

  async function loadState() {
    try { state = await get('/state', { today: localDate() }, signal); }
    catch (err) { if (err?.name === 'AbortError' || signal.aborted) return; showError(err); }
  }

  function updateSeeds() {
    const el = container.querySelector('[data-seeds]');
    if (el && state) el.textContent = nf(state.seeds);
  }

  function showError(err) {
    if (signal.aborted) return;
    const denied = err instanceof SidecarError && err.status === 403;
    const moved = err instanceof SidecarError && (err.status === 404 || err.status === 405);
    const msg = denied ? L('error.denied') : moved ? L('error.moved') : L('error.unreachable');
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend',
      renderPageHeader({ title: renderPageTitle(L('title')) })
      + renderPageBody({ content: `<div class="hi-card hi-empty" role="alert">${icon('cloud-off')}<p>${esc(msg)}</p>${denied ? '' : `<button type="button" class="hi-btn hi-btn--primary" data-retry>${esc(L('error.retry'))}</button>`}</div>` }));
    refreshIcons(container);
    container.querySelector('[data-retry]')?.addEventListener('click', () => { start(); }, { signal });
  }

  function paintTab() {
    if (!state || signal.aborted) return;
    const next = document.createElement('div');
    next.className = 'hi-tab';
    next.id = `hi-panel-${tab}`;
    next.setAttribute('role', 'tabpanel');
    body.replaceChildren(next);
    const renderer = TABS.find(([id]) => id === tab)[2];
    Promise.resolve(renderer(next, ctx)).catch((err) => { if (err?.name !== 'AbortError' && !signal.aborted) showError(err); });
  }

  async function start() {
    await loadState();
    if (!state || signal.aborted) return;
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend',
      renderPageHeader({
        title: renderPageTitle(L('title')),
        actions: `<span class="hi-seeds" title="${esc(L('seeds'))}">${icon('sprout')}<strong data-seeds>${nf(state.seeds)}</strong><span class="hi-seeds__label">${esc(L('seeds'))}</span></span>`,
      })
      + renderPageBody({
        content: `<div class="hi-root">
          <div class="hi-seg hi-tabs" role="tablist" aria-label="${esc(L('title'))}">
            ${TABS.map(([id, ic]) => `<button type="button" role="tab" class="hi-seg__btn" id="hi-tab-${id}" data-tab="${id}" aria-label="${esc(L(`tabs.${id}`))}" aria-selected="${id === tab}" aria-controls="hi-panel-${id}">${icon(ic)}<span>${esc(L(`tabs.${id}`))}</span></button>`).join('')}
          </div>
          ${state.canWrite ? '' : `<p class="hi-muted hi-ro" role="status">${esc(L('readOnly'))}</p>`}
          <div data-body></div>
          <div class="hi-toast" data-live role="status" aria-live="polite"></div>
        </div>`,
      }));
    refreshIcons(container);
    body = container.querySelector('[data-body]');
    container.querySelector('.hi-tabs').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-tab]');
      if (!b || b.dataset.tab === tab) return;
      tab = b.dataset.tab; saveTab(tab);
      container.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x.dataset.tab === tab)));
      paintTab();
    }, { signal });
    paintTab();
  }

  await start();
}
