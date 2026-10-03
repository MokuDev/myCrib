// Isometrische Inselkunst als Inline-SVG. Ursprung = Mitte der Kachel, Grafik waechst nach oben (-y).
export const TW = 72;
export const TH = 36;

const trunk = (c = '#7a4e2d', h = 16, w = 6) => `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="1.5" fill="${c}"/>`;
const blob = (cx, cy, rx, ry, fill, hi) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/><ellipse cx="${cx - rx * 0.3}" cy="${cy - ry * 0.3}" rx="${rx * 0.5}" ry="${ry * 0.45}" fill="${hi}" opacity=".55"/>`;
const round = (dark, light, t) => trunk(t) + blob(0, -30, 19, 15, dark, light) + blob(-9, -22, 12, 10, dark, light) + blob(9, -23, 12, 10, dark, light) + blob(0, -38, 13, 10, dark, light);
const pine = (c1, c2) => trunk('#6b4528', 8, 5)
  + `<polygon points="-18,-8 18,-8 0,-28" fill="${c1}"/><polygon points="-14,-22 14,-22 0,-40" fill="${c2}"/><polygon points="-10,-34 10,-34 0,-52" fill="${c1}"/>`;

const shadow = '<ellipse cx="0" cy="2" rx="16" ry="7" fill="#000" opacity=".14"/>';

const ART = {
  oak: () => round('#3f8f3a', '#8fd36a', '#7a4e2d'),
  pine: () => pine('#1f6b3c', '#2a8a4c'),
  birch: () => trunk('#e8e4da', 24, 5) + '<rect x="-2" y="-18" width="4" height="2" fill="#555"/>' + blob(0, -34, 14, 12, '#8cc63f', '#d6f08a') + blob(-7, -28, 8, 7, '#8cc63f', '#d6f08a'),
  cherry: () => round('#e888b4', '#ffd2e6', '#6b4528'),
  maple: () => round('#e6872b', '#ffc470', '#6b4528'),
  palm: () => '<path d="M0,0 C-2,-14 3,-24 1,-36" stroke="#8a5a32" stroke-width="5" fill="none" stroke-linecap="round"/>'
    + '<path d="M1,-36 C-14,-44 -26,-34 -30,-28 M1,-36 C14,-44 26,-34 30,-28 M1,-36 C-8,-52 8,-52 1,-36 M1,-36 C-18,-36 -22,-24 -24,-18 M1,-36 C18,-36 22,-24 24,-18" stroke="#2f9e4a" stroke-width="6" fill="none" stroke-linecap="round"/>',
  bamboo: () => [-9, 0, 9].map((x, i) => `<rect x="${x - 2.5}" y="${-34 - i * 6}" width="5" height="${34 + i * 6}" rx="2" fill="#6fb04a"/><rect x="${x - 2.5}" y="${-14 - i * 3}" width="5" height="1.6" fill="#3f7a2c"/>`).join('')
    + '<path d="M-9,-40 l-9,-4 M0,-46 l9,-5 M9,-52 l8,-2" stroke="#4f9a3a" stroke-width="3" stroke-linecap="round"/>',
  bonsai: () => '<rect x="-9" y="-6" width="18" height="6" rx="2" fill="#a0522d"/>' + trunk('#6b4528', 10, 4).replace('y="-10"', 'y="-14"')
    + blob(-5, -22, 9, 6, '#2f7d3a', '#7fc467') + blob(6, -26, 8, 6, '#2f7d3a', '#7fc467') + blob(0, -32, 7, 5, '#2f7d3a', '#7fc467'),
  lilac: () => round('#8b5cf6', '#d4c1ff', '#4a3560'),
  crystal: () => trunk('#4a5d8a', 18) + blob(0, -32, 19, 15, '#3bb9f5', '#c8f1ff') + blob(-10, -24, 11, 9, '#2aa0e0', '#c8f1ff') + blob(10, -25, 11, 9, '#2aa0e0', '#c8f1ff')
    + '<circle cx="-6" cy="-40" r="1.6" fill="#fff"/><circle cx="8" cy="-34" r="1.4" fill="#fff"/>',
  bush: () => blob(0, -8, 14, 9, '#4aa04a', '#9be07a') + blob(-8, -5, 8, 6, '#3f8f3a', '#9be07a'),
  flowers: () => [[-8, -2, '#ff6b8b'], [2, -6, '#ffd24a'], [9, -1, '#b07cff'], [-1, 2, '#ff9a4a']].map(([x, y, c]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 7}" stroke="#3f8f3a" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="3.2" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.2" fill="#fff6"/>`).join(''),
  rock: () => '<polygon points="-14,0 -9,-12 2,-16 13,-8 15,0" fill="#9aa0a6"/><polygon points="-9,-12 2,-16 13,-8 2,-6" fill="#c3c8cd"/>',
  fence: () => [-14, -5, 4, 13].map((x) => `<rect x="${x}" y="-12" width="3.5" height="14" rx="1" fill="#c68b4e"/>`).join('') + '<rect x="-15" y="-9" width="32" height="2.5" fill="#a8703a"/><rect x="-15" y="-3" width="32" height="2.5" fill="#a8703a"/>',
  bench: () => '<rect x="-15" y="-12" width="30" height="4" rx="1" fill="#b98250"/><rect x="-15" y="-7" width="30" height="4" rx="1" fill="#a06b3e"/><rect x="-13" y="-4" width="3" height="6" fill="#6b4528"/><rect x="10" y="-4" width="3" height="6" fill="#6b4528"/>',
  lantern: () => '<rect x="-1.5" y="-26" width="3" height="26" fill="#5b5b66"/><rect x="-6" y="-36" width="12" height="11" rx="2" fill="#ffd24a"/><rect x="-7" y="-38" width="14" height="3" rx="1" fill="#44444f"/><circle cx="0" cy="-30" r="10" fill="#ffd24a" opacity=".25"/>',
  pond: () => `<polygon points="0,${-TH / 2 + 3} ${TW / 2 - 8},0 0,${TH / 2 - 3} ${-TW / 2 + 8},0" fill="#4fb3e8"/><polygon points="0,${-TH / 2 + 7} ${TW / 2 - 18},0 0,${TH / 2 - 7} ${-TW / 2 + 18},0" fill="#8fd6ff" opacity=".7"/>`,
  fountain: () => `<polygon points="0,${-TH / 2 + 4} ${TW / 2 - 10},0 0,${TH / 2 - 4} ${-TW / 2 + 10},0" fill="#b9c4cf"/><polygon points="0,${-TH / 2 + 8} ${TW / 2 - 20},0 0,${TH / 2 - 8} ${-TW / 2 + 20},0" fill="#6ac4f2"/>`
    + '<rect x="-2.5" y="-24" width="5" height="22" fill="#b9c4cf"/><path d="M0,-24 C-10,-30 -12,-16 -10,-6 M0,-24 C10,-30 12,-16 10,-6" stroke="#8fd6ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  bird: () => '<ellipse cx="0" cy="-8" rx="7" ry="5" fill="#4a90e2"/><circle cx="6" cy="-13" r="4" fill="#4a90e2"/><polygon points="9,-13 14,-12 9,-11" fill="#ffb347"/><circle cx="7" cy="-14" r="1" fill="#111"/><path d="M-6,-8 q-6,-6 -10,-2 q5,2 10,2" fill="#3a7bc8"/>',
  rabbit: () => '<ellipse cx="0" cy="-7" rx="9" ry="7" fill="#f2efe9"/><circle cx="8" cy="-12" r="5" fill="#f2efe9"/><rect x="6" y="-25" width="3" height="11" rx="1.5" fill="#f2efe9"/><rect x="10" y="-24" width="3" height="10" rx="1.5" fill="#e6e1d8"/><circle cx="10" cy="-13" r="1" fill="#222"/><circle cx="-9" cy="-8" r="3" fill="#fff"/>',
  duck: () => '<ellipse cx="0" cy="-7" rx="10" ry="7" fill="#ffd24a"/><circle cx="8" cy="-15" r="5" fill="#ffd24a"/><polygon points="12,-15 18,-13 12,-12" fill="#ff9a3c"/><circle cx="9" cy="-16" r="1" fill="#222"/>',
  fox: () => '<ellipse cx="0" cy="-9" rx="12" ry="7" fill="#e8742a"/><circle cx="11" cy="-14" r="6" fill="#e8742a"/><polygon points="7,-19 9,-27 13,-19" fill="#e8742a"/><polygon points="12,-19 16,-26 17,-17" fill="#e8742a"/><path d="M-12,-9 q-14,-6 -12,6 q6,-2 12,-2" fill="#f2f2f2" stroke="#e8742a" stroke-width="2"/><circle cx="14" cy="-14" r="1.2" fill="#222"/><rect x="-6" y="-4" width="3" height="6" fill="#3a2a1a"/><rect x="5" y="-4" width="3" height="6" fill="#3a2a1a"/>',
  deer: () => '<ellipse cx="0" cy="-16" rx="13" ry="8" fill="#b97a44"/><rect x="-9" y="-12" width="3" height="14" fill="#9a6232"/><rect x="6" y="-12" width="3" height="14" fill="#9a6232"/><rect x="9" y="-30" width="5" height="16" rx="2" fill="#b97a44"/><circle cx="13" cy="-31" r="5" fill="#b97a44"/><path d="M11,-35 l-3,-8 M15,-35 l3,-8 M8,-41 l-3,-1 M18,-43 l3,-1" stroke="#6b4528" stroke-width="1.8" fill="none"/><circle cx="14" cy="-31" r="1" fill="#222"/>',
};

const FLAT = new Set(['pond', 'fountain']);

export function itemArt(id) {
  const draw = ART[id];
  if (!draw) return '<circle r="6" fill="currentColor" opacity=".4"/>';
  return (FLAT.has(id) ? '' : shadow) + draw();
}

export function iconSvg(id, size = 56) {
  return `<svg viewBox="-34 -58 68 64" width="${size}" height="${size}" aria-hidden="true">${itemArt(id)}</svg>`;
}
