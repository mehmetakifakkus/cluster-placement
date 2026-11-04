// Clusters files by the shape of their names.
//
// A name is split into tokens: every run of digits is one token, every other
// character is a token of its own ("img10.png" -> i, m, g, 10, ., p, n, g).
// The tokens are put into a prefix tree, so files that share a prefix end up
// in the same cluster. Because a number is a single token, "img1", "img2" and
// "img10" are siblings, instead of "img10" being nested under "img1".
//
// When a level holds two or more numbered entries next to named ones (for
// example "model1", "model2" and "modelmanu..."), the numbered entries are
// wrapped into one series cluster titled with their range ("1–2"), so a
// numbered series is laid out as one block.
//
// `arranged` is a Map with a single "root" key. Every value below it is either
// a file (a leaf; any object with a `name`) or another Map (a sub cluster).
// Map keys are unique labels relative to their parent ("_e" under "5660").
// Each cluster Map also carries `prefix`, the whole name prefix its files share
// ("5660_e"), and a series Map has `series: true`.

export class FileCluster {
  constructor(fileList) {
    this.fileList = fileList;

    const items = fileList.map((file) => ({ file, tokens: tokenize(file.name) }));
    this.arranged = new Map([['root', buildLevel(items)]]);
  }
}

export function tokenize(name) {
  return name.match(/\d+|\D/gu) || [];
}

const isNumber = (token) => /^\d+$/.test(token);

// Builds one level of the tree from items whose shared prefix is already used up.
function buildLevel(items, prefix = '') {
  const level = new Map();
  level.prefix = prefix;
  const groups = new Map(); // next token -> items continuing with that token

  for (const { file, tokens } of items) {
    if (tokens.length === 0) {
      addUnique(level, file.name, file); // the whole name is consumed: a leaf
      continue;
    }
    const [head, ...rest] = tokens;
    if (!groups.has(head)) groups.set(head, []);
    groups.get(head).push({ file, tokens: rest });
  }

  const numberHeads = Array.from(groups.keys()).filter(isNumber);
  const makeSeries = numberHeads.length >= 2 && numberHeads.length < groups.size;
  let series = null;

  for (const [head, group] of groups) {
    if (makeSeries && isNumber(head)) {
      if (!series) {
        series = new Map();
        series.prefix = prefix;
        series.series = true;
        addUnique(level, seriesLabel(numberHeads), series);
      }
      place(series, head, group, prefix);
    } else {
      place(level, head, group, prefix);
    }
  }

  return level;
}

// A token followed by a single file becomes a leaf, otherwise a sub cluster.
function place(level, head, group, prefix) {
  if (group.length === 1) {
    addUnique(level, group[0].file.name, group[0].file);
    return;
  }

  // Merge the tokens every item still shares into the cluster label.
  let label = head;
  let items = group;
  while (
    items.every((it) => it.tokens.length > 0) &&
    items.every((it) => it.tokens[0] === items[0].tokens[0])
  ) {
    label += items[0].tokens[0];
    items = items.map((it) => ({ file: it.file, tokens: it.tokens.slice(1) }));
  }

  addUnique(level, label, buildLevel(items, prefix + label));
}

function seriesLabel(numberHeads) {
  const values = numberHeads.map(Number);
  return `${Math.min(...values)}–${Math.max(...values)}`;
}

// Map keys must be unique, e.g. when the same file name is given twice.
function addUnique(map, key, value) {
  let unique = key;
  for (let n = 2; map.has(unique); n++) unique = `${key} (${n})`;
  map.set(unique, value);
}
