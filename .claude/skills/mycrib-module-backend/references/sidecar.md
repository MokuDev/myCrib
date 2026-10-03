# Sidecar reference (Node, no framework assumptions)

## Request guard (sketch)
```js
const cache = new Map(); // cookie -> { at, me }
const TTL = 5000;

async function whoami(req) {
  const cookie = req.headers.cookie || '';
  const hit = cache.get(cookie);
  if (hit && Date.now() - hit.at < TTL) return hit.me;
  const res = await fetch(`${process.env.MYCRIB_URL}/api/v1/auth/me`, { headers: { cookie } });
  if (!res.ok) return null;
  const me = await res.json();
  cache.set(cookie, { at: Date.now(), me });
  return me;
}

async function guard(req, res, { write }) {
  const me = await whoami(req);
  if (!me) return res.writeHead(401).end();
  const level = me.permissions?.modules?.['ext:MODULE_ID'];
  if (level === 'none' || (write && level === 'read')) return res.writeHead(403).end();
  if (write) {
    if (req.headers.origin !== process.env.PUBLIC_ORIGIN) return res.writeHead(403).end();
    // double-submit: cookie "ext_csrf" must equal header "x-ext-csrf"
  }
  return me;
}
```
Prune the cache periodically and cap its size. Do not log cookies or tokens.

## Reverse proxy (Traefik label idea)
Route `PathPrefix(/api/extensions/MODULE_ID)` to the sidecar, everything else to myCrib. Same host, so the session cookie is sent.

## Test matrix
anonymous -> 401; permission `none` -> 403; `read` + POST -> 403; wrong Origin -> 403; missing/mismatched CSRF -> 403; valid write -> 2xx; `/auth/me` outage -> fail closed.
