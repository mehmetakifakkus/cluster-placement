import { area, boundsOf, intersects } from './geometry';

// Genetic algorithm that packs blocks ({ w, h, ref }) into a compact layout.
//
// A layout is a list of blocks with positions. Blocks are kept sorted by area,
// largest first; the first sits at (0, 0) and every next one snaps to the
// top-right or bottom-left corner of a block placed before it, picked at random
// among the corners where it does not overlap anything. When no corner is free
// the block goes to the right of everything placed so far, so blocks never
// overlap.
//
// The pool starts with `poolSize` random layouts. Each generation keeps the
// better half and refills the pool with mutations of the best layout, which
// either re-place every block but the first, or keep the largest 30% and
// re-place the rest.

const ASPECT_TARGET = 1.8;

// 0 = only fill counts, 100 = only closeness to the 1.8 aspect ratio counts.
// 50 keeps boards compact (about 85% filled on the design example, 44% at 80).
export const DEFAULT_WEIGHT = 50;

export function evolveLayouts(items, options = {}) {
  const { weight = DEFAULT_WEIGHT, poolSize = 10, generations = 5, rng = Math.random } = options;

  const base = items
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => area(b) - area(a) || a.index - b.index)
    .map(({ index, ...block }) => ({ ...block, x: 0, y: 0 }));

  if (base.length <= 1) return [score(base, weight)];

  const keepCount = Math.max(1, Math.floor(base.length * 0.3));
  let pool = [];
  for (let i = 0; i < poolSize; i++) pool.push(score(mutate(base, 1, rng), weight));
  sortByFitness(pool);

  for (let g = 0; g < generations; g++) {
    const half = Math.floor(pool.length / 2);
    const best = pool[0];
    pool = pool.slice(0, half);
    for (let i = 0; i < half; i++) {
      const from = rng() > 0.5 ? 1 : keepCount;
      pool.push(score(mutate(best.blocks, from, rng), weight));
    }
    sortByFitness(pool);
  }

  return pool;
}

// Copies the blocks and re-places every block from index `from` on.
function mutate(blocks, from, rng) {
  const next = blocks.map((b) => ({ ...b }));
  next[0].x = 0;
  next[0].y = 0;
  for (let i = Math.max(1, from); i < next.length; i++) placeBlock(next, i, rng);
  return next;
}

function placeBlock(blocks, i, rng) {
  const placed = blocks.slice(0, i);
  const block = blocks[i];

  const corners = [];
  for (const p of placed) {
    corners.push({ x: p.x + p.w, y: p.y }); // top-right
    corners.push({ x: p.x, y: p.y + p.h }); // bottom-left
  }
  shuffle(corners, rng);

  for (const c of corners) {
    const candidate = { x: c.x, y: c.y, w: block.w, h: block.h };
    if (!placed.some((p) => intersects(p, candidate))) {
      block.x = c.x;
      block.y = c.y;
      return;
    }
  }

  const b = boundsOf(placed);
  block.x = b.x + b.w;
  block.y = b.y;
}

function score(blocks, weight) {
  const bounds = boundsOf(blocks);
  const used = blocks.reduce((sum, b) => sum + area(b), 0);
  const fill = bounds.w && bounds.h ? (100 * used) / area(bounds) : 100;
  const ratio = bounds.h ? bounds.w / bounds.h : 1;
  const ratioScore =
    ratio <= ASPECT_TARGET ? 100 - (ASPECT_TARGET - ratio) * 50 : 100 - (ratio - ASPECT_TARGET) * 10;
  const fitness = ((100 - weight) / 100) * fill + (weight / 100) * ratioScore;
  return { blocks, bounds, fitness };
}

function sortByFitness(pool) {
  pool.sort((a, b) => b.fitness - a.fitness);
}

function shuffle(list, rng) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}
