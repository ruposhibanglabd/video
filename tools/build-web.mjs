#!/usr/bin/env node
/**
 * Build the static browser app into dist/ (used locally and on Vercel).
 * No bundler: the scene modules are plain ES modules that already run in the
 * browser, so we only copy them and load the fonts + muxer as local assets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

function copyDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst, filter);
    else if (filter(src)) fs.copyFileSync(src, dst);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

copyDir(path.join(ROOT, 'public'), DIST);
copyDir(path.join(ROOT, 'src'), path.join(DIST, 'src'), (f) => /\.(mjs|js|css)$/.test(f));
copyDir(path.join(ROOT, 'assets', 'fonts'), path.join(DIST, 'fonts'), (f) => /\.ttf$/.test(f));

// mp4-muxer (MIT) — vendored so the page has zero third-party network calls
fs.mkdirSync(path.join(DIST, 'vendor'), { recursive: true });
fs.copyFileSync(
  path.join(ROOT, 'node_modules', 'mp4-muxer', 'build', 'mp4-muxer.mjs'),
  path.join(DIST, 'vendor', 'mp4-muxer.mjs'),
);
const lic = path.join(ROOT, 'node_modules', 'mp4-muxer', 'LICENSE');
if (fs.existsSync(lic)) fs.copyFileSync(lic, path.join(DIST, 'vendor', 'LICENSE-mp4-muxer.txt'));

console.log(`[build] static app → ${path.relative(ROOT, DIST)}/`);
