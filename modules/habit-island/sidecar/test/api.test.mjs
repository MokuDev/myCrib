import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server.mjs';

const ORIGIN = 'https://home.test';
const P = '/api/extensions/habit-island';
const today = new Date().toISOString().slice(0, 10);

// Fake-myCrib: Cookie "s=<name>" -> Nutzer.
const users = {
  anna: { user: { id: 1, display_name: 'Anna' }, permissions: { modules: {} } },
  ben: { user: { id: 2, display_name: 'Ben' }, permissions: { modules: { 'ext:habit-island': 'read' } } },
  cy: { user: { id: 3, display_name: 'Cy' }, permissions: { modules: { 'ext:habit-island': 'none' } } },
};
let mycribHits = 0;

async function boot() {
  const my = http.createServer((req, res) => {
    mycribHits += 1;
    const name = /s=(\w+)/.exec(req.headers.cookie || '')?.[1];
    if (req.url !== '/api/v1/auth/me' || !users[name]) { res.writeHead(401).end(); return; }
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(users[name]));
  });
  await new Promise((r) => my.listen(0, r));
  const app = createApp({ mycribUrl: `http://localhost:${my.address().port}`, publicOrigin: ORIGIN, dataDir: ':memory:', authTtlMs: 50 });
  await new Promise((r) => app.listen(0, r));
  const base = `http://localhost:${app.address().port}`;
  return { base, close: () => { app.close(); my.close(); } };
}

function client(base, who) {
  let csrf = '';
  const cookie = () => `s=${who}${csrf ? `; hi_csrf=${csrf}` : ''}`;
  return async (method, path, body, { origin = ORIGIN, token } = {}) => {
    if (!csrf && who && method !== 'GET') {
      const r = await fetch(`${base}${P}/csrf`, { headers: { cookie: `s=${who}` } });
      csrf = (await r.json()).token || '';
      // der Server setzt das Cookie; im Test uebernehmen wir den Token manuell
      csrf = /hi_csrf=(\w+)/.exec(r.headers.get('set-cookie') || '')?.[1] || csrf;
    }
    const r = await fetch(`${base}${P}${path}`, {
      method, body: body ? JSON.stringify(body) : undefined,
      headers: { cookie: cookie(), origin, 'content-type': 'application/json', 'x-hi-csrf': token ?? csrf },
    });
    return { status: r.status, body: await r.json().catch(() => null) };
  };
}

test('Sicherheitsmatrix und Spielablauf', async (t) => {
  const { base, close } = await boot();
  t.after(close);

  const anon = await fetch(`${base}${P}/state?today=${today}`);
  assert.equal(anon.status, 401);

  const cy = client(base, 'cy');
  assert.equal((await cy('GET', `/state?today=${today}`)).status, 403, 'none -> 403');

  const ben = client(base, 'ben');
  assert.equal((await ben('GET', `/state?today=${today}`)).status, 200);
  assert.equal((await ben('POST', '/habits', { name: 'x', today })).status, 403, 'read + write -> 403');

  const a = client(base, 'anna');
  assert.equal((await a('POST', '/habits', { name: 'Zaehne', today }, { origin: 'https://evil.test' })).status, 403, 'falsche Origin');
  assert.equal((await a('POST', '/habits', { name: 'Zaehne', today }, { token: 'wrong' })).status, 403, 'falsches CSRF');

  const made = await a('POST', '/habits', { name: '  Zaehne  putzen ', icon: 'tooth', today });
  assert.equal(made.status, 200);
  const id = made.body.id;

  const c1 = await a('POST', `/habits/${id}/check`, { date: today });
  assert.deepEqual([c1.body.seeds, c1.body.gained], [10, 10]);
  const again = await a('POST', `/habits/${id}/check`, { date: today });
  assert.equal(again.body.seeds, 10, 'doppeltes Abhaken zahlt nicht doppelt');

  assert.equal((await a('POST', '/shop/buy', { item: 'crystal' })).status, 402);
  assert.equal((await a('POST', '/shop/buy', { item: '__proto__' })).status, 400);
  const bought = await a('POST', '/shop/buy', { item: 'bush' });
  assert.equal(bought.body.seeds, 5);
  assert.equal((await a('POST', '/island/place', { id: bought.body.id, x: 99, y: 0 })).status, 400);
  assert.equal((await a('POST', '/island/place', { id: bought.body.id, x: 1, y: 1 })).status, 200);

  // fremdes Inventar ist nicht erreichbar
  assert.equal((await client(base, 'ben')('POST', '/island/pickup', { id: bought.body.id })).status, 403);

  const undo = await a('POST', `/habits/${id}/check`, { date: today, done: false });
  assert.equal(undo.body.seeds, 0, 'Guthaben wird nie negativ');

  const st = await a('GET', `/state?today=${today}`);
  assert.equal(st.body.habits[0].name, 'Zaehne putzen');
  const stats = await a('GET', `/stats?today=${today}`);
  assert.equal(stats.status, 200);
  assert.equal((await a('GET', '/stats?today=1999-01-01')).status, 400);

  await a('POST', `/habits/${id}/check`, { date: today });
  const lb = await ben('GET', `/leaderboard?today=${today}&period=week`);
  assert.equal(lb.body.entries.find((e) => e.name === 'Anna').seeds, 10);
  await a('PATCH', '/settings', { showLeaderboard: false });
  const lb2 = await ben('GET', `/leaderboard?today=${today}&period=all`);
  assert.equal(lb2.body.entries.some((e) => e.name === 'Anna'), false, 'Opt-out wird respektiert');
});

test('Auth-Cache: wenige /auth/me-Aufrufe', async (t) => {
  const { base, close } = await boot();
  t.after(close);
  mycribHits = 0;
  const a = client(base, 'anna');
  for (let i = 0; i < 5; i++) await a('GET', `/state?today=${today}`);
  assert.ok(mycribHits <= 2, `hits=${mycribHits}`);
});
