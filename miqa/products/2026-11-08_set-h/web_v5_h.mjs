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

const SRC = 'miqa/products/2026-11-08_set-h/plates-web4';
const OUT = 'miqa/deliveries/2026-11-08_set-h-v8/website';
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

  // widest row of the mask = the case, so every colour renders at the same
  // apparent size no matter how wide its bracelet is
  let caseW = 0;
  for (let y = by0; y <= by1; y++) {
    let xa = -1, xb = -1;
    for (let x = bx0; x <= bx1; x++) {
      if (diff[y * pw0 + x] > 30) { if (xa < 0) xa = x; xb = x; }
    }
    if (xa >= 0 && xb - xa > caseW) caseW = xb - xa;
  }

  // ---- pass B: scale so the case is a constant width, whole watch always inside
  const CASE = S * 0.40;
  let sc = caseW > 0 ? CASE / caseW : Math.min((S * 0.92) / bh, (S * 0.92) / bw);
  sc = Math.min(sc, (S * 0.955) / bh, (S * 0.90) / bw);
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

  // ---- watch mask at patch scale: anything that departs from this plate's own
  // backdrop, plus its cast shadow. Feathered so the edge blends into the stage.
  const raw = new Float32Array(pw * ph);
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const i = (y * pw + x) * 4;
      const f = fitAt(bx0 + x / sc, by0 + y / sc);
      const dv = Math.max(
        Math.abs(pp[i] - f[0]),
        Math.abs(pp[i + 1] - f[1]),
        Math.abs(pp[i + 2] - f[2]),
      );
      raw[y * pw + x] = dv > 26 ? 1 : 0;
    }
  }
  // two box passes = soft feather; keeps the bracelet edge from looking cut out
  const rad = Math.max(6, Math.round(Math.min(pw, ph) * 0.012));
  const blurPass = (src) => {
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
  };
  const alpha = blurPass(blurPass(raw));

  // ---- stage, then composite: backdrop is replaced outright (so no residue of
  // the plate's own backdrop can survive), the watch keeps its own pixels
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  const sd = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const t = target(x, y);
      const px_ = x - ox;
      const py_ = y - oy;
      let a = 0;
      if (px_ >= 0 && px_ < pw && py_ >= 0 && py_ < ph) a = Math.min(1, alpha[py_ * pw + px_]);
      // slight flat-field gain on the watch so its cast shadow matches the stage
      let cr = 0, cg = 0, cb = 0;
      if (a > 0) {
        const f = fitAt(bx0 + px_ / sc, by0 + py_ / sc);
        const w = 0.30 + 0.70 * smoothstep(120, 195, 0.299 * pp[(py_ * pw + px_) * 4] + 0.587 * pp[(py_ * pw + px_) * 4 + 1] + 0.114 * pp[(py_ * pw + px_) * 4 + 2]);
        const gi = [0, 1, 2].map((k) => (f[k] > 12 ? t[k] / f[k] : 1));
        const idx = (py_ * pw + px_) * 4;
        cr = pp[idx] * (1 + (gi[0] - 1) * w);
        cg = pp[idx + 1] * (1 + (gi[1] - 1) * w);
        cb = pp[idx + 2] * (1 + (gi[2] - 1) * w);
      }
      sd.data[i] = Math.max(0, Math.min(255, Math.round(t[0] * (1 - a) + (a > 0 ? cr : t[0]) * a)));
      sd.data[i + 1] = Math.max(0, Math.min(255, Math.round(t[1] * (1 - a) + (a > 0 ? cg : t[1]) * a)));
      sd.data[i + 2] = Math.max(0, Math.min(255, Math.round(t[2] * (1 - a) + (a > 0 ? cb : t[2]) * a)));
      sd.data[i + 3] = 255;
    }
  }
  ctx.putImageData(sd, 0, 0);

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
