// Reads dropped or picked files in the browser. Nothing is uploaded: only the
// name and, for images the browser can decode, the pixel size are read, and a
// local object URL is kept for the thumbnail.

const HIDDEN = /^\./;

// FileList | File[] -> Promise<[{ name, width, height, sizeSource, thumbUrl }]>
// sizeSource is 'image' when the size was read, 'unknown' otherwise.
export async function readFiles(fileList, { loadImage = loadImageSize } = {}) {
  const files = Array.from(fileList).filter((f) => !HIDDEN.test(f.name));
  return Promise.all(
    files.map(async (file) => {
      const image = isImage(file) ? await loadImage(file) : null;
      return image
        ? { name: file.name, width: image.width, height: image.height, sizeSource: 'image', thumbUrl: image.url }
        : { name: file.name, width: null, height: null, sizeSource: 'unknown', thumbUrl: null };
    }),
  );
}

function isImage(file) {
  return typeof file.type === 'string' && file.type.startsWith('image/');
}

// Resolves to { width, height, url } or null when the browser cannot decode it.
export function loadImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve({ width: img.naturalWidth, height: img.naturalHeight, url });
      } else {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

// Collects files from a drop, walking into dropped folders where the browser
// supports it. Falls back to the plain file list.
export async function filesFromDrop(dataTransfer) {
  const items = Array.from(dataTransfer.items || []);
  const entries = items
    .map((item) => (item.kind === 'file' && item.webkitGetAsEntry ? item.webkitGetAsEntry() : null))
    .filter(Boolean);
  if (entries.length === 0) return Array.from(dataTransfer.files || []);

  const out = [];
  await Promise.all(entries.map((entry) => walk(entry, out)));
  return out;
}

async function walk(entry, out) {
  if (HIDDEN.test(entry.name)) return;
  if (entry.isFile) {
    out.push(await new Promise((resolve, reject) => entry.file(resolve, reject)));
    return;
  }
  if (entry.isDirectory) {
    const reader = entry.createReader();
    // readEntries returns the folder's entries in batches until an empty one.
    for (;;) {
      const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
      if (batch.length === 0) break;
      await Promise.all(batch.map((child) => walk(child, out)));
    }
  }
}
