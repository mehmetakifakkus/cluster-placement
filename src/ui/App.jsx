import React, { useEffect, useMemo, useRef, useState } from 'react';
import { runLayout } from '../core/layout';
import { DEFAULT_WEIGHT } from '../core/ga';
import { seededRandom } from '../core/random';
import { EXAMPLES } from '../examples';
import { download, svgToPngBlob, toJson, toSvg } from '../io/export';
import Header from './Header';
import FilePanel from './FilePanel';
import LayoutView from './LayoutView';
import Inspector from './Inspector';

const RECOMPUTE_DELAY = 300;

let nextFileId = 1;
const withIds = (files) => files.map((f) => ({ ...f, id: nextFileId++ }));

const compute = (files, weight, seed) => runLayout(files, { weight, rng: seededRandom(seed) });

function revokeThumbs(files) {
  for (const f of files) if (f.thumbUrl) URL.revokeObjectURL(f.thumbUrl);
}

function fileIdsOf(node, out = new Set()) {
  node.files.forEach((f) => out.add(f.id));
  node.children.forEach((c) => fileIdsOf(c, out));
  return out;
}

function findCluster(node, id) {
  if (node.id === id) return node;
  for (const c of node.children) {
    const found = findCluster(c, id);
    if (found) return found;
  }
  return null;
}

export default function App({ initialExample = EXAMPLES[0].id }) {
  const [exampleId, setExampleId] = useState(initialExample);
  const [files, setFiles] = useState(() => withIds(EXAMPLES.find((e) => e.id === initialExample).files));
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState(() => compute(files, weight, seed));
  const [selectedAlt, setSelectedAlt] = useState(0);
  const [selection, setSelection] = useState(null); // { type: 'cluster' | 'file', id }
  const [hoverFile, setHoverFile] = useState(null);
  const [view, setView] = useState({ labels: 'names', grid: true, zoom: 'fit' });

  // Recompute shortly after the files, the weight or the seed change.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    setHoverFile(null);
    const timer = setTimeout(() => {
      setResult(compute(files, weight, seed));
      setSelectedAlt(0);
      setSelection((s) => (s && s.type === 'file' ? s : null)); // cluster ids change
    }, RECOMPUTE_DELAY);
    return () => clearTimeout(timer);
  }, [files, weight, seed]);

  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => revokeThumbs(filesRef.current), []);

  const alt = result ? result.alternatives[Math.min(selectedAlt, result.alternatives.length - 1)] : null;
  const filesById = useMemo(() => new Map(files.map((f) => [f.id, f])), [files]);

  const highlighted = useMemo(() => {
    const ids = new Set();
    if (selection && selection.type === 'file') ids.add(selection.id);
    if (selection && selection.type === 'cluster' && result) {
      const node = findCluster(result.tree, selection.id);
      if (node) fileIdsOf(node, ids);
    }
    // A block removed while hovered never gets mouseleave: ignore ids that are gone.
    if (hoverFile != null && filesById.has(hoverFile)) ids.add(hoverFile);
    if (selection && selection.type === 'file' && !filesById.has(selection.id)) ids.delete(selection.id);
    return ids;
  }, [selection, hoverFile, result, filesById]);

  const actions = {
    addFiles: (list) => setFiles((prev) => [...prev, ...withIds(list)]),
    removeFile: (id) =>
      setFiles((prev) => {
        revokeThumbs(prev.filter((f) => f.id === id));
        return prev.filter((f) => f.id !== id);
      }),
    clear: () =>
      setFiles((prev) => {
        revokeThumbs(prev);
        return [];
      }),
    setSize: (id, width, height) =>
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, width, height, sizeSource: 'manual' } : f))),
    loadExample: (id) => {
      setExampleId(id);
      setFiles((prev) => {
        revokeThumbs(prev);
        return withIds(EXAMPLES.find((e) => e.id === id).files);
      });
    },
    regenerate: () => setSeed((s) => s + 1),
    selectFile: (id) => setSelection((s) => (s && s.type === 'file' && s.id === id ? null : { type: 'file', id })),
    selectCluster: (id) =>
      setSelection((s) => (s && s.type === 'cluster' && s.id === id ? null : { type: 'cluster', id })),
    exportAs: async (format) => {
      if (!alt) return;
      const svg = toSvg(alt);
      if (format === 'svg') download('yerlesim.svg', new Blob([svg], { type: 'image/svg+xml' }));
      if (format === 'json') download('yerlesim.json', new Blob([toJson(alt)], { type: 'application/json' }));
      if (format === 'png') {
        const unit = 40;
        download('yerlesim.png', await svgToPngBlob(svg, alt.width * unit, alt.height * unit));
      }
    },
  };

  return (
    <div className="app">
      <Header
        exampleId={exampleId}
        onExample={actions.loadExample}
        onRegenerate={actions.regenerate}
        onExport={actions.exportAs}
        canExport={Boolean(alt)}
      />
      <div className="workspace">
        <FilePanel
          files={files}
          tree={result && result.tree}
          highlighted={highlighted}
          onAdd={actions.addFiles}
          onRemove={actions.removeFile}
          onClear={actions.clear}
          onSetSize={actions.setSize}
          onHover={setHoverFile}
          onSelect={actions.selectFile}
        />
        <LayoutView
          alt={alt}
          filesById={filesById}
          view={view}
          onView={setView}
          highlighted={highlighted}
          onHover={setHoverFile}
          onSelect={actions.selectFile}
        />
        <Inspector
          result={result}
          alt={alt}
          selectedAlt={selectedAlt}
          onSelectAlt={setSelectedAlt}
          weight={weight}
          onWeight={setWeight}
          selection={selection}
          onSelectCluster={actions.selectCluster}
          fileCount={files.length}
        />
      </div>
    </div>
  );
}
