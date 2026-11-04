import { describe, expect, test } from 'vitest';
import { FileCluster, tokenize } from './cluster';

// Turns the arranged Map into a plain object that is easy to compare:
// { files: [names of leaf files], clusters: { key: <same shape> } }
function toTree(map) {
  const node = { files: [], clusters: {} };
  for (const [key, value] of map) {
    if (value instanceof Map) node.clusters[key] = toTree(value);
    else node.files.push(value.name);
  }
  return node;
}

function cluster(names) {
  const fc = new FileCluster(names.map((n) => ({ name: n })));
  return toTree(fc.arranged.get('root'));
}

function allFileNames(map) {
  const names = [];
  for (const value of map.values()) {
    if (value instanceof Map) names.push(...allFileNames(value));
    else names.push(value.name);
  }
  return names;
}

const leaves = (...files) => ({ files, clusters: {} });

describe('tokenize', () => {
  test('keeps digit runs together and splits everything else per character', () => {
    expect(tokenize('img10.png')).toEqual(['i', 'm', 'g', '10', '.', 'p', 'n', 'g']);
    expect(tokenize('5660_e1')).toEqual(['5660', '_', 'e', '1']);
  });
});

describe('FileCluster', () => {
  test('groups the default design list by name prefix', () => {
    expect(
      cluster([
        'design1.ai', 'design2.ai', 'design3.ai',
        'renderdesign1.png', 'renderdesign2.png', 'renderdesign3.png', 'renderdesign4.png',
        'sketchv1.jpeg', 'sketchv2.jpeg', 'sketchv3.jpeg',
      ])
    ).toEqual({
      files: [],
      clusters: {
        design: leaves('design1.ai', 'design2.ai', 'design3.ai'),
        renderdesign: leaves('renderdesign1.png', 'renderdesign2.png', 'renderdesign3.png', 'renderdesign4.png'),
        sketchv: leaves('sketchv1.jpeg', 'sketchv2.jpeg', 'sketchv3.jpeg'),
      },
    });
  });

  // Bug 1: names whose remaining suffix was 0 or 1 characters were dropped.
  describe('never loses a file', () => {
    test.each([
      [['file1', 'file2', 'file3']],
      [['a.png', 'a.png.bak']],
      [['ab', 'ac', 'abc']],
      [['x.png', 'x.png']],
      [['idea.docx', '5653.jpeg', '5660.jpeg', '5660_e1.psd', 'model1.3dm', 'modelmanu1.3dm']],
    ])('%j', (names) => {
      const fc = new FileCluster(names.map((n) => ({ name: n })));
      expect(allFileNames(fc.arranged).sort()).toEqual([...names].sort());
    });

    test('names differing only in the last character form one cluster', () => {
      expect(cluster(['file1', 'file2', 'file3'])).toEqual({
        files: [],
        clusters: { file: leaves('file1', 'file2', 'file3') },
      });
    });

    test('a name that is a prefix of another stays next to it', () => {
      expect(cluster(['a.png', 'a.png.bak'])).toEqual({
        files: [],
        clusters: { 'a.png': leaves('a.png', 'a.png.bak') },
      });
    });
  });

  // Bug 2: numbers were split digit by digit.
  describe('treats numbers as whole tokens', () => {
    test('img10 and img11 are siblings of img1, not its children', () => {
      expect(cluster(['img1.png', 'img2.png', 'img10.png', 'img11.png'])).toEqual({
        files: [],
        clusters: { img: leaves('img1.png', 'img2.png', 'img10.png', 'img11.png') },
      });
    });

    test('a numbered photo series stays together and 5660 variants nest under 5660', () => {
      const tree = cluster([
        'idea.docx',
        '5653.jpeg', '5654.jpeg', '5659.jpeg', '5660.jpeg', '5661.jpeg', '5663.psd',
        '5660_e1.psd', '5660_e2.psd',
        'sketchv1.jpeg', 'sketchv2.jpeg',
      ]);

      expect(tree.files).toEqual(['idea.docx']);
      expect(Object.keys(tree.clusters)).toEqual(['5653–5663', 'sketchv']);
      expect(tree.clusters['5653–5663']).toEqual({
        files: ['5653.jpeg', '5654.jpeg', '5659.jpeg', '5661.jpeg', '5663.psd'],
        clusters: {
          5660: {
            files: ['5660.jpeg'],
            clusters: { _e: leaves('5660_e1.psd', '5660_e2.psd') },
          },
        },
      });
    });

    test('a numbered series next to a named variant is grouped as one block', () => {
      expect(
        cluster(['model1.3dm', 'model2.3dm', 'model3.3dm', 'modelmanu1.3dm', 'modelmanu2.3dm'])
      ).toEqual({
        files: [],
        clusters: {
          model: {
            files: [],
            clusters: {
              '1–3': leaves('model1.3dm', 'model2.3dm', 'model3.3dm'),
              manu: leaves('modelmanu1.3dm', 'modelmanu2.3dm'),
            },
          },
        },
      });
    });
  });
});
