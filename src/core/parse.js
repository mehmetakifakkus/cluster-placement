// Turns pasted text ("name, width, height" or just "name" per line) into file
// descriptors. Blank lines are skipped and every field is trimmed. A line
// without a valid size gets width and height null: the size is unknown.
export function parseFileList(text) {
  const lines = Array.isArray(text) ? text : String(text).split(/\r?\n/);

  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name, ...dims] = line.split(',').map((part) => part.trim());
      const [width, height] = dims.map(Number);
      const known = dims.length === 2 && width > 0 && height > 0;
      return { name, width: known ? width : null, height: known ? height : null };
    });
}
