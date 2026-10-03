import { t } from '/i18n.js';
import { esc } from '/utils/html.js';
import { get, post } from './api.js';
import { itemArt, iconSvg, TW, TH } from './art.js';
import { icon, refreshIcons, nf } from './ui.js';

const L = (k, p) => t(`extensions.habit-island.${k}`, p);
const KINDS = ['tree', 'deco', 'animal'];

export async function renderIsland(root, ctx) {
  const { signal } = ctx;
  let shop;
  let selected = null; // { kind: 'inv'|'placed', id }
  let panel = 'inventory';

  async function load() {
    try { shop = await get('/shop', undefined, signal); }
    catch (err) { if (err?.name === 'AbortError' || signal.aborted) return false; ctx.fail(err); return false; }
    ctx.state.seeds = shop.seeds;
    ctx.updateSeeds();
    return !signal.aborted;
  }

  const proj = (x, y) => ({ sx: (x - y) * TW / 2, sy: (x + y) * TH / 2 });

  function scene() {
    const n = shop.size;
    const occupied = new Map(shop.inventory.filter((i) => i.x !== null).map((i) => [`${i.x},${i.y}`, i]));
    const pad = 70;
    const minX = -(n * TW) / 2 - 10; const w = n * TW + 20;
    const h = n * TH + pad + 40;
    let tiles = ''; let sides = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const { sx, sy } = proj(x, y);
      const pts = `${sx},${sy - TH / 2} ${sx + TW / 2},${sy} ${sx},${sy + TH / 2} ${sx - TW / 2},${sy}`;
      const sel = selected?.kind === 'inv' && !occupied.has(`${x},${y}`);
      tiles += `<polygon class="hi-tile-poly${(x + y) % 2 ? ' alt' : ''}${sel ? ' can-drop' : ''}" data-x="${x}" data-y="${y}" points="${pts}"/>`;
    }
    for (let i = 0; i < n; i++) { // Erdkante vorne links (y = n-1) und vorne rechts (x = n-1)
      const l = proj(i, n - 1); const r = proj(n - 1, i);
      sides += `<polygon class="hi-edge hi-edge--l" points="${l.sx - TW / 2},${l.sy} ${l.sx},${l.sy + TH / 2} ${l.sx},${l.sy + TH / 2 + 14} ${l.sx - TW / 2},${l.sy + 14}"/>`;
      sides += `<polygon class="hi-edge hi-edge--r" points="${r.sx},${r.sy + TH / 2} ${r.sx + TW / 2},${r.sy} ${r.sx + TW / 2},${r.sy + 14} ${r.sx},${r.sy + TH / 2 + 14}"/>`;
    }
    const placed = [...occupied.values()].sort((a, b) => (a.x + a.y) - (b.x + b.y)).map((it) => {
      const { sx, sy } = proj(it.x, it.y);
      const on = selected?.kind === 'placed' && selected.id === it.id;
      return `<g class="hi-item${on ? ' is-selected' : ''}" data-inv="${it.id}" transform="translate(${sx},${sy})" tabindex="0" role="button" aria-label="${esc(L(`items.${it.item}`))} (${it.x + 1}, ${it.y + 1})">${on ? `<polygon class="hi-ring-sel" points="0,${-TH / 2} ${TW / 2},0 0,${TH / 2} ${-TW / 2},0"/>` : ''}${itemArt(it.item)}</g>`;
    }).join('');
    return `<svg class="hi-scene" viewBox="${minX} ${-60} ${w} ${h}" role="group" aria-label="${esc(L('island.title'))}">${sides}${tiles}${placed}</svg>`;
  }

  function paint() {
    const own = shop.inventory.filter((i) => i.x === null);
    const grouped = new Map();
    for (const i of own) grouped.set(i.item, [...(grouped.get(i.item) || []), i]);
    const placedSel = selected?.kind === 'placed' ? shop.inventory.find((i) => i.id === selected.id) : null;
    const hint = selected?.kind === 'inv' ? L('island.hintPlace') : placedSel ? L('island.hintSelected', { name: L(`items.${placedSel.item}`) }) : L('island.hintIdle');
    const canWrite = ctx.state.canWrite;
    const price = (c) => `<small>${nf(c)} ${esc(L('seeds'))}</small>`;
    const shopHtml = KINDS.map((k) => `<h4 class="hi-h4">${esc(L(`kinds.${k}`))}</h4><div class="hi-shop">${shop.catalog.filter((c) => c.kind === k).map((c) =>
      `<button type="button" class="hi-shopitem" data-buy="${c.id}" ${!canWrite || shop.seeds < c.cost ? 'disabled' : ''} aria-label="${esc(L('island.buy', { name: L(`items.${c.id}`), cost: c.cost }))}">${iconSvg(c.id)}<span>${esc(L(`items.${c.id}`))}</span>${price(c.cost)}</button>`).join('')}</div>`).join('');
    const invHtml = own.length
      ? `<div class="hi-shop">${[...grouped].map(([item, list]) => `<button type="button" class="hi-shopitem${selected?.kind === 'inv' && list.some((i) => i.id === selected.id) ? ' is-on' : ''}" data-pick="${list[0].id}" ${canWrite ? '' : 'disabled'}>${iconSvg(item)}<span>${esc(L(`items.${item}`))}</span><small>×${list.length}</small></button>`).join('')}</div>`
      : `<p class="hi-muted">${esc(L('island.inventoryEmpty'))}</p>`;
    root.replaceChildren();
    root.insertAdjacentHTML('beforeend', `
      <section class="hi-card hi-island">
        <div class="hi-island__bar">
          <span class="hi-muted">${esc(L('island.size', { n: shop.size, max: shop.maxSize }))}</span>
          ${shop.expandCost !== null ? `<button type="button" class="hi-btn" data-expand ${!canWrite || shop.seeds < shop.expandCost ? 'disabled' : ''}>${icon('maximize-2')}${esc(L('island.expand', { cost: shop.expandCost }))}</button>` : `<span class="hi-muted">${esc(L('island.maxed'))}</span>`}
        </div>
        <div class="hi-scene-wrap">${scene()}</div>
        <p class="hi-hint" role="status">${esc(hint)}</p>
        ${placedSel && canWrite ? `<button type="button" class="hi-btn" data-pickup>${icon('hand')}${esc(L('island.pickup'))}</button>` : ''}
      </section>
      <div class="hi-seg" role="tablist" aria-label="${esc(L('island.panels'))}">
        <button type="button" class="hi-seg__btn" role="tab" data-panel="inventory" aria-selected="${panel === 'inventory'}">${esc(L('island.inventory'))} (${own.length})</button>
        <button type="button" class="hi-seg__btn" role="tab" data-panel="shop" aria-selected="${panel === 'shop'}">${esc(L('island.shop'))}</button>
      </div>
      <section class="hi-card">${panel === 'shop' ? shopHtml : invHtml}</section>`);
    refreshIcons(root);
  }

  async function act(fn) {
    try { await fn(); } catch (err) {
      if (err?.name === 'AbortError' || signal.aborted) return;
      if (err.status === 402) ctx.toast(L('island.noSeeds')); else if (err.status === 409) ctx.toast(L('island.occupied')); else { ctx.fail(err); return; }
    }
    if (signal.aborted) return;
    if (await load()) paint();
  }

  root.addEventListener('click', (ev) => {
    const el = ev.target;
    const buy = el.closest('[data-buy]'); const pick = el.closest('[data-pick]');
    const panelBtn = el.closest('[data-panel]'); const item = el.closest('[data-inv]');
    const tile = el.closest('[data-x]');
    if (panelBtn) { panel = panelBtn.dataset.panel; paint(); return; }
    if (buy) { act(async () => { await post('/shop/buy', { item: buy.dataset.buy }, signal); ctx.toast(L('island.bought', { name: L(`items.${buy.dataset.buy}`) })); }); return; }
    if (pick) { selected = { kind: 'inv', id: Number(pick.dataset.pick) }; paint(); return; }
    if (el.closest('[data-expand]')) { act(async () => { await post('/island/expand', {}, signal); ctx.toast(L('island.expanded')); }); return; }
    if (el.closest('[data-pickup]')) { const id = selected.id; selected = null; act(() => post('/island/pickup', { id }, signal)); return; }
    if (item) { selected = { kind: 'placed', id: Number(item.dataset.inv) }; paint(); return; }
    if (tile && selected?.kind === 'inv') {
      const id = selected.id; selected = null;
      act(() => post('/island/place', { id, x: Number(tile.dataset.x), y: Number(tile.dataset.y) }, signal));
    } else if (tile) { selected = null; paint(); }
  }, { signal });

  root.addEventListener('keydown', (ev) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches?.('[data-inv]')) {
      ev.preventDefault();
      selected = { kind: 'placed', id: Number(ev.target.dataset.inv) };
      paint();
      root.querySelector(`[data-inv="${selected.id}"]`)?.focus();
    }
  }, { signal });

  if (await load()) paint();
}
