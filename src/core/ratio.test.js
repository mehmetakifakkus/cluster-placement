import { describe, expect, test } from 'vitest';
import { MAX_BLOCK_CELLS, blockSize, simplifyRatio } from './ratio';

test.each([
  [1200, 1600, { w: 3, h: 4 }],
  [2400, 1600, { w: 3, h: 2 }],
  [120, 80, { w: 3, h: 2 }],
  [800, 400, { w: 2, h: 1 }],
  [1000, 1000, { w: 1, h: 1 }],
  [1920, 1080, { w: 9, h: 5 }], // 16:9 is too large, 9:5 is the closest small ratio
  [4000, 3000, { w: 4, h: 3 }],
  [1, 1000, { w: 1, h: 10 }], // extreme ratios clamp to the table's ends
  [null, null, { w: 1, h: 1 }], // unknown size
  [0, 100, { w: 1, h: 1 }],
])('%s × %s → %o', (width, height, expected) => {
  expect(simplifyRatio(width, height)).toEqual(expected);
});

test('non-integer sizes use the closest small ratio', () => {
  expect(simplifyRatio(1.5, 1)).toEqual({ w: 3, h: 2 });
});

describe('blockSize', () => {
  test.each([
    [1200, 1600, { w: 3, h: 4 }],
    [800, 400, { w: 2, h: 1 }],
    [4000, 3000, { w: 4, h: 3 }],
    [null, null, { w: 1, h: 1 }],
  ])('small ratios stay as they are: %s × %s → %o', (width, height, expected) => {
    expect(blockSize(width, height)).toEqual(expected);
  });

  test.each([
    [1920, 1080], // 9:5 would be 45 cells
    [1920, 600], // 10:3 would be 30 cells
    [1080, 1920], // 5:9 would be 45 cells
    [1000, 1], // extreme
  ])('large blocks shrink under the limit and keep roughly the same ratio: %s × %s', (width, height) => {
    const b = blockSize(width, height);
    expect(b.w * b.h).toBeLessThanOrEqual(MAX_BLOCK_CELLS);
    const ratio = simplifyRatio(width, height);
    const drift = Math.abs(Math.log(b.w / b.h) - Math.log(ratio.w / ratio.h));
    expect(drift).toBeLessThan(0.25);
  });

  test('a 1920 × 600 banner becomes 6 × 2', () => {
    expect(blockSize(1920, 600)).toEqual({ w: 6, h: 2 });
  });

  test('no block is larger than the limit, whatever the size', () => {
    for (let w = 100; w <= 4000; w += 137) {
      for (let h = 100; h <= 4000; h += 211) {
        const b = blockSize(w, h);
        expect(b.w * b.h).toBeLessThanOrEqual(MAX_BLOCK_CELLS);
      }
    }
  });
});
