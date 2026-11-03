/**
 * @jest-environment node
 */
import { buildTreeData } from './treeData';
import { GABuilder } from '../ga/GABuilder';
import { File } from '../File';

// The GA needs paper's geometry (Rectangle.unite, intersects) but no canvas.
jest.mock('paper', () => jest.requireActual('paper/dist/paper-core.js'));

const file = (name) => new File(name, 1, 1);

function titles(node) {
  return { title: node.title, children: node.children && node.children.map(titles) };
}

describe('buildTreeData', () => {
  test('a level with both files and sub clusters lists only the sub clusters, without nulls', () => {
    const inner = new GABuilder(4, [file('a1'), file('a2')]);
    inner.title = 'a';
    const root = new GABuilder(4, [file('b'), inner, file('c')]);
    root.title = 'root';

    const tree = buildTreeData(root);

    expect(tree.children).not.toContain(null);
    expect(titles(tree)).toEqual({ title: 'root', children: [{ title: 'a', children: null }] });
    expect(tree.data).toBe(root);
    expect(tree.key).toBe(root.id);
  });

  test('a cluster made only of files has no children', () => {
    const ga = new GABuilder(4, [file('x1'), file('x2')]);
    ga.title = 'x';
    expect(buildTreeData(ga).children).toBeNull();
  });
});
