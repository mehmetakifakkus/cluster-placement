import React, { useState } from 'react';
import { parseFileList } from '../core/parse';
import { filesFromDrop, readFiles } from '../io/readFiles';

const NEUTRAL = { fill: '#E4E6EA', stroke: '#5C6068' };

// Files grouped by the cluster that holds them, in tree order; files the last
// layout has not seen yet (it is about to recompute) go to a "new" group.
function groupFiles(files, tree) {
  const groups = [];
  const seen = new Set();
  const walk = (node) => {
    const ids = new Set(node.files.map((f) => f.id));
    const own = files.filter((f) => ids.has(f.id));
    if (own.length > 0) {
      groups.push({ key: node.id, title: node.title, color: node.color || NEUTRAL, files: own });
      own.forEach((f) => seen.add(f.id));
    }
    node.children.forEach(walk);
  };
  if (tree) walk(tree);
  const rest = files.filter((f) => !seen.has(f.id));
  if (rest.length > 0) groups.push({ key: 'new', title: 'Yeni eklenenler', color: NEUTRAL, files: rest });
  return groups;
}

function UnknownSize({ file, onSetSize }) {
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const apply = (nw, nh) => {
    const wn = Number(nw);
    const hn = Number(nh);
    if (wn > 0 && hn > 0) onSetSize(file.id, wn, hn);
  };
  return (
    <span className="unknown-size" title="Boyut okunamadı; kare (1:1) kabul ediliyor">
      <input
        inputMode="numeric"
        aria-label={`${file.name} genişlik`}
        placeholder="gen."
        value={w}
        onChange={(e) => setW(e.target.value)}
        onBlur={() => apply(w, h)}
        onKeyDown={(e) => e.key === 'Enter' && apply(w, h)}
      />
      <span aria-hidden="true">×</span>
      <input
        inputMode="numeric"
        aria-label={`${file.name} yükseklik`}
        placeholder="yük."
        value={h}
        onChange={(e) => setH(e.target.value)}
        onBlur={() => apply(w, h)}
        onKeyDown={(e) => e.key === 'Enter' && apply(w, h)}
      />
    </span>
  );
}

export default function FilePanel({ files, tree, highlighted, onAdd, onRemove, onClear, onSetSize, onHover, onSelect }) {
  const [dragging, setDragging] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [reading, setReading] = useState(false);

  const addFromFiles = async (list) => {
    if (!list || list.length === 0) return;
    setReading(true);
    try {
      onAdd(await readFiles(list));
    } finally {
      setReading(false);
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    addFromFiles(await filesFromDrop(e.dataTransfer));
  };

  const addPasted = () => {
    const parsed = parseFileList(pasteText).map((f) => ({
      ...f,
      sizeSource: f.width ? 'text' : 'unknown',
      thumbUrl: null,
    }));
    if (parsed.length > 0) onAdd(parsed);
    setPasteText('');
    setPasteOpen(false);
  };

  const groups = groupFiles(files, tree);
  const unknownCount = files.filter((f) => !(f.width > 0 && f.height > 0)).length;

  return (
    <aside className="panel panel-left" aria-label="Dosyalar">
      <div className="panel-head">
        <h2>Dosyalar</h2>
        <span className="muted small">{files.length} dosya</span>
      </div>

      <div
        className={`dropzone${dragging ? ' dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" fill="none" stroke="#5C6068" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{reading ? 'Dosyalar okunuyor…' : 'Dosyaları ya da klasörü buraya bırakın'}</span>
        <span className="muted small">Ad ve görsel çözünürlüğü okunur; dosyalar tarayıcıdan çıkmaz.</span>
        <div className="dropzone-actions">
          <label className="btn btn-small">
            Dosya seç
            <input className="visually-hidden" type="file" multiple onChange={(e) => addFromFiles(e.target.files)} />
          </label>
          <label className="btn btn-small">
            Klasör seç
            <input className="visually-hidden" type="file" webkitdirectory="" onChange={(e) => addFromFiles(e.target.files)} />
          </label>
        </div>
        <button type="button" className="link-btn" aria-expanded={pasteOpen} onClick={() => setPasteOpen((o) => !o)}>
          Metin olarak yapıştır
        </button>
      </div>

      {pasteOpen && (
        <div className="paste">
          <label htmlFor="paste-text" className="small">
            Her satıra bir dosya: <code>ad, genişlik, yükseklik</code> (boyut isteğe bağlı)
          </label>
          <textarea
            id="paste-text"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={'kapak.png, 1200, 800\nlogo.ai'}
          />
          <div className="paste-actions">
            <button type="button" className="btn btn-small btn-primary" onClick={addPasted}>
              Listeye ekle
            </button>
            <button type="button" className="btn btn-small" onClick={() => setPasteOpen(false)}>
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {unknownCount > 0 && (
        <p className="small muted" style={{ margin: 0 }}>
          {unknownCount} dosyanın boyutu bilinmiyor; kare kabul edildi. İsterseniz boyutunu yazın.
        </p>
      )}

      <div className="file-groups">
        {groups.map((g) => (
          <section className="file-group" key={g.key}>
            <h3>
              <span className="swatch" style={{ background: g.color.stroke }} />
              {g.title}
              <span className="muted" style={{ fontWeight: 400 }}>· {g.files.length}</span>
            </h3>
            <ul>
              {g.files.map((f) => (
                <li
                  key={f.id}
                  className={`file-row${highlighted.has(f.id) ? ' active' : ''}`}
                  onMouseEnter={() => onHover(f.id)}
                  onMouseLeave={() => onHover(null)}
                >
                  <span className="swatch-lg" style={{ background: g.color.fill, borderColor: g.color.stroke }} />
                  <button type="button" className="name" title={f.name} onClick={() => onSelect(f.id)}>
                    {f.name}
                  </button>
                  {f.width > 0 && f.height > 0 ? (
                    <span className="dims">
                      {f.width}×{f.height}
                    </span>
                  ) : (
                    <UnknownSize file={f} onSetSize={onSetSize} />
                  )}
                  <button type="button" className="icon-btn" aria-label={`${f.name} dosyasını kaldır`} onClick={() => onRemove(f.id)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {files.length > 0 && (
        <div className="panel-foot">
          <span className="muted small">Dosyalar yalnızca bu sekmede tutulur.</span>
          <button type="button" className="btn btn-small" onClick={onClear}>
            Temizle
          </button>
        </div>
      )}
    </aside>
  );
}
