import { expect, test } from 'vitest';
import { simplifyRatio } from './ratio';

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
