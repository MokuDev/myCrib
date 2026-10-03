import { t } from '/i18n.js';
import { esc } from '/utils/html.js';

const L = (k, p) => t(`extensions.habit-island.${k}`, p);
const p2 = (n) => String(n).padStart(2, '0');

export async function renderWidget(container, { options } = {}) {
  const d = new Date();
  const today = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  let state;
  try {
    const res = await fetch(`/api/extensions/habit-island/state?today=${today}`, { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    state = await res.json();
  } catch {
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend', `<p style="color:var(--color-text-secondary);font-size:var(--text-sm)">${esc(L('error.unreachable'))}</p>`);
    return;
  }
  const due = state.habits.filter((h) => h.scheduledToday);
  const done = due.filter((h) => h.doneToday).length;
  const best = state.habits.reduce((m, h) => Math.max(m, h.streak), 0);
  container.replaceChildren();
  container.insertAdjacentHTML('beforeend', `
    <div style="display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-2)">
      <strong style="font-size:var(--text-3xl);color:var(--active-module-accent,var(--color-text-primary))">${due.length ? `${done}/${due.length}` : '–'}</strong>
      <span style="color:var(--color-text-secondary);font-size:var(--text-sm)">${esc(L(due.length ? 'widget.today' : 'today.nothingDue'))}</span>
      ${options?.compact ? '' : `<span style="color:var(--color-text-primary)">🔥 ${best} · 🌱 ${state.seeds}</span>`}
    </div>`);
}
