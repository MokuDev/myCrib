// Client fuer den habit-island-Sidecar (gleicher Ursprung, /api/extensions/habit-island).
const BASE = '/api/extensions/habit-island';
let csrf = '';

export class SidecarError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export function localDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function ensureCsrf(signal, force = false) {
  if (csrf && !force) return csrf;
  const res = await fetch(`${BASE}/csrf`, { credentials: 'same-origin', cache: 'no-store', signal });
  if (!res.ok) throw new SidecarError('csrf', res.status);
  csrf = (await res.json()).token || '';
  return csrf;
}

export async function call(method, path, { body, query, signal } = {}, retried = false) {
  const write = method !== 'GET';
  const qs = query ? `?${new URLSearchParams(query)}` : '';
  const headers = { 'Content-Type': 'application/json' };
  if (write) headers['X-HI-CSRF'] = await ensureCsrf(signal);
  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method, credentials: 'same-origin', cache: 'no-store', signal, headers,
      body: write ? JSON.stringify(body ?? {}) : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new SidecarError('offline', 0);
  }
  if (res.status === 403 && write && !retried) {
    await ensureCsrf(signal, true);
    return call(method, path, { body, query, signal }, true);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new SidecarError(data?.error || `HTTP ${res.status}`, res.status);
  return data;
}

export const get = (path, query, signal) => call('GET', path, { query, signal });
export const post = (path, body, signal) => call('POST', path, { body, signal });
export const patch = (path, body, signal) => call('PATCH', path, { body, signal });
export const del = (path, query, signal) => call('DELETE', path, { query, signal });
