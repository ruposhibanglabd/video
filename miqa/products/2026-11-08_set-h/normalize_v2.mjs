#!/usr/bin/env node
/**
 * Set H v2 — normalise the freshly rendered plates.
 *
 * The renders came back a touch blue-grey and slightly dark in the backdrop
 * (R−B −9 at the corners). The reference photos sit on a near-white neutral
 * sweep, so every plate is lifted to one shared white point and the residual
 * blue cast is removed — while the watch's own steel and gold keep their own
 * colour, because the correction is a smooth function of luminance only in the
 * backdrop band and identity over the product.
 *
 *   node normalize_v2.mjs patch.png ...
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'miqa/products/2026-11-08_set-h/plates-v2';
const OUT = 'miqa/products/2026-11-08_set-h/plates-v3';
const S = 1024;

GlobalFonts.registerFromPath('miqa/brand/fonts/AnekBangla-SemiBold.ttf', 'AnekSB');
GlobalFonts.registerFromPath('miqa/brand/fonts/AnekBangla-ExtraBold.ttf', 'AnekXB');
GlobalFonts.registerFromPath('miqa/brand/fonts/HindSiliguri-Medium.ttf', 'HindMed');

const BG_TARGET = [252, 252, 251];      // neutral near-white, R−B +1
const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

fs.mkdirSync(OUT, { recursive: true });

for (const name of process.argv.slice(2)) {
  const img = await loadImage(path.join(SRC, name));
  const c = createCanvas(S, S);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, S, S);
  const d = g.getImageData(0, 0, S, S);
  const px = d.data;

  // sample the backdrop: the four corners and the top/bottom margins
  const samp = [];
  const lum = (i) => 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
  const push = (x, y) => {
    const i = (y * S + x) * 4;
    if (lum(i) > 175) samp.push([px[i], px[i + 1], px[i + 2]]);
  };
  for (let k = 0; k < 12; k++) {
    const off = 8 + k * 4;
    push(off, off); push(S - 1 - off, off); push(off, S - 1 - off); push(S - 1 - off, S - 1 - off);
    push(Math.floor(S / 2), off); push(Math.floor(S / 2), S - 1 - off);
  }
  const avg = [0, 1, 2].map((ch) => samp.reduce((a, s) => a + s[ch], 0) / samp.length);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const L = lum(i);
      // only the backdrop is normalised; the product keeps its own colour
      const w = smoothstep(150, 215, L);
      if (w <= 0) continue;
      for (let ch = 0; ch < 3; ch++) {
        const shifted = px[i + ch] + (BG_TARGET[ch] - avg[ch]);
        px[i + ch] = Math.round(Math.max(0, Math.min(255, px[i + ch] * (1 - w) + shifted * w)));
      }
    }
  }

  g.putImageData(d, 0, 0);
  fs.writeFileSync(path.join(OUT, name), c.toBuffer('image/png'));
  console.log(`${name}: bg ${avg.map((v) => v.toFixed(0)).join(',')} → ${BG_TARGET.join(',')}`);
}
