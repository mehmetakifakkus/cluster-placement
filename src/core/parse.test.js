import { describe, expect, test } from 'vitest';
import { parseFileList } from './parse';

describe('parseFileList', () => {
  test('skips blank and whitespace-only lines', () => {
    const files = parseFileList('a1.png, 10, 20\n\n   \na2.png\n');
    expect(files.map((f) => f.name)).toEqual(['a1.png', 'a2.png']);
  });

  test('trims names and parses dimensions as numbers', () => {
    const [file] = parseFileList(['  design1.ai ,  1200 , 1600  ']);
    expect(file).toEqual({ name: 'design1.ai', width: 1200, height: 1600 });
  });

  test('a line without a valid size has an unknown size', () => {
    expect(parseFileList('idea.docx\nbad.png, x, 10\nzero.png, 0, 5')).toEqual([
      { name: 'idea.docx', width: null, height: null },
      { name: 'bad.png', width: null, height: null },
      { name: 'zero.png', width: null, height: null },
    ]);
  });

  test('accepts Windows line endings', () => {
    expect(parseFileList('a.png, 1, 2\r\nb.png').map((f) => f.name)).toEqual(['a.png', 'b.png']);
  });
});
