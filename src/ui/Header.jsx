import React, { useRef } from 'react';
import { EXAMPLES } from '../examples';

const HOW_IT_WORKS = 'https://github.com/mehmetakifakkus/cluster-placement#readme';

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="2" width="10" height="14" rx="2" fill="none" stroke="#2F5BEA" strokeWidth="2" />
      <rect x="14" y="2" width="12" height="7" rx="2" fill="none" stroke="#C8641D" strokeWidth="2" />
      <rect x="14" y="11" width="5" height="5" rx="1.5" fill="none" stroke="#1F8577" strokeWidth="2" />
      <rect x="21" y="11" width="5" height="5" rx="1.5" fill="none" stroke="#1F8577" strokeWidth="2" />
      <rect x="2" y="19" width="24" height="7" rx="2" fill="none" stroke="#5C6068" strokeWidth="2" />
    </svg>
  );
}

export default function Header({ exampleId, onExample, onRegenerate, onExport, canExport }) {
  const menu = useRef(null);
  const exportAs = (format) => {
    if (menu.current) menu.current.open = false;
    onExport(format);
  };

  return (
    <header className="header">
      <div className="brand">
        <Logo />
        <span className="brand-name">Cluster Placement</span>
        <a className="brand-link" href={HOW_IT_WORKS} target="_blank" rel="noreferrer">
          Nasıl çalışır?
        </a>
      </div>
      <label>
        Örnek
        <select value={exampleId} onChange={(e) => onExample(e.target.value)}>
          {EXAMPLES.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn" onClick={onRegenerate}>
        Yeniden üret
      </button>
      <details className="menu" ref={menu}>
        <summary className="btn btn-primary" aria-disabled={!canExport}>
          Dışa aktar
        </summary>
        <div className="menu-list">
          <button type="button" disabled={!canExport} onClick={() => exportAs('png')}>PNG görsel</button>
          <button type="button" disabled={!canExport} onClick={() => exportAs('svg')}>SVG çizim</button>
          <button type="button" disabled={!canExport} onClick={() => exportAs('json')}>JSON veri</button>
        </div>
      </details>
    </header>
  );
}
