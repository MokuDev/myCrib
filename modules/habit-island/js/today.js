import { t } from '/i18n.js';
import { esc } from '/utils/html.js';
import { post, patch, del, localDate } from './api.js';
import { icon, refreshIcons, ICON_CHOICES, weekdayLabels, nf } from './ui.js';

const L = (k, p) => t(`extensions.habit-island.${k}`, p);

export function renderToday(root, ctx) {
  const { state, signal } = ctx;
  const today = localDate();
  const due = state.habits.filter((h) => h.scheduledToday);
  const done = due.filter((h) => h.doneToday).length;
  const pct = due.length ? Math.round((done / due.length) * 100) : 0;
  const days = weekdayLabels(ctx.locale);
  let editing = null; // null | 'new' | habit id

  const row = (h) => `
    <li class="hi-habit${h.doneToday ? ' is-done' : ''}${h.scheduledToday ? '' : ' is-off'}" data-id="${h.id}">
      <button type="button" class="hi-check" data-act="toggle" aria-pressed="${h.doneToday}" ${!h.scheduledToday || !state.canWrite ? 'disabled' : ''}
        aria-label="${esc(h.doneToday ? L('today.undo', { name: h.name }) : L('today.complete', { name: h.name }))}">${icon('check')}</button>
      <span class="hi-habit__icon">${icon(h.icon)}</span>
      <span class="hi-habit__body">
        <span class="hi-habit__name">${esc(h.name)}</span>
        <span class="hi-habit__meta">${h.scheduledToday ? esc(L('today.reward', { n: state.reward })) : esc(L('today.restDay'))}</span>
      </span>
      ${h.streak > 0 ? `<span class="hi-streak" title="${esc(L('today.streak'))}">${icon('flame')}${nf(h.streak)}</span>` : ''}
      ${state.canWrite ? `<button type="button" class="hi-iconbtn" data-act="edit" aria-label="${esc(L('today.edit', { name: h.name }))}">${icon('pencil')}</button>` : ''}
    </li>`;

  const form = () => {
    const h = editing === 'new' ? { name: '', icon: 'check', weekdays: 127 } : state.habits.find((x) => x.id === editing);
    if (!h) return '';
    return `<form class="hi-form" data-form novalidate>
      <label class="hi-field"><span>${esc(L('form.name'))}</span>
        <input name="name" maxlength="60" required value="${esc(h.name)}" autocomplete="off" placeholder="${esc(L('form.namePlaceholder'))}"></label>
      <fieldset class="hi-field"><legend>${esc(L('form.icon'))}</legend>
        <div class="hi-chips">${ICON_CHOICES.map((i) => `<label class="hi-chip"><input type="radio" name="icon" value="${i}" ${i === h.icon ? 'checked' : ''}><span>${icon(i)}</span></label>`).join('')}</div></fieldset>
      <fieldset class="hi-field"><legend>${esc(L('form.days'))}</legend>
        <div class="hi-chips">${days.map((d, i) => `<label class="hi-chip hi-chip--text"><input type="checkbox" name="wd" value="${i}" ${(h.weekdays >> i) & 1 ? 'checked' : ''}><span>${esc(d)}</span></label>`).join('')}</div></fieldset>
      <p class="hi-form__error" role="alert" data-error hidden></p>
      <div class="hi-form__actions">
        ${editing !== 'new' ? `<button type="button" class="hi-btn hi-btn--danger" data-act="delete">${esc(L('form.delete'))}</button>` : ''}
        <span class="hi-spacer"></span>
        <button type="button" class="hi-btn" data-act="cancel">${esc(L('form.cancel'))}</button>
        <button type="submit" class="hi-btn hi-btn--primary">${esc(L('form.save'))}</button>
      </div></form>`;
  };

  function paint() {
    root.replaceChildren();
    root.insertAdjacentHTML('beforeend', `
      <section class="hi-card hi-hero">
        <div class="hi-ring" style="--p:${pct}"><span>${due.length ? `${done}/${due.length}` : '–'}</span></div>
        <div>
          <h2 class="hi-h2">${esc(due.length && done === due.length ? L('today.allDone') : L('today.title'))}</h2>
          <p class="hi-muted">${esc(due.length ? L('today.progress', { done, total: due.length }) : L('today.nothingDue'))}</p>
        </div>
      </section>
      ${state.habits.length ? `<ul class="hi-list">${state.habits.map(row).join('')}</ul>` : `<div class="hi-card hi-empty">${icon('sprout')}<p>${esc(L('today.empty'))}</p></div>`}
      ${state.canWrite ? (editing ? form() : `<button type="button" class="hi-btn hi-btn--primary hi-add" data-act="add">${icon('plus')}${esc(L('today.add'))}</button>`) : ''}`);
    refreshIcons(root);
    if (editing) root.querySelector('input[name="name"]')?.focus();
  }

  async function guarded(fn) {
    try { await fn(); } catch (err) { if (err?.name === 'AbortError' || signal.aborted) return; ctx.fail(err); }
  }

  root.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const id = Number(btn.closest('[data-id]')?.dataset.id);
    const act = btn.dataset.act;
    if (act === 'add') { editing = 'new'; paint(); }
    else if (act === 'edit') { editing = id; paint(); }
    else if (act === 'cancel') { editing = null; paint(); }
    else if (act === 'toggle') {
      const h = state.habits.find((x) => x.id === id);
      btn.disabled = true;
      guarded(async () => {
        const r = await post(`/habits/${id}/check`, { date: today, done: !h.doneToday }, signal);
        if (signal.aborted) return;
        if (r.gained) ctx.toast(L('today.gained', { n: r.gained }));
        await ctx.reload();
      }).finally(() => { btn.disabled = false; });
    } else if (act === 'delete') {
      if (!window.confirm(L('form.confirmDelete'))) return;
      guarded(async () => { await del(`/habits/${editing}`, { today }, signal); editing = null; await ctx.reload(); });
    }
  }, { signal });

  root.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const name = String(fd.get('name') || '').trim();
    const err = root.querySelector('[data-error]');
    const wd = fd.getAll('wd').reduce((m, i) => m | (1 << Number(i)), 0);
    if (!name || !wd) { err.textContent = L(name ? 'form.errorDays' : 'form.errorName'); err.hidden = false; return; }
    const body = { name, icon: fd.get('icon'), weekdays: wd };
    guarded(async () => {
      if (editing === 'new') await post('/habits', { ...body, today }, signal);
      else await patch(`/habits/${editing}`, body, signal);
      editing = null;
      await ctx.reload();
    });
  }, { signal });

  paint();
}
