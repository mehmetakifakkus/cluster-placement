import React from 'react';
import { fitLabel } from '../io/export';

const UNIT_PX = 56; // px per grid unit at 100% zoom
const GAP = 0.08;
const NEUTRAL = { fill: '#E4E6EA', stroke: '#5C6068', ink: '#2B2E33' };

function Block({ p, file, mode, dim, onHover, onSelect }) {
  const c = p.cluster.color || NEUTRAL;
  const x = p.x + GAP / 2;
  const y = p.y + GAP / 2;
  const w = p.w - GAP;
  const h = p.h - GAP;
  const thumb = mode === 'thumbs' && file && file.thumbUrl;
  const clipId = `clip-${p.file.id}`;

  return (
    <g
      className={`block${dim ? ' dim' : ''}`}
      data-file={p.file.id}
      onMouseEnter={() => onHover(p.file.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(p.file.id)}
    >
      <title>{p.file.name}</title>
      <rect x={x} y={y} width={w} height={h} rx={0.1} fill={c.fill} stroke={c.stroke} strokeWidth={0.04} />
      {thumb ? (
        <>
          <clipPath id={clipId}>
            <rect x={x} y={y} width={w} height={h} rx={0.1} />
          </clipPath>
          <image href={file.thumbUrl} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} />
        </>
      ) : (
        <>
          <text x={x + 0.15} y={y + 0.38} fontSize={0.24} fill={c.ink} fontWeight={500}>
            {fitLabel(p.file.name, p.w)}
          </text>
          {p.h >= 1 && (
            <text x={x + 0.15} y={y + h - 0.15} fontSize={0.2} fill={c.ink} fontFamily="var(--mono)">
              {p.w}:{p.h}
            </text>
          )}
        </>
      )}
    </g>
  );
}

export default function LayoutView({ alt, filesById, view, onView, highlighted, onHover, onSelect }) {
  const set = (patch) => onView({ ...view, ...patch });
  const hasThumbs = alt && alt.placements.some((p) => filesById.get(p.file.id)?.thumbUrl);

  return (
    <main className="stage">
      <div className="stage-toolbar">
        <h1>Yerleşim</h1>
        <button type="button" className="btn btn-small" aria-pressed={view.zoom === 'fit'} onClick={() => set({ zoom: 'fit' })}>
          Sığdır
        </button>
        <button type="button" className="btn btn-small" aria-pressed={view.zoom === '100'} onClick={() => set({ zoom: '100' })}>
          %100
        </button>
        <button type="button" className="btn btn-small" aria-pressed={view.grid} onClick={() => set({ grid: !view.grid })}>
          Izgara
        </button>
        <button
          type="button"
          className="btn btn-small"
          aria-pressed={view.labels === 'thumbs'}
          disabled={!hasThumbs}
          title={hasThumbs ? undefined : 'Küçük resimler için görsel dosyaları ekleyin'}
          onClick={() => set({ labels: view.labels === 'thumbs' ? 'names' : 'thumbs' })}
        >
          Küçük resimler
        </button>
      </div>

      <div className={`canvas${view.zoom === '100' ? ' zoom-100' : ''}`} data-testid="layout">
        {alt ? (
          <svg
            viewBox={`-0.1 -0.1 ${alt.width + 0.2} ${alt.height + 0.2}`}
            width={view.zoom === '100' ? (alt.width + 0.2) * UNIT_PX : '100%'}
            height={view.zoom === '100' ? (alt.height + 0.2) * UNIT_PX : undefined}
            role="img"
            aria-label={`${alt.placements.length} dosyalık yerleşim, ${alt.width} × ${alt.height} birim`}
            style={{ fontFamily: 'var(--sans)' }}
          >
            {view.grid && (
              <>
                <defs>
                  <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#E3E3DE" strokeWidth="0.02" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width={alt.width} height={alt.height} fill="url(#grid)" />
              </>
            )}
            {alt.placements.map((p) => (
              <Block
                key={p.file.id}
                p={p}
                file={filesById.get(p.file.id)}
                mode={view.labels}
                dim={highlighted.size > 0 && !highlighted.has(p.file.id)}
                onHover={onHover}
                onSelect={onSelect}
              />
            ))}
          </svg>
        ) : (
          <div className="empty">
            <strong>Henüz dosya yok</strong>
            Soldaki alana dosya ya da klasör bırakın, metin yapıştırın veya yukarıdan bir örnek seçin.
          </div>
        )}
      </div>
      {alt && (
        <p className="muted small" style={{ margin: 0 }}>
          Sınır kutusu {alt.width} × {alt.height} birim · bloklar dosyanın en-boy oranında (ör. 1200×1600 → 3:4)
        </p>
      )}
    </main>
  );
}
