import test from 'node:test';
import assert from 'node:assert/strict';
import { habitStreak, computeStats, weekdayIndex, weekStart } from '../lib/stats.mjs';

const h = (o = {}) => ({ id: 1, weekdays: 127, created_date: '2026-09-01', archived_date: null, ...o });
const c = (date, habit_id = 1) => ({ habit_id, date });

test('weekdayIndex: Montag = 0', () => {
  assert.equal(weekdayIndex('2026-10-05'), 0);
  assert.equal(weekdayIndex('2026-10-04'), 6);
  assert.equal(weekStart('2026-10-03'), '2026-09-28');
});

test('Serie: heute offen bricht nicht, gestern offen bricht', () => {
  const comps = ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'].map((d) => c(d));
  assert.deepEqual(habitStreak(h(), comps, '2026-10-03'), { current: 4, best: 4 });
  assert.equal(habitStreak(h(), comps, '2026-10-04').current, 0);
});

test('Serie: nicht geplante Tage zaehlen nicht', () => {
  const mo_di = 0b0000011; // Mo, Di
  const comps = [c('2026-10-05'), c('2026-10-06'), c('2026-10-12')];
  assert.equal(habitStreak(h({ weekdays: mo_di }), comps, '2026-10-12').current, 3);
});

test('Stats: Zaehler, Rate, Heatmap', () => {
  const comps = [c('2026-10-01'), c('2026-10-02'), c('2026-10-03')];
  const s = computeStats({ habits: [h({ created_date: '2026-10-01' })], completions: comps, today: '2026-10-03' });
  assert.equal(s.total, 3);
  assert.equal(s.thisYear, 3);
  assert.equal(s.rate90, 100);
  assert.equal(s.currentStreak, 3);
  assert.equal(s.heat['2026-10-02'], 1);
  assert.equal(s.monthly[9], 3);
});

test('Stats: leer', () => {
  const s = computeStats({ habits: [], completions: [], today: '2026-10-03' });
  assert.equal(s.total, 0); assert.equal(s.rate90, 0); assert.equal(s.currentStreak, 0);
});
