// Server-seitige Wahrheit ueber Preise. Die Optik liegt im Browser (js/art.js).
export const BASE_REWARD = 10;
export const START_SIZE = 6;
export const MAX_SIZE = 14;
export const MAX_HABITS = 20;

export const CATALOG = Object.freeze({
  oak:      { kind: 'tree', cost: 20 },
  pine:     { kind: 'tree', cost: 15 },
  birch:    { kind: 'tree', cost: 20 },
  cherry:   { kind: 'tree', cost: 40 },
  maple:    { kind: 'tree', cost: 40 },
  palm:     { kind: 'tree', cost: 30 },
  bamboo:   { kind: 'tree', cost: 35 },
  bonsai:   { kind: 'tree', cost: 90 },
  lilac:    { kind: 'tree', cost: 120 },
  crystal:  { kind: 'tree', cost: 150 },
  bush:     { kind: 'deco', cost: 5 },
  flowers:  { kind: 'deco', cost: 8 },
  rock:     { kind: 'deco', cost: 10 },
  fence:    { kind: 'deco', cost: 12 },
  bench:    { kind: 'deco', cost: 25 },
  lantern:  { kind: 'deco', cost: 30 },
  pond:     { kind: 'deco', cost: 60 },
  fountain: { kind: 'deco', cost: 120 },
  bird:     { kind: 'animal', cost: 40 },
  rabbit:   { kind: 'animal', cost: 50 },
  duck:     { kind: 'animal', cost: 60 },
  fox:      { kind: 'animal', cost: 100 },
  deer:     { kind: 'animal', cost: 150 },
});

export function expandCost(size) {
  return size >= MAX_SIZE ? null : 150 * (size - START_SIZE + 1);
}
