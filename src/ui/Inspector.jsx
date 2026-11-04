import React from 'react';

function ClusterTree({ node, selection, onSelect, root = false }) {
  const pressed = Boolean(selection && selection.type === 'cluster' && selection.id === node.id);
  const item = (
    <button type="button" className="tree-item" aria-pressed={pressed} onClick={() => onSelect(node.id)}>
      {node.color ? (
        <span className="swatch" style={{ background: node.color.stroke }} />
      ) : (
        <span className="swatch" style={{ border: '1.5px solid #8A8D93' }} />
      )}
      <span className="title">{root ? 'Tümü' : node.title}</span>
      <span className="count">{node.count}</span>
    </button>
  );
  return (
    <li>
      {item}
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <ClusterTree key={c.id} node={c} selection={selection} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

function MiniLayout({ alt }) {
  return (
    <svg viewBox={`0 0 ${alt.width} ${alt.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {alt.placements.map((p) => (
        <rect
          key={p.file.id}
          x={p.x + 0.06}
          y={p.y + 0.06}
          width={p.w - 0.12}
          height={p.h - 0.12}
          fill={(p.cluster.color || { fill: '#E4E6EA' }).fill}
          stroke={(p.cluster.color || { stroke: '#5C6068' }).stroke}
          strokeWidth={0.08}
        />
      ))}
    </svg>
  );
}

export default function Inspector({ result, alt, selectedAlt, onSelectAlt, weight, onWeight, selection, onSelectCluster, fileCount }) {
  return (
    <aside className="panel panel-right" aria-label="Ayrıntılar">
      <section>
        <h2>Kümeler</h2>
        {result ? (
          <ul className="tree" style={{ marginTop: 8 }}>
            <ClusterTree node={result.tree} selection={selection} onSelect={onSelectCluster} root />
          </ul>
        ) : (
          <p className="muted small">Dosya eklenince kümeler burada görünür.</p>
        )}
      </section>

      <section className="slider">
        <h2>
          <label htmlFor="weight">Hedef</label>
        </h2>
        <span className="muted small" id="weight-help">
          Boşluksuz doldurma ile yatay (≈ 1.8 : 1) görünüm arasındaki denge
        </span>
        <input
          id="weight"
          type="range"
          min="0"
          max="100"
          value={weight}
          aria-describedby="weight-help"
          onChange={(e) => onWeight(Number(e.target.value))}
        />
        <div className="slider-ends" aria-hidden="true">
          <span>Doluluk</span>
          <span>Yatay oran</span>
        </div>
      </section>

      <section>
        <h2>Sonuç</h2>
        <dl className="metrics" style={{ marginTop: 8 }}>
          <div className="metric">
            <dt>Uygunluk</dt>
            <dd data-testid="metric-fitness">{alt ? alt.metrics.fitness.toFixed(1) : '–'}</dd>
          </div>
          <div className="metric">
            <dt>Doluluk</dt>
            <dd data-testid="metric-fill">{alt ? `%${Math.round(alt.metrics.fill)}` : '–'}</dd>
          </div>
          <div className="metric">
            <dt>En-boy</dt>
            <dd>{alt ? `${alt.metrics.ratio.toFixed(1)} : 1` : '–'}</dd>
          </div>
          <div className="metric">
            <dt>Dosya</dt>
            <dd>{fileCount}</dd>
          </div>
        </dl>
      </section>

      {result && result.alternatives.length > 1 && (
        <section>
          <h2>Alternatif yerleşimler</h2>
          <div className="alts" style={{ marginTop: 8 }}>
            {result.alternatives.map((a, i) => (
              <button
                key={i}
                type="button"
                className="alt"
                aria-pressed={i === selectedAlt}
                aria-label={`Alternatif ${i + 1}, uygunluk ${a.metrics.fitness.toFixed(1)}`}
                onClick={() => onSelectAlt(i)}
              >
                <MiniLayout alt={a} />
                <span>#{i + 1}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
