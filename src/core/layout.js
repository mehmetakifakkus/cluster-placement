import { FileCluster } from './cluster';
import { evolveLayouts } from './ga';
import { simplifyRatio } from './ratio';
import { area, boundsOf } from './geometry';

// Cluster colors: light fill, strong stroke, dark text (4.5:1 on the fill).
export const PALETTE = [
  { fill: '#DCE6FD', stroke: '#2F5BEA', ink: '#1A3A9C' },
  { fill: '#FDE6D3', stroke: '#C8641D', ink: '#6E340B' },
  { fill: '#D5F0EC', stroke: '#1F8577', ink: '#0F4F46' },
  { fill: '#EBE2F8', stroke: '#7A52C7', ink: '#46297F' },
  { fill: '#FBE0EA', stroke: '#C2416F', ink: '#7A1D40' },
  { fill: '#E9EFD3', stroke: '#6F8A1F', ink: '#3D4D0E' },
  { fill: '#E4E6EA', stroke: '#5C6068', ink: '#2B2E33' },
  { fill: '#FFF0C2', stroke: '#A77B00', ink: '#5C4300' },
];

// Lays out `files` ({ id, name, width, height }) in name clusters.
//
// Returns null for an empty list, else:
//   tree:          { id, title, count, color, files, children }, the cluster tree
//   alternatives:  up to `alternativeCount` layouts of the root, best first, each
//                  { placements, width, height, metrics }
// A placement is { file, cluster, x, y, w, h } in grid units, with the layout's
// top-left corner at (0, 0). Sub clusters always use their best layout.
export function runLayout(files, options = {}) {
  if (!files || files.length === 0) return null;
  const { alternativeCount = 3, ...gaOptions } = options;

  let nextId = 0;
  let nextColor = 0;

  function build(map, title) {
    const children = [];
    const ownFiles = [];
    const items = [];

    for (const [key, value] of map) {
      if (value instanceof Map) {
        const child = build(value, key);
        children.push(child);
        items.push({ w: child.width, h: child.height, ref: child });
      } else {
        const r = simplifyRatio(value.width, value.height);
        ownFiles.push(value);
        items.push({ w: r.w, h: r.h, ref: value });
      }
    }

    const node = {
      id: `c${nextId++}`,
      title,
      children,
      files: ownFiles,
      count: ownFiles.length + children.reduce((sum, c) => sum + c.count, 0),
      color: ownFiles.length > 0 ? PALETTE[nextColor++ % PALETTE.length] : null,
    };
    node.pool = evolveLayouts(items, gaOptions);
    node.width = node.pool[0].bounds.w;
    node.height = node.pool[0].bounds.h;
    return node;
  }

  let root = build(new FileCluster(files).arranged.get('root'), 'Tümü');
  // All files share one prefix: that cluster is the root.
  if (root.files.length === 0 && root.children.length === 1) root = root.children[0];

  const fileArea = files.reduce((sum, f) => {
    const r = simplifyRatio(f.width, f.height);
    return sum + r.w * r.h;
  }, 0);

  const alternatives = distinct(root.pool)
    .slice(0, alternativeCount)
    .map((layout) => {
      const placements = [];
      place(root, layout, 0, 0, placements);
      const b = boundsOf(placements);
      return {
        placements,
        width: b.w,
        height: b.h,
        metrics: {
          fitness: layout.fitness,
          fill: (100 * fileArea) / area(b),
          ratio: b.w / b.h,
        },
      };
    });

  return { tree: root, alternatives };
}

// Shifts a cluster's layout so its top-left corner is at (ox, oy) and recurses
// into sub clusters at the position their block got.
function place(node, layout, ox, oy, out) {
  const b = layout.bounds;
  for (const block of layout.blocks) {
    const x = ox + block.x - b.x;
    const y = oy + block.y - b.y;
    if (block.ref && block.ref.pool) place(block.ref, block.ref.pool[0], x, y, out);
    else out.push({ file: block.ref, cluster: node, x, y, w: block.w, h: block.h });
  }
}

// Layouts that put every block in the same spot count once.
function distinct(pool) {
  const seen = new Set();
  return pool.filter((layout) => {
    const key = layout.blocks.map((b) => `${b.x},${b.y}`).join(';');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
