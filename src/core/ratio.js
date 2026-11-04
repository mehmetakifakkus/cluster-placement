// Reduces a resolution to a small aspect ratio (at most 10:10), so the GA works
// on a small grid: 1200×1600 -> 3:4, 1920×1080 -> 9:5 (closest small ratio).
// An unknown or invalid size counts as 1:1.

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
