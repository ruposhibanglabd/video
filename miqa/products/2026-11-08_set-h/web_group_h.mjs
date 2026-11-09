#!/usr/bin/env node
/**
 * Set H v8 — shared group line-up.
 *
 * Composites the seven corrected watch plates onto the one locked cool
 * steel-white stage, 4 over 3, each watch masked out of its own backdrop and
 * scaled to a common height so the line-up reads evenly.
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

const TOP = [0xf7, 0xf9, 0xfb];
const MID = [0xe9, 0xed, 0xf1];
const BOT = [0xd3, 0xdb, 0xe2];

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
  const dy = (y - S * 0.47) / (S * 0.5);
  const g = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
  return c.map((v) => Math.min(255, v + 6.0 * g * g));
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

function blurPass(src, pw, ph, rad) {
  const tmp = new Float32Array(pw * ph);
  const out = new Float32Array(pw * ph);
  for (let y = 0; y < ph; y++) {
    let acc = 0;
    for (let x = -rad; x <= rad; x++) acc += src[y * pw + Math.min(pw - 1, Math.max(0, x))];
    for (let x = 0; x < pw; x++) {
      tmp[y * pw + x] = acc / (2 * rad + 1);
      acc += src[y * pw + Math.min(pw - 1, x + rad + 1)] - src[y * pw + Math.max(0, x - rad)];
    }
  }
  for (let x = 0; x < pw; x++) {
    let acc = 0;
    for (let y = -rad; y <= rad; y++) acc += tmp[Math.min(ph - 1, Math.max(0, y)) * pw + x];
    for (let y = 0; y < ph; y++) {
      out[y * pw + x] = acc / (2 * rad + 1);
      acc += tmp[Math.min(ph - 1, y + rad + 1) * pw + x] - tmp[Math.max(0, y - rad) * pw + x];
    }
  }
  return out;
}

async function prep(file) {
  const img = await loadImage(path.join(SRC, file));
  const pw = img.width;
  const ph = img.height;
  const c = createCanvas(pw, ph);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, pw, ph).data;
  const L = (i) => 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];

  const samples = [];
  const mx = Math.max(4, Math.round(pw * 0.045));
  const my = Math.max(4, Math.round(ph * 0.045));
  for (let y = 0; y < ph; y += 2) {
    for (let x = 0; x < mx; x += 2) {
      for (const xx of [x, pw - 1 - x]) {
        const i = (y * pw + xx) * 4;
        if (L(i) > 140) samples.push({ x: xx / pw, y: y / ph, v: [px[i], px[i + 1], px[i + 2]] });
      }
    }
  }
  for (let x = 0; x < pw; x += 2) {
    for (let y = 0; y < my; y += 2) {
      for (const yy of [y, ph - 1 - y]) {
        const i = (yy * pw + x) * 4;
        if (L(i) > 140) samples.push({ x: x / pw, y: yy / ph, v: [px[i], px[i + 1], px[i + 2]] });
      }
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
      for (let ci = 0; ci < 3; ci++) R[ci][a] += f[a] * s.v[ci];
    }
  }
  const coef = [0, 1, 2].map((ci) => solve(N, R[ci], K));
  const fitAt = (x, y) => {
    const f = F(x / pw, y / ph);
    return coef.map((cf) => cf.reduce((a, v, i) => a + v * f[i], 0));
  };

  const raw = new Float32Array(pw * ph);
  let bx0 = pw, by0 = ph, bx1 = 0, by1 = 0;
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const i = (y * pw + x) * 4;
      const f = fitAt(x, y);
      const dv = Math.max(
        Math.abs(px[i] - f[0]),
        Math.abs(px[i + 1] - f[1]),
        Math.abs(px[i + 2] - f[2]),
      );
      raw[y * pw + x] = dv > 26 ? 1 : 0;
      if (dv > 30) {
        if (x < bx0) bx0 = x;
        if (x > bx1) bx1 = x;
        if (y < by0) by0 = y;
        if (y > by1) by1 = y;
      }
    }
  }
  const rad = Math.max(4, Math.round(Math.min(pw, ph) * 0.004));
  const alpha = blurPass(blurPass(raw, pw, ph, rad), pw, ph, rad);
  return { px, pw, ph, fitAt, alpha, bx0, by0, bx1, by1 };
}

const FILES = [
  'w01_green.png',
  'w02_champagne.png',
  'w03_black.png',
  'w04_silver.png',
  'w05_blue.png',
  'w06_red.png',
  'w07_blacksteel.png',
];

const plates = [];
for (const f of FILES) plates.push(await prep(f));

const canvas = createCanvas(S, S);
const ctx = canvas.getContext('2d');
const img = ctx.createImageData(S, S);
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    const t = target(x, y);
    img.data[i] = t[0];
    img.data[i + 1] = t[1];
    img.data[i + 2] = t[2];
    img.data[i + 3] = 255;
  }
}

const ROWS = [
  { count: 4, top: 40, h: 700 },
  { count: 3, top: 800, h: 700 },
];
let idx = 0;
for (const row of ROWS) {
  const cw = S / row.count;
  for (let j = 0; j < row.count; j++) {
    const p = plates[idx++];
    if (!p) break;
    const bw = p.bx1 - p.bx0 + 1;
    const bh = p.by1 - p.by0 + 1;
    let sc = Math.min(row.h / bh, row.h / p.ph);
    if (bw * sc > cw * 0.94) sc = (cw * 0.94) / bw;
    const dw = bw * sc;
    const dh = bh * sc;
    const cx = cw * (j + 0.5);
    const ox = Math.round(cx - ((p.bx0 + p.bx1) / 2) * sc);
    const oy = Math.round(row.top + (row.h - p.ph * sc) / 2);
    const x0 = Math.max(0, ox);
    const y0 = Math.max(0, oy);
    const x1 = Math.min(S, Math.round(ox + p.pw * sc));
    const y1 = Math.min(S, Math.round(oy + p.ph * sc));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const sx = (x - ox) / sc;
        const sy = (y - oy) / sc;
        const ix = Math.min(p.pw - 1, Math.max(0, Math.round(sx)));
        const iy = Math.min(p.ph - 1, Math.max(0, Math.round(sy)));
        const a = Math.min(1, p.alpha[iy * p.pw + ix]);
        if (a <= 0) continue;
        const si = (iy * p.pw + ix) * 4;
        const di = (y * S + x) * 4;
        for (let k = 0; k < 3; k++) {
          img.data[di + k] = Math.round(img.data[di + k] * (1 - a) + p.px[si + k] * a);
        }
      }
    }
    console.log(`${FILES[idx - 1]} placed at ${x0},${y0} ${Math.round(dw)}x${dh}`);
  }
}
ctx.putImageData(img, 0, 0);

const buf = canvas.toBuffer('image/jpeg', 92);
fs.writeFileSync(path.join(OUT, 'set-h_shared_group.jpg'), buf);
const tc = createCanvas(T, T);
tc.getContext('2d').drawImage(canvas, 0, 0, T, T);
fs.writeFileSync(path.join(THUMBS, 'set-h_shared_group_600.jpg'), tc.toBuffer('image/jpeg', 82));
console.log(`group ${(buf.length / 1024).toFixed(0)} KB`);
