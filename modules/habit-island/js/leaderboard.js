import { t } from '/i18n.js';
import { esc } from '/utils/html.js';
import { get, patch, localDate } from './api.js';
import { icon, refreshIcons, nf } from './ui.js';

const L = (k, p) => t(`extensions.habit-island.${k}`, p);
const PERIODS = ['week', 'month', 'all'];

export async function renderLeaderboard(root, ctx) {
  const { state, signal } = ctx;
  let period = 'week';

  async function paint() {
    let data;
    try { data = await get('/leaderboard', { today: localDate(), period }, signal); }
    catch (err) { if (err?.name === 'AbortError' || signal.aborted) return; ctx.fail(err); return; }
    if (signal.aborted) return;
    const rows = data.entries.map((e, i) => `
      <li class="hi-rank${e.me ? ' is-me' : ''}">
        <span class="hi-rank__n">${i < 3 ? icon('trophy', `hi-medal hi-medal--${i + 1}`) : i + 1}</span>
        <span class="hi-rank__name">${esc(e.name)}${e.me ? ` <em>${esc(L('board.you'))}</em>` : ''}
          <span class="hi-muted">${esc(L('board.sub', { streak: e.streak, items: e.placed }))}</span></span>
        <strong class="hi-rank__seeds">${nf(e.seeds)}<small> ${esc(L('seeds'))}</small></strong>
      </li>`).join('');
    root.replaceChildren();
    root.insertAdjacentHTML('beforeend', `
      <div class="hi-seg" role="group" aria-label="${esc(L('board.period'))}">
        ${PERIODS.map((p) => `<button type="button" class="hi-seg__btn" data-period="${p}" aria-pressed="${p === period}">${esc(L(`board.${p}`))}</button>`).join('')}
      </div>
      ${rows ? `<ol class="hi-ranks">${rows}</ol>` : `<div class="hi-card hi-empty"><p>${esc(L('board.empty'))}</p></div>`}
      ${state.canWrite ? `<label class="hi-switch"><input type="checkbox" data-optin ${state.showLeaderboard ? 'checked' : ''}><span>${esc(L('board.optIn'))}</span></label>` : ''}
      <p class="hi-muted hi-note">${esc(L('board.note'))}</p>`);
    refreshIcons(root);
  }

  root.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-period]');
    if (b) { period = b.dataset.period; paint(); }
  }, { signal });
  root.addEventListener('change', async (ev) => {
    if (!ev.target.matches('[data-optin]')) return;
    try { await patch('/settings', { showLeaderboard: ev.target.checked }, signal); state.showLeaderboard = ev.target.checked; paint(); }
    catch (err) { if (err?.name !== 'AbortError') ctx.fail(err); }
  }, { signal });

  await paint();
}
