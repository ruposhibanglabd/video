#!/usr/bin/env node
/**
 * Tiny static server for local preview of dist/ (Range requests supported).
 *
 * Also mounts the render output folder at /output/ so a finished master can be
 * previewed or downloaded straight from the app's own origin:
 *
 *   /output/CodePixel-Web-Promo-Reels.mp4
 *   /output/CodePixel-Web-Promo-Reels-share.mp4?download=1
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../dist');
const OUTPUT = path.resolve(HERE, '../output');
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function sendFile(req, res, file, { download = false } = {}) {
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const extra = download
      ? { 'content-disposition': `attachment; filename="${path.basename(file)}"` }
      : {};
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      const start = m && m[1] ? Number(m[1]) : 0;
      const end = m && m[2] ? Number(m[2]) : stat.size - 1;
      res.writeHead(206, {
        'content-type': type,
        'content-range': `bytes ${start}-${end}/${stat.size}`,
        'accept-ranges': 'bytes',
        'content-length': end - start + 1,
        'cache-control': 'no-cache',
        ...extra,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, {
      'content-type': type, 'content-length': stat.size,
      'cache-control': 'no-cache', 'accept-ranges': 'bytes', ...extra,
    });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const [rawPath, rawQuery = ''] = (req.url || '/').split('?');
  const params = new URLSearchParams(rawQuery);
  let urlPath = decodeURIComponent(rawPath);
  const download = params.get('download') === '1';

  // rendered masters (kept outside dist/ on purpose — they are never committed)
  if (urlPath.startsWith('/output/')) {
    const rel = path.normalize(urlPath.slice('/output/'.length));
    const file = path.join(OUTPUT, rel);
    if (!file.startsWith(OUTPUT) || rel.startsWith('..')) { res.writeHead(403).end('Forbidden'); return; }
    sendFile(req, res, file, { download });
    return;
  }

  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.join(ROOT, path.normalize(urlPath).replace(/^([/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  sendFile(req, res, file, { download });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CodePixel Web app → http://localhost:${PORT}`);
});
