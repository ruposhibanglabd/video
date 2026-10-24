#!/usr/bin/env node
/**
 * Build the static web showcase + studio generator into dist/.
 * Copies fonts, scene modules, product assets, media assets, mp4-muxer,
 * and the rendered master MP4 (`output/CodePixel-Web-Premium-Ad.mp4`) if present.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

function copyDir(from, to, filter = () => true) {
  if (!fs.existsSync(from)) return;
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
copyDir(path.join(ROOT, 'src'), path.join(DIST, 'src'), (f) => /\.(mjs|js|css|json)$/.test(f));
copyDir(path.join(ROOT, 'assets', 'fonts'), path.join(DIST, 'fonts'), (f) => /\.ttf$/.test(f));
copyDir(path.join(ROOT, 'assets', 'products'), path.join(DIST, 'products'), (f) => /\.(jpg|jpeg|png)$/.test(f));

const masterMp4 = path.join(ROOT, 'output', 'CodePixel-Web-Premium-Ad.mp4');
if (fs.existsSync(masterMp4)) {
  fs.mkdirSync(path.join(DIST, 'media'), { recursive: true });
  fs.copyFileSync(masterMp4, path.join(DIST, 'media', 'CodePixel-Web-Premium-Ad.mp4'));
}

// mp4-muxer (MIT) — vendored locally for offline/browser custom re-renders
fs.mkdirSync(path.join(DIST, 'vendor'), { recursive: true });
fs.copyFileSync(
  path.join(ROOT, 'node_modules', 'mp4-muxer', 'build', 'mp4-muxer.mjs'),
  path.join(DIST, 'vendor', 'mp4-muxer.mjs'),
);
const lic = path.join(ROOT, 'node_modules', 'mp4-muxer', 'LICENSE');
if (fs.existsSync(lic)) fs.copyFileSync(lic, path.join(DIST, 'vendor', 'LICENSE-mp4-muxer.txt'));

console.log(`[build] static showcase + studio app → ${path.relative(ROOT, DIST)}/`);
