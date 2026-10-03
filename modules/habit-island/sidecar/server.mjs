// habit-island sidecar: eigener Dienst neben myCrib, ohne Abhaengigkeiten (Node >= 22).
// Identitaet kommt AUSSCHLIESSLICH aus GET /api/v1/auth/me mit dem durchgereichten Session-Cookie.
import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { openDb, tx, balance } from './lib/db.mjs';
import { CATALOG, BASE_REWARD, START_SIZE, MAX_SIZE, MAX_HABITS, expandCost } from './lib/catalog.mjs';
import { computeStats, habitStreak, perfectSeries, isSlot, addDays, weekStart, ALL_DAYS, STREAK_BONUS } from './lib/stats.mjs';

const MODULE_ID = 'habit-island';
const PREFIX = `/api/extensions/${MODULE_ID}`;
const CSRF_COOKIE = 'hi_csrf';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function createApp({ mycribUrl, publicOrigin, dataDir, authTtlMs = 5000, fetchImpl = fetch }) {
  const db = openDb(dataDir);
  const secure = String(publicOrigin).startsWith('https:');
  const authCache = new Map();

  async function whoami(cookie) {
    if (!cookie) return null;
    const hit = authCache.get(cookie);
    if (hit && Date.now() - hit.at < authTtlMs) return hit.me;
    let res;
    try { res = await fetchImpl(`${mycribUrl}/api/v1/auth/me`, { headers: { cookie } }); } catch { return null; }
    if (!res.ok) return null;
    const me = await res.json().catch(() => null);
    if (!me?.user?.id) return null;
    if (authCache.size > 500) authCache.clear();
    authCache.set(cookie, { at: Date.now(), me });
    return me;
  }

  const parseCookies = (h = '') => Object.fromEntries(h.split(';').map((c) => c.trim().split(/=(.*)/s).slice(0, 2)).filter(([k]) => k));
  const send = (res, status, body, extra = {}) => {
    res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra });
    res.end(body === undefined ? '' : JSON.stringify(body));
  };
  const fail = (status, error) => Object.assign(new Error(error), { status });

  async function readBody(req) {
    const chunks = []; let n = 0;
    for await (const c of req) { n += c.length; if (n > 16384) throw fail(413, 'Body too large.'); chunks.push(c); }
    if (!n) return {};
    try { const b = JSON.parse(Buffer.concat(chunks).toString('utf8')); return b && typeof b === 'object' ? b : {}; }
    catch { throw fail(400, 'Invalid JSON.'); }
  }

  const utcToday = () => new Date().toISOString().slice(0, 10);
  // Der Client schickt sein lokales Datum; es darf nur +-1 Tag vom UTC-Datum abweichen (Zeitzonen).
  function clientDate(v, { allowYesterday = true } = {}) {
    if (!DATE_RE.test(String(v || ''))) throw fail(400, 'date must be YYYY-MM-DD.');
    const u = utcToday();
    if (v < addDays(u, -1) || v > addDays(u, 1)) throw fail(400, 'date out of range.');
    return v;
  }
  const cleanName = (v) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const ICONS = new Set(['check', 'tooth', 'droplet', 'book-open', 'dumbbell', 'bed', 'footprints', 'apple', 'code', 'brain', 'sparkles', 'pill', 'heart', 'music', 'pencil', 'sun']);

  const habitsOf = (uid) => db.prepare('SELECT * FROM habits WHERE user_id = ? AND archived_date IS NULL ORDER BY id').all(uid);
  const allHabitsOf = (uid) => db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY id').all(uid);
  const compsOf = (uid) => db.prepare('SELECT habit_id, date FROM completions WHERE user_id = ?').all(uid);

  function award(uid, habit, date) {
    const comps = compsOf(uid).filter((c) => c.habit_id === habit.id);
    const { current } = habitStreak(habit, comps, date);
    const bonus = STREAK_BONUS[current];
    if (bonus) {
      db.prepare('INSERT OR IGNORE INTO ledger (user_id, delta, reason, ref, date) VALUES (?, ?, ?, ?, ?)')
        .run(uid, bonus, 'streak', `streak:${habit.id}:${current}`, date);
    }
    return bonus || 0;
  }

  const routes = [];
  const route = (method, pattern, handler) => routes.push({ method, re: new RegExp(`^${pattern}$`), handler });

  route('GET', '/csrf', (ctx) => ({ token: ctx.csrf }));

  route('GET', '/state', (ctx) => {
    const today = clientDate(ctx.query.get('today'));
    const uid = ctx.uid;
    const habits = habitsOf(uid);
    const comps = compsOf(uid);
    const doneToday = new Set(comps.filter((c) => c.date === today).map((c) => c.habit_id));
    const player = db.prepare('SELECT show_lb, island_size FROM players WHERE user_id = ?').get(uid);
    return {
      user: { id: uid, display_name: ctx.me.user.display_name },
      canWrite: ctx.canWrite,
      seeds: balance(db, uid),
      showLeaderboard: !!player.show_lb,
      reward: BASE_REWARD,
      habits: habits.map((h) => {
        const hc = comps.filter((c) => c.habit_id === h.id);
        const { current, best } = habitStreak(h, hc, today);
        return { id: h.id, name: h.name, icon: h.icon, weekdays: h.weekdays, scheduledToday: isSlot(h, today), doneToday: doneToday.has(h.id), streak: current, bestStreak: best };
      }),
    };
  });

  route('POST', '/habits', (ctx) => {
    const name = cleanName(ctx.body.name);
    if (!name) throw fail(400, 'name required.');
    const today = clientDate(ctx.body.today);
    const icon = ICONS.has(ctx.body.icon) ? ctx.body.icon : 'check';
    const weekdays = Number.isInteger(ctx.body.weekdays) && ctx.body.weekdays > 0 && ctx.body.weekdays <= ALL_DAYS ? ctx.body.weekdays : ALL_DAYS;
    if (habitsOf(ctx.uid).length >= MAX_HABITS) throw fail(409, 'Habit limit reached.');
    const r = db.prepare('INSERT INTO habits (user_id, name, icon, weekdays, created_date) VALUES (?, ?, ?, ?, ?)').run(ctx.uid, name, icon, weekdays, today);
    return { id: Number(r.lastInsertRowid) };
  });

  route('PATCH', '/habits/(\\d+)', (ctx, id) => {
    const h = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ? AND archived_date IS NULL').get(Number(id), ctx.uid);
    if (!h) throw fail(404, 'Habit not found.');
    const name = ctx.body.name === undefined ? h.name : cleanName(ctx.body.name);
    if (!name) throw fail(400, 'name required.');
    const icon = ICONS.has(ctx.body.icon) ? ctx.body.icon : h.icon;
    const wd = Number.isInteger(ctx.body.weekdays) && ctx.body.weekdays > 0 && ctx.body.weekdays <= ALL_DAYS ? ctx.body.weekdays : h.weekdays;
    db.prepare('UPDATE habits SET name = ?, icon = ?, weekdays = ? WHERE id = ?').run(name, icon, wd, h.id);
    return { ok: true };
  });

  route('DELETE', '/habits/(\\d+)', (ctx, id) => {
    const today = clientDate(ctx.query.get('today'));
    const r = db.prepare('UPDATE habits SET archived_date = ? WHERE id = ? AND user_id = ? AND archived_date IS NULL').run(addDays(today, 1), Number(id), ctx.uid);
    if (!r.changes) throw fail(404, 'Habit not found.');
    return { ok: true };
  });

  route('POST', '/habits/(\\d+)/check', (ctx, id) => tx(db, () => {
    const date = clientDate(ctx.body.date);
    const done = ctx.body.done !== false;
    const h = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ? AND archived_date IS NULL').get(Number(id), ctx.uid);
    if (!h) throw fail(404, 'Habit not found.');
    if (!isSlot(h, date)) throw fail(409, 'Habit not scheduled on that day.');
    const ref = `c:${h.id}:${date}`;
    if (done) {
      const r = db.prepare('INSERT OR IGNORE INTO completions (habit_id, date, user_id) VALUES (?, ?, ?)').run(h.id, date, ctx.uid);
      let gained = 0;
      if (r.changes) {
        db.prepare('INSERT OR IGNORE INTO ledger (user_id, delta, reason, ref, date) VALUES (?, ?, ?, ?, ?)').run(ctx.uid, BASE_REWARD, 'habit', ref, date);
        gained = BASE_REWARD + award(ctx.uid, h, date);
      }
      return { seeds: balance(db, ctx.uid), gained };
    }
    const r = db.prepare('DELETE FROM completions WHERE habit_id = ? AND date = ?').run(h.id, date);
    if (r.changes) db.prepare('DELETE FROM ledger WHERE user_id = ? AND ref = ?').run(ctx.uid, ref);
    // Ein Rueckgaengig darf nie ins Minus fuehren: Kaeufe bleiben gueltig, Guthaben wird auf 0 geklemmt.
    const bal = balance(db, ctx.uid);
    if (bal < 0) db.prepare('INSERT INTO ledger (user_id, delta, reason, date) VALUES (?, ?, ?, ?)').run(ctx.uid, -bal, 'adjust', date);
    return { seeds: balance(db, ctx.uid), gained: 0 };
  }));

  route('GET', '/stats', (ctx) => {
    const today = clientDate(ctx.query.get('today'));
    const hid = ctx.query.get('habit');
    let habits = allHabitsOf(ctx.uid);
    if (hid) habits = habits.filter((h) => h.id === Number(hid));
    const year = Number(ctx.query.get('year')) || Number(today.slice(0, 4));
    if (year < 2000 || year > 2100) throw fail(400, 'year out of range.');
    return computeStats({ habits, completions: compsOf(ctx.uid), today, year });
  });

  route('GET', '/shop', (ctx) => {
    const inv = db.prepare('SELECT id, item, x, y FROM inventory WHERE user_id = ? ORDER BY id').all(ctx.uid);
    const size = db.prepare('SELECT island_size FROM players WHERE user_id = ?').get(ctx.uid).island_size;
    return {
      seeds: balance(db, ctx.uid),
      catalog: Object.entries(CATALOG).map(([id, c]) => ({ id, ...c })),
      inventory: inv, size, maxSize: MAX_SIZE, expandCost: expandCost(size),
    };
  });

  route('POST', '/shop/buy', (ctx) => tx(db, () => {
    const item = CATALOG[ctx.body.item];
    if (!item || !Object.hasOwn(CATALOG, ctx.body.item)) throw fail(400, 'Unknown item.');
    if (balance(db, ctx.uid) < item.cost) throw fail(402, 'Not enough seeds.');
    db.prepare('INSERT INTO ledger (user_id, delta, reason, date) VALUES (?, ?, ?, ?)').run(ctx.uid, -item.cost, `buy:${ctx.body.item}`, utcToday());
    const r = db.prepare('INSERT INTO inventory (user_id, item) VALUES (?, ?)').run(ctx.uid, ctx.body.item);
    return { id: Number(r.lastInsertRowid), seeds: balance(db, ctx.uid) };
  }));

  route('POST', '/island/expand', (ctx) => tx(db, () => {
    const size = db.prepare('SELECT island_size FROM players WHERE user_id = ?').get(ctx.uid).island_size;
    const cost = expandCost(size);
    if (cost === null) throw fail(409, 'Island is at maximum size.');
    if (balance(db, ctx.uid) < cost) throw fail(402, 'Not enough seeds.');
    db.prepare('INSERT INTO ledger (user_id, delta, reason, date) VALUES (?, ?, ?, ?)').run(ctx.uid, -cost, 'expand', utcToday());
    db.prepare('UPDATE players SET island_size = ? WHERE user_id = ?').run(size + 1, ctx.uid);
    return { size: size + 1, seeds: balance(db, ctx.uid) };
  }));

  route('POST', '/island/place', (ctx) => {
    const id = Number(ctx.body.id);
    const { x, y } = ctx.body;
    const size = db.prepare('SELECT island_size FROM players WHERE user_id = ?').get(ctx.uid).island_size;
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= size || y >= size) throw fail(400, 'Tile out of range.');
    const inv = db.prepare('SELECT id FROM inventory WHERE id = ? AND user_id = ?').get(id, ctx.uid);
    if (!inv) throw fail(404, 'Item not found.');
    try { db.prepare('UPDATE inventory SET x = ?, y = ? WHERE id = ?').run(x, y, id); }
    catch { throw fail(409, 'Tile occupied.'); }
    return { ok: true };
  });

  route('POST', '/island/pickup', (ctx) => {
    const r = db.prepare('UPDATE inventory SET x = NULL, y = NULL WHERE id = ? AND user_id = ?').run(Number(ctx.body.id), ctx.uid);
    if (!r.changes) throw fail(404, 'Item not found.');
    return { ok: true };
  });

  route('PATCH', '/settings', (ctx) => {
    if (typeof ctx.body.showLeaderboard !== 'boolean') throw fail(400, 'showLeaderboard must be boolean.');
    db.prepare('UPDATE players SET show_lb = ? WHERE user_id = ?').run(ctx.body.showLeaderboard ? 1 : 0, ctx.uid);
    return { ok: true };
  });

  route('GET', '/leaderboard', (ctx) => {
    const today = clientDate(ctx.query.get('today'));
    const period = ['week', 'month', 'all'].includes(ctx.query.get('period')) ? ctx.query.get('period') : 'week';
    const from = period === 'week' ? weekStart(today) : period === 'month' ? `${today.slice(0, 7)}-01` : '0000-00-00';
    const rows = db.prepare(`
      SELECT p.user_id, p.display_name,
        COALESCE((SELECT SUM(delta) FROM ledger l WHERE l.user_id = p.user_id AND l.delta > 0 AND l.reason != 'adjust' AND l.date >= ? AND l.date <= ?), 0) AS earned,
        (SELECT COUNT(*) FROM inventory i WHERE i.user_id = p.user_id AND i.x IS NOT NULL) AS placed,
        p.island_size AS size
      FROM players p WHERE p.show_lb = 1`).all(from, addDays(today, 1));
    const entries = rows.map((r) => {
      const habits = allHabitsOf(r.user_id);
      const series = perfectSeries(habits, compsOf(r.user_id), habits[0]?.created_date ?? today, today);
      return { userId: r.user_id, name: r.display_name, seeds: r.earned, streak: series.at(-1)?.value ?? 0, placed: r.placed, size: r.size, me: r.user_id === ctx.uid };
    }).sort((a, b) => b.seeds - a.seeds || b.streak - a.streak || a.name.localeCompare(b.name));
    return { period, entries };
  });

  async function handle(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(`${PREFIX}/`) && url.pathname !== PREFIX) return send(res, 404, { error: 'Not found.' });
      const sub = url.pathname.slice(PREFIX.length) || '/';
      const method = req.method;
      const write = method !== 'GET' && method !== 'HEAD';

      const cookieHeader = req.headers.cookie || '';
      const me = await whoami(cookieHeader);
      if (!me) return send(res, 401, { error: 'Not authenticated.' });
      const level = me.permissions?.modules?.[`ext:${MODULE_ID}`];
      if (level === 'none') return send(res, 403, { error: 'No access to this module.' });
      const canWrite = level !== 'read';
      if (write && !canWrite) return send(res, 403, { error: 'Read-only.' });

      const cookies = parseCookies(cookieHeader);
      let csrf = cookies[CSRF_COOKIE];
      const extra = {};
      if (write) {
        const origin = req.headers.origin;
        if (origin !== publicOrigin) return send(res, 403, { error: 'Bad origin.' });
        const header = String(req.headers['x-hi-csrf'] || '');
        const a = Buffer.from(header); const b = Buffer.from(csrf || '');
        if (!csrf || a.length !== b.length || !timingSafeEqual(a, b)) return send(res, 403, { error: 'CSRF check failed.' });
      } else if (!csrf) {
        csrf = randomBytes(24).toString('hex');
        extra['set-cookie'] = `${CSRF_COOKIE}=${csrf}; Path=${PREFIX}; SameSite=Lax${secure ? '; Secure' : ''}`;
      }

      const uid = me.user.id;
      db.prepare(`INSERT INTO players (user_id, display_name) VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET display_name = excluded.display_name`).run(uid, String(me.user.display_name || `#${uid}`).slice(0, 80));

      for (const r of routes) {
        if (r.method !== method) continue;
        const m = r.re.exec(sub);
        if (!m) continue;
        const body = write ? await readBody(req) : {};
        const out = await r.handler({ me, uid, canWrite, csrf, body, query: url.searchParams }, ...m.slice(1));
        return send(res, 200, out, extra);
      }
      return send(res, 404, { error: 'Not found.' }, extra);
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error(err);
      return send(res, status, { error: status >= 500 ? 'Internal error.' : err.message });
    }
  }

  const server = http.createServer(handle);
  server.on('close', () => db.close());
  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const port = Number(process.env.PORT || 3100);
  const publicOrigin = process.env.PUBLIC_ORIGIN;
  if (!publicOrigin) { console.error('PUBLIC_ORIGIN is required (e.g. https://home.example.org).'); process.exit(1); }
  createApp({
    mycribUrl: process.env.MYCRIB_URL || 'http://localhost:3000',
    publicOrigin,
    dataDir: process.env.DATA_DIR || './data',
  }).listen(port, () => console.log(`habit-island sidecar on :${port}`));
}
