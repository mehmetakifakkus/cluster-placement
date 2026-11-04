import { expect, test } from 'vitest';
import { area, boundsOf, intersects } from './geometry';

const r = (x, y, w, h) => ({ x, y, w, h });

test('overlapping rectangles intersect', () => {
  expect(intersects(r(0, 0, 2, 2), r(1, 1, 2, 2))).toBe(true);
  expect(intersects(r(0, 0, 4, 4), r(1, 1, 1, 1))).toBe(true);
});

test('rectangles that only touch do not intersect', () => {
  expect(intersects(r(0, 0, 2, 2), r(2, 0, 2, 2))).toBe(false);
  expect(intersects(r(0, 0, 2, 2), r(0, 2, 2, 2))).toBe(false);
  expect(intersects(r(0, 0, 1, 1), r(5, 5, 1, 1))).toBe(false);
});

test('boundsOf returns the smallest enclosing rectangle', () => {
  expect(boundsOf([r(1, 2, 3, 4), r(5, 0, 1, 1)])).toEqual(r(1, 0, 5, 6));
  expect(boundsOf([])).toEqual(r(0, 0, 0, 0));
});

test('area', () => {
  expect(area(r(0, 0, 3, 4))).toBe(12);
});
