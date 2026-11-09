#!/usr/bin/env node
/**
 * Set H — website pack v5.
 *
 * v5 rules (client, 8 Nov):
 *   - images re-shot: v4 plate look (correct metals) on the COOL STEEL-WHITE
 *     stage, never the warm beige stage the old pack used
 *   - every shot 1600², watch fills the frame
 *
 * Pipeline per source PNG (any aspect):
 *   1. scale so the watch fills the 1600 width, centre-crop height to 1600
 *   2. fit a degree-2 model of that image's own backdrop, flat-field correct it
 *      onto the locked cool stage -> all colours match pixel for pixel
 *   3. unsharp, write JPEG q92 + 600² thumb
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'miqa/products/2026-11-08_set-h/plates-web3';
const OUT = 'miqa/deliveries/2026-11-08_set-h-v7/website';
const THUMBS = path.join(OUT, 'thumbs');
const S = 1600;
const THUMB = 600;

// cool steel-white stage (matches the card palette cool1/cool2/cool3)
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

const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

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

async function build(name, outName, opts = {}) {
  const img = await loadImage(path.join(SRC, name));

  // ---- pass A: work at natural size, fit this plate's own backdrop, find the watch
  const pw0 = img.width;
  const ph0 = img.height;
  const c0 = createCanvas(pw0, ph0);
  const x0 = c0.getContext('2d');
  x0.drawImage(img, 0, 0);
  const d0 = x0.getImageData(0, 0, pw0, ph0);
  const p0 = d0.data;
  const lum0 = (i) => 0.299 * p0[i] + 0.587 * p0[i + 1] + 0.114 * p0[i + 2];

  const samples = [];
  const mx = Math.max(4, Math.round(pw0 * 0.045));
  const my = Math.max(4, Math.round(ph0 * 0.045));
  for (let y = 0; y < ph0; y += 2) {
    for (let x = 0; x < mx; x += 2) {
      for (const xx of [x, pw0 - 1 - x]) {
        const i = (y * pw0 + xx) * 4;
        if (lum0(i) > 140) samples.push({ x: xx / pw0, y: y / ph0, v: [p0[i], p0[i + 1], p0[i + 2]] });
      }
    }
  }
  for (let x = 0; x < pw0; x += 2) {
    for (let y = 0; y < my; y += 2) {
      for (const yy of [y, ph0 - 1 - y]) {
        const i = (yy * pw0 + x) * 4;
        if (lum0(i) > 140) samples.push({ x: x / pw0, y: yy / ph0, v: [p0[i], p0[i + 1], p0[i + 2]] });
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
    const f = F(x / pw0, y / ph0);
    return coef.map((cf) => cf.reduce((a, v, i) => a + v * f[i], 0));
  };

  // watch = anything that departs from that backdrop, plus its own cast shadow
  let bx0 = pw0, by0 = ph0, bx1 = 0, by1 = 0;
  const diff = new Float32Array(pw0 * ph0);
  for (let y = 0; y < ph0; y++) {
    for (let x = 0; x < pw0; x++) {
      const i = (y * pw0 + x) * 4;
      const f = fitAt(x, y);
      const dv = Math.max(
        Math.abs(p0[i] - f[0]),
        Math.abs(p0[i + 1] - f[1]),
        Math.abs(p0[i + 2] - f[2]),
      );
      diff[y * pw0 + x] = dv;
      if (dv > 30) {
        if (x < bx0) bx0 = x;
        if (x > bx1) bx1 = x;
        if (y < by0) by0 = y;
        if (y > by1) by1 = y;
      }
    }
  }
  if (bx1 <= bx0 || by1 <= by0 || opts.nocrop) { bx0 = 0; by0 = 0; bx1 = pw0 - 1; by1 = ph0 - 1; }
  // +3% margin so the blur of the bracelet edge is never cut
  const mgx = Math.round((bx1 - bx0) * 0.03);
  const mgy = Math.round((by1 - by0) * 0.03);
  bx0 = Math.max(0, bx0 - mgx); by0 = Math.max(0, by0 - mgy);
  bx1 = Math.min(pw0 - 1, bx1 + mgx); by1 = Math.min(ph0 - 1, by1 + mgy);
  const bw = bx1 - bx0 + 1;
  const bh = by1 - by0 + 1;

  // ---- pass B: scale the crop so the whole watch fills ~92% of the square
  const sc = Math.min((S * 0.92) / bh, (S * 0.92) / bw);
  const pw = Math.round(bw * sc);
  const ph = Math.round(bh * sc);

  const pc = createCanvas(pw, ph);
  const pctx = pc.getContext('2d');
  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = 'high';
  pctx.drawImage(img, bx0, by0, bw, bh, 0, 0, pw, ph);
  const pd = pctx.getImageData(0, 0, pw, ph);
  const pp = pd.data;
  const plum = (i) => 0.299 * pp[i] + 0.587 * pp[i + 1] + 0.114 * pp[i + 2];

  const ox = Math.round((S - pw) / 2);
  const oy = Math.round((S - ph) / 2);

  // multiplicative flat-field: this plate's backdrop -> the locked stage at the
  // very same canvas position, so the patch edge cannot show a tone step.
  // The contact shadow only gets a gentler gain, so the watch stays grounded.
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const i = (y * pw + x) * 4;
      const f = fitAt(bx0 + x / sc, by0 + y / sc);
      const t = target(x + ox, y + oy);
      const w = 0.30 + 0.70 * smoothstep(120, 195, plum(i));
      for (let ci = 0; ci < 3; ci++) {
        const g = f[ci] > 12 ? t[ci] / f[ci] : 1;
        const corr = pp[i + ci] * (1 + (g - 1) * w);
        pp[i + ci] = Math.max(0, Math.min(255, Math.round(corr)));
      }
    }
  }
  pctx.putImageData(pd, 0, 0);

  // ---- stage
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  const sd = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const t = target(x, y);
      sd.data[i] = t[0];
      sd.data[i + 1] = t[1];
      sd.data[i + 2] = t[2];
      sd.data[i + 3] = 255;
    }
  }
  ctx.putImageData(sd, 0, 0);

  // feather the patch border into the stage: the flat-field is very close but
  // never exact, and an exact border would read as a faint rectangle line
  const fw = Math.round(Math.min(pw, ph) * 0.05);
  const mask = createCanvas(pw, ph);
  const mctx = mask.getContext('2d');
  mctx.drawImage(pc, 0, 0);
  mctx.globalCompositeOperation = 'destination-in';
  const fade = (x0, y0, x1, y1) => {
    const g = mctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    mctx.fillStyle = g;
    mctx.fillRect(0, 0, pw, ph);
  };
  fade(0, 0, fw, 0);
  fade(pw, 0, pw - fw, 0);
  fade(0, 0, 0, fw);
  fade(0, ph, 0, ph - fw);
  ctx.drawImage(mask, ox, oy);

  // ---- grade + write
  const sharp = createCanvas(S, S);
  const sctx = sharp.getContext('2d');
  sctx.filter = 'contrast(1.02) saturate(1.03)';
  sctx.drawImage(c, 0, 0);

  const buf = sharp.toBuffer('image/jpeg', 92);
  fs.writeFileSync(path.join(OUT, `${outName}.jpg`), buf);

  const tc = createCanvas(THUMB, THUMB);
  tc.getContext('2d').drawImage(sharp, 0, 0, THUMB, THUMB);
  fs.writeFileSync(path.join(THUMBS, `${outName}_600.jpg`), tc.toBuffer('image/jpeg', 82));

  console.log(`${outName}.jpg  ${(buf.length / 1024).toFixed(0)} KB  bbox ${bw}x${bh} -> ${pw}x${ph}`);
}

fs.mkdirSync(THUMBS, { recursive: true });

const JOBS = JSON.parse(process.argv[2] || '{}');
for (const [outName, spec] of Object.entries(JOBS)) {
  const src = typeof spec === 'string' ? spec : spec.file;
  const opts = typeof spec === 'string' ? {} : spec;
  await build(src, outName, opts);
}
