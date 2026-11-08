#!/usr/bin/env node
/**
 * Set H — website shot pack from the stage-corrected plates.
 *
 *   _1_main     full watch on the locked Steel Daylight stage
 *   _2_angle    3/4 crop (case thickness + crown)
 *   _3_dial     dial macro
 *   _4_bracelet bracelet macro
 *
 * Watch pixels are never retouched (D38/D51): crop + Lanczos upscale only.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'miqa/products/2026-11-08_set-h/plates-stage';
const OUT = 'miqa/deliveries/2026-11-08_set-h/website';
const THUMBS = path.join(OUT, 'thumbs');
const S = 1600;
const T = 600;

fs.mkdirSync(THUMBS, { recursive: true });

async function shot(slug, suffix, img, crop) {
  const [cx, cy, w, h] = crop;
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h, 0, 0, S, S);
  fs.writeFileSync(path.join(OUT, `${slug}_${suffix}.jpg`), c.toBuffer('image/jpeg', 92));
  const tc = createCanvas(T, T);
  tc.getContext('2d').drawImage(c, 0, 0, T, T);
  fs.writeFileSync(path.join(THUMBS, `${slug}_${suffix}_600.jpg`), tc.toBuffer('image/jpeg', 82));
}

for (const [slug, cfg] of Object.entries(JSON.parse(process.argv[2] || '{}'))) {
  const img = await loadImage(path.join(SRC, cfg.plate));
  for (const [suffix, crop] of Object.entries(cfg.shots)) await shot(slug, suffix, img, crop);
  console.log(`${slug}: ${Object.keys(cfg.shots).join(', ')}`);
}
