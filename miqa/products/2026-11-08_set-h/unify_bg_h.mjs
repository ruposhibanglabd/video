#!/usr/bin/env node
/**
 * Set H — unify plate backgrounds onto the locked Steel Daylight stage.
 *
 * Generated plates come back on slightly different stages (olive-grey, ivory,
 * pinkish). This fits a degree-2 background model per plate (it captures the
 * studio vignette), then flat-field corrects: subtract the plate's own backdrop
 * and add the locked gradient. Watch, shadow and reflection stay untouched;
 * near-white residual is pulled to the exact stage colour so the pack matches.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'miqa/products/2026-11-08_set-h/plates';
const OUT = 'miqa/products/2026-11-08_set-h/plates-stage';
const S = 1024;

const TOP = [0xfa, 0xf8, 0xf4];
const MID = [0xf0, 0xec, 0xe4];
const BOT = [0xdf, 0xd9, 0xd0];

function target(x, y) {
  const t = y / (S - 1);
  let c;
  if (t < 0.5) {
    const k = t / 0.5;
    c = TOP.map((v, i) => v + (MID[i] - v) * k);
  } else {
    const k = (t - 0.5) / 0.5;
    c = MID.map((v, i) => v + (BOT[i] - v) * k);
  }
  const dx = (x - S * 0.5) / (S * 0.5);
  const dy = (y - S * 0.46) / (S * 0.5);
  const g = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
  return c.map((v) => Math.min(255, v + 7.0 * g * g));
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function solve(A, B, k) {
  const M = A.map((r, i) => [...r, B[i]]);
  for (let i = 0; i < k; i++) {
    let p = i;
    for (let r = i + 1; r < k; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    if (Math.abs(M[i][i]) < 1e-12) continue;
    for (let r = 0; r < k; r++) {
      if (r === i) continue;
      const f = M[r][i] / M[i][i];
      for (let c = i; c <= k; c++) M[r][c] -= f * M[i][c];
    }
  }
  return Array.from({ length: k }, (_, i) => (Math.abs(M[i][i]) < 1e-12 ? 0 : M[i][k] / M[i][i]));
}

fs.mkdirSync(OUT, { recursive: true });

for (const name of process.argv.slice(2)) {
  const img = await loadImage(path.join(SRC, name));
  const src = createCanvas(S, S);
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0, S, S);
  const d = sctx.getImageData(0, 0, S, S);
  const px = d.data;

  // backdrop samples: top 10% and bottom 8% of every column (never the watch)
  const samples = [];
  const lum = (i) => 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
  for (let x = 0; x < S; x += 3) {
    for (let y = 2; y < S * 0.10; y += 2) {
      const i = (y * S + x) * 4;
      if (lum(i) > 160) samples.push({ x: x / S, y: y / S, v: [px[i], px[i + 1], px[i + 2]] });
    }
    for (let y = Math.floor(S * 0.99); y > S * 0.92; y -= 2) {
      const i = (y * S + x) * 4;
      if (lum(i) > 120) samples.push({ x: x / S, y: y / S, v: [px[i], px[i + 1], px[i + 2]] });
    }
  }

  const K = 6;
  const F = (x, y) => [1, x, y, x * x, x * y, y * y];
  const N = Array.from({ length: K }, () => new Array(K).fill(0));
  const R = Array.from({ length: 3 }, () => new Array(K).fill(0));
  for (const s of samples) {
    const f = F(s.x, s.y);
    for (let a = 0; a < K; a++) {
      for (let b = 0; b < K; b++) N[a][b] += f[a] * f[b];
      for (let c = 0; c < 3; c++) R[c][a] += f[a] * s.v[c];
    }
  }
  const coef = [0, 1, 2].map((c) => solve(N, R[c], K));
  const fit = (x, y) => {
    const f = F(x / S, y / S);
    return coef.map((cf) => cf.reduce((a, v, i) => a + v * f[i], 0));
  };

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const f = fit(x, y);
      const t = target(x, y);
      const corr = [px[i] - f[0] + t[0], px[i + 1] - f[1] + t[1], px[i + 2] - f[2] + t[2]];
      // only the bright backdrop is pulled all the way to the exact stage colour
      const w = smoothstep(180, 225, lum(i));
      for (let c = 0; c < 3; c++) {
        const v = Math.round(corr[c] * (1 - w) + t[c] * w);
        px[i + c] = Math.max(0, Math.min(255, v));
      }
    }
  }

  sctx.putImageData(d, 0, 0);
  fs.writeFileSync(path.join(OUT, name), src.toBuffer('image/png'));
  console.log(`${name}: stage-corrected`);
}
