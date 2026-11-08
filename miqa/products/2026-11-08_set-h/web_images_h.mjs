#!/usr/bin/env node
/**
 * Set H (men's) — website product images from the Daylight/Steel-Daylight plates.
 *
 * Per plate:  _1_main (full watch) at 1600x1600 q92 + 600x600 thumb.
 * The plate itself is already on the locked Steel Daylight stage, so no
 * background replacement is done (D51: no text, no price, no logo overlay).
 *
 * Render plates are 1024² -> 2x Lanczos upscale -> unsharp -> 1600².
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'miqa/products/2026-11-08_set-h';
const OUT = 'miqa/deliveries/2026-11-08_set-h/website';
const THUMBS = path.join(OUT, 'thumbs');

// slug -> plate file
const JOBS = JSON.parse(process.argv[2] || '{}');
const SIZE = 1600;
const THUMB = 600;

async function renderOne(slug, plate) {
  const img = await loadImage(path.join(BASE, plate));
  const c = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // square plate -> fill
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const buf = c.toBuffer('image/jpeg', 92);

  const main = path.join(OUT, `${slug}_1_main.jpg`);
  fs.writeFileSync(main, buf);

  // thumb (downscale from the 1600)
  const tc = createCanvas(THUMB, THUMB);
  tc.getContext('2d').drawImage(c, 0, 0, THUMB, THUMB);
  fs.writeFileSync(path.join(THUMBS, `${slug}_1_main_600.jpg`), tc.toBuffer('image/jpeg', 82));

  console.log(`${slug}: ${(buf.length / 1024).toFixed(0)} KB`);
}

fs.mkdirSync(THUMBS, { recursive: true });
for (const [slug, plate] of Object.entries(JOBS)) {
  await renderOne(slug, plate);
}
