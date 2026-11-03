/**
 * @jest-environment node
 */
import { placeCluster } from './placement';
import { fileGA } from '../main';
import { FileCluster } from './FileCluster';
import { parseFileList } from './parseFileList';
import { GABuilder } from '../ga/GABuilder';
import { Point } from '../geometry/Point';

// The GA needs paper's geometry (Rectangle.unite, intersects) but no canvas.
jest.mock('paper', () => jest.requireActual('paper/dist/paper-core.js'));

// Mixes files and sub clusters on the same level (root, 5653–5663, 5660).
const NAMES = [
  'idea.docx', '5653.jpeg', '5654.jpeg', '5660.jpeg', '5661.jpeg',
  '5660_e1.psd', '5660_e2.psd', 'model1.3dm', 'model2.3dm',
  'modelmanu1.3dm', 'modelmanu2.3dm', 'renderdesign4.png, 1200, 1200',
  'sketchv1.jpeg, 800, 400', 'sketchv2.jpeg, 240, 120',
];

function buildGA() {
  const ga = fileGA(new FileCluster(parseFileList(NAMES)).arranged, 'root');
  for (let i = 0; i < 3; i++) ga.evolve();
  return ga;
}

const corner = (ga) =>
  ga.best().chromosome.reduce((m, b) => Point.min(m, b.point), ga.best().chromosome[0].point);

describe('placeCluster', () => {
  test('returns every file exactly once, including files next to bigger sub clusters', () => {
    const files = placeCluster(buildGA(), new Point(0, 0));
    const names = files.map((f) => f.block.content.name).sort();
    expect(names).toEqual(NAMES.map((n) => n.split(',')[0]).sort());
  });

  test('puts each cluster with its top-left corner on the position its parent gave it', () => {
    const ga = buildGA();
    placeCluster(ga, new Point(2, 3));

    expect(corner(ga)).toEqual(new Point(2, 3));
    const check = (cluster) => {
      cluster.best().chromosome.forEach((block) => {
        if (block.content instanceof GABuilder) {
          expect(corner(block.content)).toEqual(block.point);
          check(block.content);
        }
      });
    };
    check(ga);
  });

  test('is idempotent, so selecting tree nodes repeatedly does not drift', () => {
    const ga = buildGA();
    const first = placeCluster(ga, new Point(0, 0)).map((f) => [f.block.content.name, f.block.point.x, f.block.point.y]);
    const second = placeCluster(ga, new Point(0, 0)).map((f) => [f.block.content.name, f.block.point.x, f.block.point.y]);
    expect(second).toEqual(first);
  });

  test('gives files of the same cluster the same cluster index', () => {
    const files = placeCluster(buildGA(), new Point(0, 0));
    const indexOf = (name) => files.find((f) => f.block.content.name === name).cluster;
    expect(indexOf('model1.3dm')).toBe(indexOf('model2.3dm'));
    expect(indexOf('model1.3dm')).not.toBe(indexOf('modelmanu1.3dm'));
  });
});
