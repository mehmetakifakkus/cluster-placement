import { describe, expect, test } from 'vitest';
import { runLayout } from './layout';
import { parseFileList } from './parse';
import { intersects } from './geometry';
import { seededRandom } from './random';

const DESIGN = parseFileList(`design1.ai, 1200, 1600
design2.ai, 2400, 1600
design3.ai, 120, 80
renderdesign1.png, 800, 800
renderdesign2.png, 400, 400
renderdesign3.png, 1000, 1000
renderdesign4.png, 1200, 1200
sketchv1.jpeg, 800, 400
sketchv2.jpeg, 240, 120
sketchv3.jpeg, 360, 180`);

// Mixes files and sub clusters on the same level (root, 5653–5663, 5660).
const MIXED = parseFileList(`idea.docx
5653.jpeg
5654.jpeg
5660.jpeg
5661.jpeg
5660_e1.psd
5660_e2.psd
model1.3dm
model2.3dm
modelmanu1.3dm
modelmanu2.3dm
renderdesign4.png, 1200, 1200
sketchv1.jpeg, 800, 400
sketchv2.jpeg, 240, 120`);

const withIds = (files) => files.map((f, i) => ({ ...f, id: i }));
const layout = (files, seed = 1, options = {}) =>
  runLayout(withIds(files), { rng: seededRandom(seed), ...options });

function clusterTitles(node) {
  return { title: node.title, children: node.children.map(clusterTitles) };
}

describe('runLayout', () => {
  test('returns null for an empty list', () => {
    expect(runLayout([])).toBeNull();
  });

  test('a single file is placed alone at the origin', () => {
    const result = layout([{ name: 'a.png', width: 800, height: 400 }]);
    expect(result.alternatives).toHaveLength(1);
    expect(result.alternatives[0].placements).toEqual([
      expect.objectContaining({ x: 0, y: 0, w: 2, h: 1 }),
    ]);
  });

  test('builds the name cluster tree', () => {
    expect(clusterTitles(layout(DESIGN).tree)).toEqual({
      title: 'Tümü',
      children: [
        { title: 'design', children: [] },
        { title: 'renderdesign', children: [] },
        { title: 'sketchv', children: [] },
      ],
    });
  });

  test.each([1, 2, 3, 4, 5, 6, 7, 8])('seed %i: every file is placed once and no blocks overlap', (seed) => {
    for (const files of [DESIGN, MIXED]) {
      const result = layout(files, seed);
      for (const alt of result.alternatives) {
        const ids = alt.placements.map((p) => p.file.id).sort((a, b) => a - b);
        expect(ids).toEqual(files.map((_, i) => i));
        for (let i = 0; i < alt.placements.length; i++) {
          for (let j = i + 1; j < alt.placements.length; j++) {
            expect(intersects(alt.placements[i], alt.placements[j])).toBe(false);
          }
        }
      }
    }
  });

  test('blocks keep the simplified aspect ratio of their file', () => {
    const { placements } = layout(DESIGN).alternatives[0];
    const size = (name) => {
      const p = placements.find((pl) => pl.file.name === name);
      return [p.w, p.h];
    };
    expect(size('design1.ai')).toEqual([3, 4]);
    expect(size('sketchv1.jpeg')).toEqual([2, 1]);
    expect(size('renderdesign2.png')).toEqual([1, 1]);
  });

  test('files of a cluster stay together inside the cluster bounding box', () => {
    const result = layout(MIXED, 3);
    const { placements } = result.alternatives[0];
    const byCluster = new Map();
    for (const p of placements) {
      if (!byCluster.has(p.cluster)) byCluster.set(p.cluster, []);
      byCluster.get(p.cluster).push(p);
    }
    // No file of another cluster lies inside a leaf cluster's own bounding box.
    for (const [cluster, own] of byCluster) {
      if (cluster.children.length > 0) continue;
      const minX = Math.min(...own.map((p) => p.x));
      const minY = Math.min(...own.map((p) => p.y));
      const maxX = Math.max(...own.map((p) => p.x + p.w));
      const maxY = Math.max(...own.map((p) => p.y + p.h));
      const box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      for (const other of placements) {
        if (other.cluster !== cluster) expect(intersects(box, other)).toBe(false);
      }
    }
  });

  test('the layout starts at the origin and reports its size and metrics', () => {
    const alt = layout(DESIGN).alternatives[0];
    expect(Math.min(...alt.placements.map((p) => p.x))).toBe(0);
    expect(Math.min(...alt.placements.map((p) => p.y))).toBe(0);
    expect(alt.width).toBe(Math.max(...alt.placements.map((p) => p.x + p.w)));
    expect(alt.height).toBe(Math.max(...alt.placements.map((p) => p.y + p.h)));
    expect(alt.metrics.fill).toBeGreaterThan(0);
    expect(alt.metrics.fill).toBeLessThanOrEqual(100);
    expect(alt.metrics.ratio).toBeCloseTo(alt.width / alt.height);
  });

  test('alternatives are distinct and sorted by fitness', () => {
    const { alternatives } = layout(DESIGN, 5);
    expect(alternatives.length).toBeGreaterThan(1);
    expect(alternatives.length).toBeLessThanOrEqual(3);
    const keys = alternatives.map((a) => a.placements.map((p) => `${p.file.id}:${p.x},${p.y}`).sort().join(';'));
    expect(new Set(keys).size).toBe(keys.length);
    for (let i = 1; i < alternatives.length; i++) {
      expect(alternatives[i - 1].metrics.fitness).toBeGreaterThanOrEqual(alternatives[i].metrics.fitness);
    }
  });

  test('the same seed gives the same layout', () => {
    const a = layout(MIXED, 42).alternatives[0].placements.map((p) => [p.file.id, p.x, p.y]);
    const b = layout(MIXED, 42).alternatives[0].placements.map((p) => [p.file.id, p.x, p.y]);
    expect(a).toEqual(b);
  });

  test('leaf clusters get a color; clusters of only sub clusters do not', () => {
    const { tree } = layout(MIXED);
    const walk = (node) => {
      expect(Boolean(node.color)).toBe(node.files.length > 0);
      node.children.forEach(walk);
    };
    walk(tree);
    expect(tree.count).toBe(MIXED.length);
  });
});
