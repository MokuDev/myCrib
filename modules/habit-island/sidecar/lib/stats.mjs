// Reine Funktionen: Serien, Abschlussraten, Heatmap. Keine I/O, daher testbar.
// Datum immer als 'YYYY-MM-DD' (lokales Kalenderdatum des Nutzers).

export const ALL_DAYS = 127; // Bitmaske Mo..So (Bit 0 = Montag)

export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** 0 = Montag ... 6 = Sonntag */
export function weekdayIndex(date) {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function weekStart(date) { return addDays(date, -weekdayIndex(date)); }

export function isSlot(habit, date) {
  if (habit.created_date > date) return false;
  if (habit.archived_date && date >= habit.archived_date) return false;
  return ((habit.weekdays ?? ALL_DAYS) >> weekdayIndex(date) & 1) === 1;
}

function doneSet(completions) {
  return new Set(completions.map((c) => `${c.habit_id}|${c.date}`));
}

/** Serie eines einzelnen Habits: nicht geplante Tage zaehlen nicht, heute offen bricht nichts. */
export function habitStreak(habit, completions, today) {
  const done = doneSet(completions);
  let run = 0;
  let best = 0;
  for (let d = habit.created_date; d <= today; d = addDays(d, 1)) {
    if (!isSlot(habit, d)) continue;
    if (done.has(`${habit.id}|${d}`)) { run += 1; best = Math.max(best, run); }
    else if (d !== today) run = 0;
  }
  return { current: run, best };
}

/** Serie perfekter Tage ueber eine Habit-Menge (Tage ohne Slots sind neutral). */
export function perfectSeries(habits, completions, from, today) {
  const done = doneSet(completions);
  const out = [];
  let run = 0;
  for (let d = from; d <= today; d = addDays(d, 1)) {
    const slots = habits.filter((h) => isSlot(h, d));
    if (slots.length) {
      const all = slots.every((h) => done.has(`${h.id}|${d}`));
      if (all) run += 1;
      else if (d !== today) run = 0;
    }
    out.push({ date: d, value: run });
  }
  return out;
}

export function computeStats({ habits, completions, today, year }) {
  const ids = new Set(habits.map((h) => h.id));
  const comps = completions.filter((c) => ids.has(c.habit_id));
  const y = String(year ?? today.slice(0, 4));
  const monday = weekStart(today);
  const month = today.slice(0, 7);

  const weekday = [0, 0, 0, 0, 0, 0, 0];
  const monthly = new Array(12).fill(0);
  const heat = {};
  let thisWeek = 0;
  let thisMonth = 0;
  let thisYear = 0;
  for (const c of comps) {
    weekday[weekdayIndex(c.date)] += 1;
    if (c.date >= monday && c.date <= today) thisWeek += 1;
    if (c.date.startsWith(month)) thisMonth += 1;
    if (c.date.startsWith(today.slice(0, 4))) thisYear += 1;
    if (c.date.startsWith(y)) {
      monthly[Number(c.date.slice(5, 7)) - 1] += 1;
      heat[c.date] = (heat[c.date] || 0) + 1;
    }
  }

  const first = habits.reduce((m, h) => (m && m < h.created_date ? m : h.created_date), '') || today;
  const rangeStart = first < addDays(today, -89) ? addDays(today, -89) : first;
  const series = perfectSeries(habits, comps, first, today);
  const recent = series.filter((p) => p.date >= addDays(today, -89));
  const best = series.reduce((m, p) => Math.max(m, p.value), 0);
  const current = series.length ? series[series.length - 1].value : 0;

  let slots = 0;
  let hits = 0;
  const done = doneSet(comps);
  for (let d = rangeStart; d <= today; d = addDays(d, 1)) {
    for (const h of habits) {
      if (!isSlot(h, d)) continue;
      slots += 1;
      if (done.has(`${h.id}|${d}`)) hits += 1;
    }
  }

  return {
    total: comps.length,
    thisWeek, thisMonth, thisYear,
    bestStreak: best,
    currentStreak: current,
    rate90: slots ? Math.round((hits / slots) * 100) : 0,
    weekday, monthly, heat,
    series: recent,
    year: Number(y),
  };
}

/** Meilensteine fuer Serien-Boni (einmalig je Habit). */
export const STREAK_BONUS = Object.freeze({ 7: 50, 30: 200, 100: 1000 });
