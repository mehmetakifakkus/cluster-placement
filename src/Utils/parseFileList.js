import { File } from '../File';

// Turns the lines of the text box ("name, width, height" or just "name")
// into File objects. Blank lines are skipped and every field is trimmed.
export function parseFileList(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(',').map((part) => part.trim());
      if (parts.length === 3) return new File(parts[0], Number(parts[1]), Number(parts[2]));
      return new File(parts[0], 1, 1);
    });
}
