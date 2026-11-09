#!/usr/bin/env node
/**
 * Set H v8 — extra website shots derived from the corrected plates.
 *   _3_dial      dial fills the frame (crop from the native plate, then Lanczos)
 *   _4_bracelet  bracelet macro from the same plate
 *   _2_angle     case + crown three-quarter crop
 * Also builds the shared group line-up from the finished 1600² mains.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'miqa/products/2026-11-08_set-h/plates-web4';
const OUT = 'miqa/deliveries/2026-11-08_set-h-v8/website';
const THUMBS = path.join(OUT, 'thumbs');
const S = 1600;
const T = 600;
fs.mkdirSync(THUMBS, { recursive: true });

function emit(canvas, name) {
  fs.writeFileSync(path.join(OUT, `${name}.jpg`), canvas.toBuffer('image/jpeg', 92));
  const tc = createCanvas(T, T);
  tc.getContext('2d').drawImage(canvas, 0, 0, T, T);
  fs.writeFileSync(path.join(THUMBS, `${name}_600.jpg`), tc.toBuffer('image/jpeg', 82));
}

function cropSquare(img, cx, cy, size) {
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const s = Math.min(size, img.width, img.height);
  const x = Math.max(0, Math.min(img.width - s, cx - s / 2));
  const y = Math.max(0, Math.min(img.height - s, cy - s / 2));
  ctx.drawImage(img, x, y, s, s, 0, 0, S, S);
  return c;
}

// watch occupies a centred vertical band; dial centre sits ~44% down that band
const JOBS = [
  ['w01_green.png', 'set-h-01-green'],
  ['w02_champagne.png', 'set-h-02-champagne'],
  ['w03_black.png', 'set-h-03-black'],
  ['w04_silver.png', 'set-h-04-silver'],
  ['w05_blue.png', 'set-h-05-blue'],
  ['w06_red.png', 'set-h-06-red'],
  ['w07_blacksteel.png', 'set-h-07-black-steel'],
];

for (const [file, slug] of JOBS) {
  const img = await loadImage(path.join(SRC, file));
  const w = img.width, h = img.height;
  const dial = Math.round(w * 0.52);
  emit(cropSquare(img, w * 0.5, h * 0.455, dial), `${slug}_3_dial`);
  emit(cropSquare(img, w * 0.5, h * 0.845, Math.round(w * 0.62)), `${slug}_4_bracelet`);
  emit(cropSquare(img, w * 0.5, h * 0.395, Math.round(w * 0.74)), `${slug}_2_angle`);
  console.log(`${slug}: dial/bracelet/angle`);
}

// ---- shared group line-up from the finished mains
const mains = JOBS.map(([, slug]) => path.join(OUT, `${slug}_1_main.jpg`));
const imgs = await Promise.all(mains.map((p) => loadImage(p)));
const g = createCanvas(S, S);
const gctx = g.getContext('2d');
gctx.fillStyle = '#F1F4F7';
gctx.fillRect(0, 0, S, S);
const cell = S / 7;
for (let r = 0; r < 40; r++) {
  const k = r / 40;
  const v = 247 - 20 * k;
  gctx.fillStyle = `rgb(${v | 0},${(v + 2) | 0},${(v + 6) | 0})`;
  gctx.fillRect(0, k * S, S, S / 40 + 1);
}
imgs.forEach((im, i) => {
  gctx.imageSmoothingEnabled = true;
  gctx.imageSmoothingQuality = 'high';
  gctx.drawImage(im, i * cell - cell * 0.02, -S * 0.02, cell * 1.04, S * 1.04);
});
emit(g, 'set-h_shared_group');
console.log('group built');
