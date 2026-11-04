// Reduces a resolution to a small aspect ratio (at most 10:10), so the GA works
// on a small grid: 1200×1600 -> 3:4, 1920×1080 -> 9:5 (closest small ratio).
// An unknown or invalid size counts as 1:1.
//
// blockSize() is what the layout uses: the same small ratio, except that a
// block larger than MAX_BLOCK_CELLS is shrunk to the closest ratio that fits.
// Without the limit a 1920×1080 photo took 45 cells next to 12 for a
// 4000×3000 one, and such oversized blocks left gaps nothing could fill.

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const CANDIDATES = (() => {
  const list = [];
  for (let w = 1; w <= 10; w++) {
    for (let h = 1; h <= 10; h++) {
      if (gcd(w, h) === 1) list.push({ w, h, value: w / h });
    }
  }
  return list.sort((a, b) => a.value - b.value);
})();

export function simplifyRatio(width, height) {
  if (!(width > 0) || !(height > 0)) return { w: 1, h: 1 };

  if (Number.isInteger(width) && Number.isInteger(height)) {
    const g = gcd(width, height);
    const w = width / g;
    const h = height / g;
    if (w <= 10 && h <= 10) return { w, h };
  }

  const value = width / height;
  let best = CANDIDATES[0];
  for (const c of CANDIDATES) {
    if (Math.abs(value - c.value) < Math.abs(value - best.value)) best = c;
  }
  return { w: best.w, h: best.h };
}

export const MAX_BLOCK_CELLS = 20;

const FITTING = CANDIDATES.flatMap((c) => {
  const out = [];
  for (let k = 1; c.w * k * c.h * k <= MAX_BLOCK_CELLS; k++) out.push({ w: c.w * k, h: c.h * k });
  return out;
});

export function blockSize(width, height) {
  const small = simplifyRatio(width, height);
  if (small.w * small.h <= MAX_BLOCK_CELLS) return small;

  // Closest ratio among blocks that fit; on a tie the larger block wins.
  const target = Math.log(width / height);
  let best = null;
  for (const b of FITTING) {
    const drift = Math.abs(Math.log(b.w / b.h) - target);
    if (!best || drift < best.drift - 1e-9 || (Math.abs(drift - best.drift) <= 1e-9 && b.w * b.h > best.w * best.h)) {
      best = { ...b, drift };
    }
  }
  return { w: best.w, h: best.h };
}
