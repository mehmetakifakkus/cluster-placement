// Smoke test of the production build, the way GitHub Pages serves it:
// dist/ under /cluster-placement/. Fails when the page throws, logs an error,
// or does not draw a layout.
//
//   npm run build && npm run smoke
//
// PLAYWRIGHT_CHROMIUM_PATH can point at a preinstalled Chromium binary.

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const BASE = '/cluster-placement/';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith(BASE)) {
    res.writeHead(404).end();
    return;
  }
  let file = path.join(ROOT, decodeURIComponent(url.pathname.slice(BASE.length)));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}${BASE}`;

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
);
const problems = [];
let ok = false;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // Third-party fonts may be unreachable on CI; only the app's own errors count.
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test(m.text() + (m.location()?.url || ''))) {
      problems.push(`console error: ${m.text()}`);
    }
  });
  page.on('requestfailed', (r) => {
    if (r.url().startsWith(url)) problems.push(`failed request: ${r.url()}`);
  });

  await page.goto(url);
  const blocks = page.locator('[data-testid="layout"] [data-file]');
  await blocks.first().waitFor({ timeout: 10000 });
  const initial = await blocks.count();
  if (initial !== 10) problems.push(`expected 10 blocks for the example, got ${initial}`);

  // Paste two more files and wait for the debounced recompute.
  await page.getByRole('button', { name: 'Metin olarak yapıştır' }).click();
  await page.getByLabel(/Her satıra bir dosya/).fill('kapak.png, 1200, 800\nlogo.ai');
  await page.getByRole('button', { name: 'Listeye ekle' }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="layout"] [data-file]').length === 12,
    null,
    { timeout: 5000 },
  );

  // Pick a real image file: its size is read by the browser and its thumbnail can be shown.
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C8641D';
    ctx.fillRect(0, 0, 300, 150);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page
    .locator('input[type="file"][multiple]')
    .setInputFiles({ name: 'banner.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.getByText('300×150').waitFor({ timeout: 5000 });
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="layout"] [data-file]').length === 13,
    null,
    { timeout: 5000 },
  );
  await page.getByRole('button', { name: 'Küçük resimler' }).click();
  if ((await page.locator('[data-testid="layout"] image').count()) !== 1) {
    problems.push('expected one thumbnail image after picking banner.png');
  }

  // Switch example and an alternative layout.
  await page.getByLabel('Örnek').selectOption('photos');
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="layout"] [data-file]').length === 26,
    null,
    { timeout: 5000 },
  );
  const alt = page.getByRole('button', { name: /^Alternatif 2/ });
  if (await alt.count()) await alt.click();

  await page.screenshot({ path: 'smoke-results/studio.png', fullPage: true });
  ok = problems.length === 0;
} catch (e) {
  problems.push(String(e && e.message ? e.message : e));
} finally {
  await browser.close();
  server.close();
}

if (!ok) {
  console.error('Smoke test failed:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Smoke test passed: layout drawn, files added, example switched, no errors.');
