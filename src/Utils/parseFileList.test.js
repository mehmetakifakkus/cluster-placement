import { parseFileList } from './parseFileList';

describe('parseFileList', () => {
  // Bug 3: blank lines became a file with an empty name.
  test('skips blank and whitespace-only lines', () => {
    const files = parseFileList(['a1.png, 10, 20', '', '   ', 'a2.png', '']);
    expect(files.map((f) => f.name)).toEqual(['a1.png', 'a2.png']);
  });

  test('trims names and parses dimensions as numbers', () => {
    const [file] = parseFileList(['  design1.ai ,  1200 , 1600  ']);
    expect(file.name).toBe('design1.ai');
    expect(file.width).toBe(1200);
    expect(file.height).toBe(1600);
  });

  test('defaults to 1x1 when no dimensions are given', () => {
    const [file] = parseFileList(['idea.docx']);
    expect(file.width).toBe(1);
    expect(file.height).toBe(1);
  });
});
