#!/usr/bin/env node
/**
 * Set H — put the hands-only plate on the same Steel Daylight stage as the
 * watches, so a watch crop composites onto it without a visible tone band.
 *
 * The backdrop (linen / paper) is low-saturation and bright; skin is saturated.
 * Only the low-saturation pixels are swapped for the stage colour, then the
 * former boundary is softened by one pass so no halo survives.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';

const SRC = 'miqa/products/2026-11-08_set-h/plates/web/wrist_hand.png';
const OUT = 'miqa/products/2026-11-08_set-h/plates-stage/wrist_hand_stage.png';

const TOP = [0xfa, 0xf8, 0xf4], MID = [0xf0, 0xec, 0xe4], BOT = [0xdf, 0xd9, 0xd0];
const W = 1024;

const img = await loadImage(SRC);
const H = Math.round(W * (img.height / img.width));
const c = createCanvas(W, H);
const ctx = c.getContext('2d');
ctx.drawImage(img, 0, 0, W, H);
const d = ctx.getImageData(0, 0, W, H);
const px = d.data;

const stage = (x, y) => {
  const t = y / (H - 1);
  let cc;
  if (t < 0.5) { const k = t / 0.5; cc = TOP.map((v, i) => v + (MID[i] - v) * k); }
  else { const k = (t - 0.5) / 0.5; cc = MID.map((v, i) => v + (BOT[i] - v) * k); }
  const dx = (x - W / 2) / (W / 2);
  const dy = (y - H * 0.46) / (W / 2);
  const g = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
  const lift = 7 * g * g;
  return cc.map((v) => Math.min(255, v + lift));
};

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    const isBackdrop = (sat < 0.16 && mx > 140) || mx > 246;
    if (isBackdrop) {
      const t = stage(x, y);
      px[i] = t[0]; px[i + 1] = t[1]; px[i + 2] = t[2];
    }
  }
}

// 1px soften so the swap boundary does not show as a hard contour
const copy = new Uint8ClampedArray(px);
const at = (x, y, o) => copy[(y * W + x) * 4 + o];
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    const i = (y * W + x) * 4;
    for (let o = 0; o < 3; o++) {
      px[i + o] = Math.round((
        copy[i + o] +
        at(x + 1, y, o) + at(x - 1, y, o) + at(x, y + 1, o) + at(x, y - 1, o)
      ) / 5);
    }
  }
}

ctx.putImageData(d, 0, 0);
fs.writeFileSync(OUT, c.toBuffer('image/png'));
console.log(`stage-matched hand plate ${W}x${H}`);
