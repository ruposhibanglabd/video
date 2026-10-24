#!/usr/bin/env node
/**
 * Local & Sandbox Preview Server for dist/ + output/
 * - Bound to 0.0.0.0:3000 with permissive host/origin support for live preview
 * - Full HTTP Byte-Range (206 Partial Content) streaming for smooth MP4 seeking
 * - `?download=1` attachment header support for guaranteed one-click MP4 download
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.join(BASE, 'dist');
const OUTPUT_MP4 = path.join(BASE, 'output', 'CodePixel-Web-Premium-Ad.mp4');
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
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url || '/', 'http://localhost');
  let urlPath = decodeURIComponent(parsed.pathname);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  let file = path.join(ROOT, path.normalize(urlPath).replace(/^([/\\])+/, ''));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('Forbidden');
    return;
  }

  // Fallback directly to master output MP4 if needed
  if (!fs.existsSync(file) && urlPath.endsWith('CodePixel-Web-Premium-Ad.mp4') && fs.existsSync(OUTPUT_MP4)) {
    file = OUTPUT_MP4;
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = {
      'content-type': type,
      'accept-ranges': 'bytes',
      'cache-control': 'no-cache',
      'access-control-allow-origin': '*',
    };
    if (parsed.searchParams.get('download') === '1') {
      const dlName = path.basename(file);
      headers['content-disposition'] = `attachment; filename="${dlName}"`;
    }

    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      const start = m && m[1] ? Number(m[1]) : 0;
      const end = m && m[2] ? Math.min(stat.size - 1, Number(m[2])) : stat.size - 1;
      if (start >= stat.size || start > end) {
        res.writeHead(416, { 'content-range': `bytes */${stat.size}` }).end();
        return;
      }
      res.writeHead(206, {
        ...headers,
        'content-range': `bytes ${start}-${end}/${stat.size}`,
        'content-length': end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, { ...headers, 'content-length': stat.size });
      res.end();
      return;
    }

    res.writeHead(200, { ...headers, 'content-length': stat.size });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CodePixel Web Studio → http://0.0.0.0:${PORT}`);
});
