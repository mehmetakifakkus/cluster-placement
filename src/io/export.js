// Turns a layout alternative into downloadable files.

export const EXPORT_UNIT = 40; // px per grid unit in SVG and PNG exports
const GAP = 0.08; // grid units between neighbouring blocks
const FONT = "'IBM Plex Sans', system-ui, sans-serif";

const escapeXml = (s) =>
  String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);

// Shortens a name to fit a block `widthUnits` wide at the label font size.
export function fitLabel(name, widthUnits, charWidthUnits = 0.15) {
  const max = Math.max(1, Math.floor((widthUnits - 0.3) / charWidthUnits));
  return name.length <= max ? name : `${name.slice(0, Math.max(1, max - 1))}…`;
}

export function toSvg(alt, { unit = EXPORT_UNIT } = {}) {
  const w = alt.width * unit;
  const h = alt.height * unit;
  const blocks = alt.placements
    .map((p) => {
      const c = colorOf(p);
      const x = (p.x + GAP / 2) * unit;
      const y = (p.y + GAP / 2) * unit;
      const bw = (p.w - GAP) * unit;
      const bh = (p.h - GAP) * unit;
      const label = escapeXml(fitLabel(p.file.name, p.w));
      return (
        `<g><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${unit * 0.1}" ` +
        `fill="${c.fill}" stroke="${c.stroke}" stroke-width="${unit * 0.04}"/>` +
        `<text x="${x + unit * 0.15}" y="${y + unit * 0.38}" font-family="${escapeXml(FONT)}" ` +
        `font-size="${unit * 0.24}" fill="${c.ink}">${label}</text></g>`
      );
    })
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="100%" height="100%" fill="#FFFFFF"/>${blocks}</svg>`
  );
}

export function toJson(alt) {
  return JSON.stringify(
    {
      width: alt.width,
      height: alt.height,
      metrics: alt.metrics,
      files: alt.placements.map((p) => ({
        name: p.file.name,
        cluster: p.cluster.title,
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
      })),
    },
    null,
    2,
  );
}

function colorOf(p) {
  return p.cluster.color || { fill: '#E4E6EA', stroke: '#5C6068', ink: '#2B2E33' };
}

// Browser-only helpers below.

export function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function svgToPngBlob(svg, width, height, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG oluşturulamadı'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG yüklenemedi'));
    };
    img.src = url;
  });
}
