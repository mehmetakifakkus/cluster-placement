import { describe, expect, test } from 'vitest';
import { readFiles, filesFromDrop } from './readFiles';
import { fitLabel, toJson, toSvg } from './export';

const fakeFile = (name, type = '') => ({ name, type });

describe('readFiles', () => {
  test('reads image sizes and marks other files as unknown', async () => {
    const loadImage = async (file) => (file.name === 'broken.png' ? null : { width: 1200, height: 800, url: `blob:${file.name}` });
    const result = await readFiles(
      [fakeFile('photo.jpg', 'image/jpeg'), fakeFile('logo.ai', 'application/postscript'), fakeFile('broken.png', 'image/png')],
      { loadImage },
    );
    expect(result).toEqual([
      { name: 'photo.jpg', width: 1200, height: 800, sizeSource: 'image', thumbUrl: 'blob:photo.jpg' },
      { name: 'logo.ai', width: null, height: null, sizeSource: 'unknown', thumbUrl: null },
      { name: 'broken.png', width: null, height: null, sizeSource: 'unknown', thumbUrl: null },
    ]);
  });

  test('skips hidden files such as .DS_Store', async () => {
    const result = await readFiles([fakeFile('.DS_Store'), fakeFile('a.txt')], { loadImage: async () => null });
    expect(result.map((f) => f.name)).toEqual(['a.txt']);
  });
});

describe('filesFromDrop', () => {
  const fileEntry = (name) => ({ name, isFile: true, isDirectory: false, file: (ok) => ok(fakeFile(name)) });
  const dirEntry = (name, children) => {
    let read = false;
    return {
      name,
      isFile: false,
      isDirectory: true,
      createReader: () => ({ readEntries: (ok) => { ok(read ? [] : children); read = true; } }),
    };
  };

  test('walks into dropped folders and skips hidden entries', async () => {
    const tree = dirEntry('project', [fileEntry('a.png'), fileEntry('.hidden'), dirEntry('renders', [fileEntry('r1.png')])]);
    const dt = { items: [{ kind: 'file', webkitGetAsEntry: () => tree }], files: [] };
    const files = await filesFromDrop(dt);
    expect(files.map((f) => f.name).sort()).toEqual(['a.png', 'r1.png']);
  });

  test('falls back to the plain file list', async () => {
    const files = await filesFromDrop({ files: [fakeFile('x.png')] });
    expect(files.map((f) => f.name)).toEqual(['x.png']);
  });
});

describe('export', () => {
  const alt = {
    width: 3,
    height: 2,
    metrics: { fitness: 90, fill: 100, ratio: 1.5 },
    placements: [
      { file: { name: 'a<1>.png' }, cluster: { title: 'a', color: { fill: '#111', stroke: '#222', ink: '#333' } }, x: 0, y: 0, w: 2, h: 2 },
      { file: { name: 'b.png' }, cluster: { title: 'b', color: null }, x: 2, y: 0, w: 1, h: 1 },
    ],
  };

  test('SVG has one block per file, escaped names and the layout size', () => {
    const svg = toSvg(alt, { unit: 10 });
    expect(svg).toContain('width="30" height="20"');
    expect(svg.match(/<g>/g)).toHaveLength(2);
    expect(svg).toContain('a&lt;1&gt;.png');
    expect(svg).not.toContain('a<1>');
  });

  test('JSON lists names, clusters and positions', () => {
    const data = JSON.parse(toJson(alt));
    expect(data.files).toEqual([
      { name: 'a<1>.png', cluster: 'a', x: 0, y: 0, w: 2, h: 2 },
      { name: 'b.png', cluster: 'b', x: 2, y: 0, w: 1, h: 1 },
    ]);
    expect(data.width).toBe(3);
  });

  test('fitLabel shortens long names with an ellipsis', () => {
    expect(fitLabel('short.png', 3)).toBe('short.png');
    const label = fitLabel('a-very-long-file-name.png', 1);
    expect(label.endsWith('…')).toBe(true);
    expect(label.length).toBeLessThan('a-very-long-file-name.png'.length);
  });
});
