/**
 * Set H — MONTVARE launch film (1080×1920, 30 fps, ≈56 s) with Bengali VO.
 *
 * Client brief that drives this film:
 *   • Steel Daylight is the body language of the set, so every body card sits on
 *     the light stage; only the 5 % card and the CTA use the darker title plate
 *     (MIQA-MEN-THEME §5).
 *   • One identity all the way: "মিকা নিয়ে এলো ছেলেদের স্পেশাল ঘড়ির কালেকশন".
 *   • Approved claims only: rolex lock · water resistant · 1-year warranty ·
 *     7-day replacement · colour guarantee.  Price ৳899.
 *   • 10 cards, each with its own layout, so the film never looks like ten
 *     copies of one card.
 *
 *   node miqa/products/2026-11-08_set-h-video/cards_h.mjs
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-Bold.ttf`, 'AnekB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindMed');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Montserrat-Regular.ttf`, 'MontR');

const IMG = 'miqa/deliveries/2026-11-08_set-h/website';
const GRP = 'miqa/deliveries/2026-11-08_set-h/set-h_shared_group.jpg';
const VO = 'miqa/products/2026-11-08_set-h-video/audio/vo';
const BASE = 'miqa/products/2026-11-08_set-h-video';
const OUTD = 'miqa/deliveries/2026-11-08_set-h-video';
const OUT = `${OUTD}/miqa-set-h-montvare_1080x1920.mp4`;
const FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const FP = 'node_modules/@ffprobe-installer/linux-x64/ffprobe';

const W = 1080, H = 1920, FPS = 30, SLIDE = 0.42;
const PRICE = '৮৯৯';

const C = {
  ink: '#14181D', ink2: '#2C333A', steel: '#8A939B', brass: '#C9A45C',
  stage1: '#FAF8F4', stage2: '#F0ECE4', stage3: '#DFD9D0', obs: '#0B0D10',
  paper: '#FFFDF9',
};
const X = 88, WID = W - X * 2;

const SLUGS = [
  ['set-h-01-green', 'এমারেল্ড'],
  ['set-h-02-champagne', 'শ্যাম্পেন'],
  ['set-h-03-black', 'কালো'],
  ['set-h-04-silver', 'সিলভার'],
  ['set-h-05-blue', 'নীল'],
  ['set-h-06-red', 'চেরি রেড'],
  ['set-h-07-black-steel', 'ব্ল্যাক স্টিল'],
];

/* ─────────────────────────────── helpers */
function linen(ctx, w, h, alpha = 0.13, seed0 = 20261108) {
  const n = createCanvas(w, h), nx = n.getContext('2d');
  const img = nx.createImageData(w, h);
  let seed = seed0;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const v = 128 + Math.sin(x * 1.7) * 3 + Math.sin(y * 2.1) * 3 + (rnd() - 0.5) * 13;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(n, 0, 0); ctx.restore();
}

function lightStage() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.stage1); lg.addColorStop(.55, C.stage2); lg.addColorStop(1, C.stage3);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .5, H * .32, 0, W * .5, H * .32, W * 1.05);
  rg.addColorStop(0, 'rgba(255,255,252,0.92)');
  rg.addColorStop(.6, 'rgba(246,242,235,0.32)');
  rg.addColorStop(1, 'rgba(196,191,182,0.26)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  linen(g, W, H);
  return c;
}

function darkStage() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * .45, H);
  lg.addColorStop(0, '#1A1E24'); lg.addColorStop(.6, C.obs); lg.addColorStop(1, '#06080A');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .5, H * .36, 0, W * .5, H * .36, W * .95);
  rg.addColorStop(0, 'rgba(201,164,92,0.16)');
  rg.addColorStop(.55, 'rgba(138,147,155,0.05)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return c;
}

function cover(target, im, x, y, w, h, src = null, alpha = 1) {
  const [sx, sy, sw, sh] = src || [0, 0, im.width, im.height];
  const k = Math.max(w / sw, h / sh);
  target.save();
  if (alpha < 1) target.globalAlpha = alpha;
  target.imageSmoothingQuality = 'high';
  target.drawImage(im, sx, sy, sw, sh, x + (w - sw * k) / 2, y + (h - sh * k) / 2, sw * k, sh * k);
  target.restore();
}

/** fit the whole source inside the box (no side cropping) */
function contain(target, im, x, y, w, h, src = null) {
  const [sx, sy, sw, sh] = src || [0, 0, im.width, im.height];
  const k = Math.min(w / sw, h / sh);
  target.save();
  target.imageSmoothingQuality = 'high';
  target.drawImage(im, sx, sy, sw, sh, x + (w - sw * k) / 2, y + (h - sh * k) / 2, sw * k, sh * k);
  target.restore();
}

/** round-rect clipped photo chip with drop shadow — the "print plate" motif */
function chip(ctx, im, { x, y, w, h, src, rot = 0, r = 16 }) {
  const c = createCanvas(w, h), g = c.getContext('2d');
  g.beginPath();
  if (g.roundRect) g.roundRect(0, 0, w, h, r); else g.rect(0, 0, w, h);
  g.clip();
  cover(g, im, 0, 0, w, h, src, 1);
  ctx.save();
  ctx.shadowColor = 'rgba(20,24,29,.20)';
  ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.drawImage(c, -w / 2, -h / 2);
  ctx.restore();
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.strokeStyle = 'rgba(255,253,249,.80)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, r); else ctx.rect(-w / 2, -h / 2, w, h);
  ctx.stroke();
  ctx.restore();
}

function wrap(ctx, text, font, maxW) {
  ctx.font = font;
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const t = line + ' ' + words[i];
      if (ctx.measureText(t).width > maxW) { out.push(line); line = words[i]; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

/** Bengali display text on one or two lines, returns the bottom y */
function display(ctx, text, { x = X, y, size = 96, color = C.ink, maxW = WID, lh = 1.16, align = 'left' }) {
  ctx.font = `${size}px AnekXB`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  const lines = wrap(ctx, text, `${size}px AnekXB`, maxW);
  const anchor = align === 'center' ? W / 2 : x;
  lines.forEach((l, i) => ctx.fillText(l, anchor, y + i * size * lh));
  ctx.textAlign = 'left';
  return y + (lines.length - 1) * size * lh;
}

function body(ctx, text, { x = X, y, size = 34, color = '#5C646C', maxW = WID, lh = 1.55 }) {
  ctx.font = `${size}px HindMed`;
  ctx.fillStyle = color;
  const lines = wrap(ctx, text, `${size}px HindMed`, maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lh));
  return y + (lines.length - 1) * size * lh;
}

function spaced(ctx, text, x, y, font, size, color, sp = 6, align = 'left') {
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * (widths.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  [...text].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += widths[i] + sp; });
  return total;
}

function eyebrow(ctx, txt, y, light = false) {
  ctx.fillStyle = C.brass; ctx.fillRect(X, y - 26, 48, 3);
  spaced(ctx, txt, X, y + 18, 'MontSB', 24, light ? 'rgba(255,253,249,.62)' : C.steel, 5);
}

function tick(ctx, x, y, color = C.brass, s = 18) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.15);
  ctx.lineTo(x + s * 0.42, y + s * 0.55);
  ctx.lineTo(x + s * 1.15, y - s * 0.55);
  ctx.stroke();
  ctx.restore();
}

function pricePill(ctx, x, y, { size = 62, dark = false, strong = false } = {}) {
  const label = `৳${PRICE}`;
  ctx.font = `${size}px AnekXB`;
  const w = ctx.measureText(label).width + 66, h = size * 1.66;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.fillRect(x, y, w, h);
  if (strong) { ctx.fillStyle = C.ink; ctx.fill(); ctx.fillStyle = C.brass; }
  else {
    ctx.fillStyle = dark ? 'rgba(201,164,92,.16)' : 'rgba(255,253,249,.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,164,92,.65)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = dark ? C.brass : C.ink;
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 33, y + h / 2 + size * 0.05);
  ctx.textBaseline = 'alphabetic';
  return h;
}

function rule(ctx, y, { x = X, w = WID, color = 'rgba(20,24,29,.12)' } = {}) {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, 1);
}

/* ─────────────────────────────── scenes */

/* 1 · HOOK — dial macro + price anchor */
async function sceneHook() {
  const c = lightStage(), g = c.getContext('2d');
  const dial = await loadImage(`${IMG}/set-h-01-green_3_dial.jpg`);
  chip(g, dial, { x: X, y: 210, w: WID, h: 900, src: [120, 90, 1360, 1360], r: 12 });

  eyebrow(g, 'MIQA · STEEL DAYLIGHT', 1180);
  display(g, 'ছেলেদের স্পেশাল\nঘড়ির কালেকশন', { y: 1300, size: 104, lh: 1.18 });
  body(g, 'সাতটি ফিনিশ · একই দাম', { y: 1560, size: 38 });
  pricePill(g, X, 1640, { size: 84, strong: true });

  spaced(g, '7 FINISHES', W - X, 1160, 'MontSB', 22, C.steel, 5, 'right');
  return c;
}

/* 2 · REVEAL — the row of seven, brand line once */
async function sceneReveal() {
  const c = lightStage(), g = c.getContext('2d');
  const grp = await loadImage(GRP);
  contain(g, grp, 24, 300, W - 48, 420, [150, 430, 2900, 640]);

  eyebrow(g, 'THE COLLECTION', 1030);
  display(g, 'মিকা নিয়ে এলো\nছেলেদের ঘড়ি', { y: 1150, size: 100, lh: 1.18 });
  body(g, 'একই কেস, একই দাম — রং বেছে নিন নিজের মতো।', { y: 1400, size: 36 });

  // the seven names, in order, as a quiet ledger
  const names = SLUGS.map((s2) => s2[1]);
  let nx = X;
  g.font = '26px HindMed'; g.fillStyle = C.steel;
  names.forEach((n, i) => {
    g.fillText(n, nx, 1500);
    nx += g.measureText(n).width + 22;
    if (i < names.length - 1) { g.fillStyle = 'rgba(201,164,92,.8)'; g.fillText('·', nx - 14, 1500); g.fillStyle = C.steel; }
  });
  rule(g, 1550);
  pricePill(g, X, 1600, { size: 72 });
  return c;
}

/* 3 · LOCK — hero feature, circular lens on the clasp macro */
async function sceneLock() {
  const c = lightStage(), g = c.getContext('2d');
  const lock = await loadImage(`${IMG}/set-h_shared_lock.jpg`);

  // circular lens: brass ring + soft shadow, the macro reads as a loupe
  const R = 430, cx = W / 2, cy = 780;
  g.save();
  g.shadowColor = 'rgba(20,24,29,.22)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = C.paper; g.fill();
  g.restore();
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  cover(g, lock, cx - R, cy - R, R * 2, R * 2, [60, 60, 1480, 1480], 1);
  g.restore();
  g.strokeStyle = C.brass; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,253,249,.7)'; g.lineWidth = 10;
  g.beginPath(); g.arc(cx, cy, R + 9, 0, Math.PI * 2); g.stroke();

  eyebrow(g, 'FEATURE 01', 1330);
  display(g, 'রোলেক্স লক', { y: 1440, size: 116 });
  body(g, 'ক্ল্যাশে উঁচু ক্রাউন এমবস, ভেতরে হিডেন —\nবাইরে থেকে লিংকগুলো একটানা দেখায়।', { y: 1520, size: 34 });
  return c;
}

/* 4 · DIAL — split editorial: macro on the right, type on the left */
async function sceneDial() {
  const c = lightStage(), g = c.getContext('2d');
  const dial = await loadImage(`${IMG}/set-h-05-blue_3_dial.jpg`);
  chip(g, dial, { x: 452, y: 300, w: 540, h: 540, src: [215, 175, 1170, 1170], r: 10 });
  const spec = await loadImage(`${IMG}/set-h-02-champagne_3_dial.jpg`);
  chip(g, spec, { x: 452, y: 900, w: 540, h: 540, src: [215, 175, 1170, 1170], r: 10 });

  eyebrow(g, 'FEATURE 02', 330);
  display(g, 'জেম-সেট\nবেজেল', { y: 450, size: 86, maxW: 320, lh: 1.16 });
  body(g, 'এক সারি গোল স্টোন,\nআলো ধরে ঝিলিক দেয়।', { y: 660, size: 28, maxW: 290 });

  display(g, 'ডে-ডেট\nডায়াল', { y: 1060, size: 86, maxW: 320, lh: 1.16 });
  body(g, '১২টায় দিন,\n৩টায় তারিখ।', { y: 1270, size: 28, maxW: 250 });
  return c;
}

/* 5 · WATER — full-bleed wrist shot, caption on a translucent plate */
async function sceneWater() {
  const c = lightStage(), g = c.getContext('2d');
  const wrist = await loadImage(`${IMG}/set-h-01-green_5_wrist.jpg`);
  cover(g, wrist, 0, 0, W, H * 0.72, null, 1);
  const fade = g.createLinearGradient(0, H * 0.52, 0, H * 0.72);
  fade.addColorStop(0, 'rgba(250,248,244,0)');
  fade.addColorStop(1, C.stage2);
  g.fillStyle = fade; g.fillRect(0, H * 0.52, W, H * 0.2);

  eyebrow(g, 'FEATURE 03', 1470);
  display(g, 'ওয়াটার রেজিস্ট্যান্ট', { y: 1580, size: 78, maxW: WID });
  body(g, 'হাত ধোয়া, বৃষ্টি, ঘাম — সব সামলে নেবে।\nপানিতে ডুবাবেন না।', { y: 1690, size: 32 });
  return c;
}

/* 6 · COLOURS A — four finishes on one clean ledger */
async function sceneColoursA() {
  const c = lightStage(), g = c.getContext('2d');
  eyebrow(g, 'COLOURWAYS 01–04', 220);
  display(g, 'চারটি ফিনিশ', { y: 330, size: 92 });

  const picks = [0, 1, 2, 3];
  const gap = 20;
  const cw = (WID - 3 * gap) / 4;
  const chh = 560;
  for (let i = 0; i < picks.length; i++) {
    const [slug, name] = SLUGS[picks[i]];
    const im = await loadImage(`${IMG}/${slug}_1_main.jpg`);
    const br = await loadImage(`${IMG}/${slug}_4_bracelet.jpg`);
    const x = X + i * (cw + gap);
    chip(g, im, { x, y: 470, w: cw, h: chh, src: [235, 165, 1130, 1240], r: 12 });
    chip(g, br, { x, y: 470 + chh + 18, w: cw, h: cw * 0.92, src: [170, 240, 1260, 1160], r: 12 });
    g.font = '28px AnekSB'; g.fillStyle = C.ink; g.textAlign = 'center';
    g.fillText(name, x + cw / 2, 470 + chh + 18 + cw * 0.92 + 54);
    g.textAlign = 'left';
  }
  rule(g, 1270);
  body(g, 'প্রতিটি রঙে একই কেস, একই জেম-বেজেল, একই ডে-ডেট ডায়াল।', { y: 1360, size: 34, maxW: WID });
  pricePill(g, X, 1450, { size: 66 });
  return c;
}

/* 7 · COLOURS B — the remaining three, bigger, triptych */
async function sceneColoursB() {
  const c = lightStage(), g = c.getContext('2d');
  eyebrow(g, 'COLOURWAYS 05–07', 220);
  display(g, 'বাকি তিনটি', { y: 330, size: 92 });

  const picks = [4, 5, 6];
  const cw = (WID - 2 * 26) / 3;
  const mh = 700, bh = 300;
  for (let i = 0; i < picks.length; i++) {
    const [slug, name] = SLUGS[picks[i]];
    const br = await loadImage(`${IMG}/${slug}_4_bracelet.jpg`);
    const main = await loadImage(`${IMG}/${slug}_1_main.jpg`);
    const x = X + i * (cw + 26);
    chip(g, main, { x, y: 450, w: cw, h: mh, src: [225, 150, 1150, 1300], r: 12 });
    chip(g, br, { x, y: 450 + mh + 18, w: cw, h: bh, src: [170, 240, 1260, 1160], r: 12 });
    g.font = '28px AnekSB'; g.fillStyle = C.ink; g.textAlign = 'center';
    g.fillText(name, x + cw / 2, 450 + mh + 18 + bh + 54);
    g.textAlign = 'left';
  }
  rule(g, 1560);
  body(g, 'তিনটি আলাদা মেজাজ — একই দামে।', { y: 1630, size: 32, maxW: WID });
  return c;
}

/* 8 · PROMISE — three claims as a stamped ledger */
async function scenePromise() {
  const c = lightStage(), g = c.getContext('2d');
  eyebrow(g, 'THE PROMISE', 262);
  display(g, 'কেনা নিশ্চিন্তে', { y: 372, size: 90 });

  const rows = [
    ['১ বছরের ওয়ারেন্টি', 'কেনার পরও পাশে আছি'],
    ['৭ দিনের রিপ্লেসমেন্ট', 'সমস্যা হলে ৭ দিনের মধ্যে বদলে দেওয়া'],
    ['কালার গ্যারান্টি', 'রঙ ওঠে না'],
  ];
  let y = 640;
  for (const [title, sub] of rows) {
    chipRect(g, X, y - 60, WID, 210);
    g.font = '46px AnekSB'; g.fillStyle = C.ink;
    g.fillText(title, X + 54, y + 10);
    g.font = '30px HindMed'; g.fillStyle = '#5C646C';
    g.fillText(sub, X + 54, y + 66);
    tick(g, X + WID - 92, y - 6, C.brass, 20);
    y += 250;
  }
  body(g, 'সাথে ওয়াটার রেজিস্ট্যান্স আর রোলেক্স লক — সব একই ঘড়িতে।', { y: 1420, size: 32, maxW: WID });
  return c;
}

function chipRect(ctx, x, y, w, h, { r = 16, fill = 'rgba(255,253,249,.72)', stroke = 'rgba(201,164,92,.35)' } = {}) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

/* 9 · 5% — dark seal, one quiet moment */
async function sceneFive() {
  const c = darkStage(), g = c.getContext('2d');
  const cx = W / 2, cy = 760, R = 300;
  g.strokeStyle = 'rgba(201,164,92,.75)'; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1.4; g.strokeStyle = 'rgba(201,164,92,.42)';
  g.beginPath(); g.arc(cx, cy, R - 22, 0, Math.PI * 2); g.stroke();

  g.textAlign = 'center';
  g.font = '120px AnekXB'; g.fillStyle = C.brass;
  g.fillText('৫%', cx, cy + 30);
  g.font = '26px MontSB'; g.fillStyle = 'rgba(255,253,249,.62)';
  spaced(g, 'FOR THE CHILDREN', cx, cy + 96, 'MontSB', 24, 'rgba(255,253,249,.62)', 7, 'center');
  g.textAlign = 'left';

  display(g, 'MIQA-এর মুনাফার ৫%\nপথশিশুদের কল্যাণে।', {
    y: 1290, size: 76, color: '#FFFDF9', lh: 1.24, align: 'left',
  });
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', X, 1680, 'MontSB', 24, 'rgba(201,164,92,.9)', 6);
  return c;
}

/* 10 · CTA — dark plate, price, COD, chevrons */
async function sceneCTA() {
  const c = darkStage(), g = c.getContext('2d');
  const grp = await loadImage(GRP);
  chip(g, grp, { x: 60, y: 210, w: W - 120, h: 470, src: [70, 330, 3060, 860], r: 10 });

  g.textAlign = 'center';
  spaced(g, 'MIQA · MONTVARE', W / 2, 800, 'MontSB', 26, 'rgba(201,164,92,.95)', 8, 'center');

  display(g, 'আজই অর্ডার করুন', { y: 930, size: 100, color: '#FFFDF9', align: 'left' });

  // price block
  g.font = '150px AnekXB'; g.fillStyle = C.brass;
  const pw = g.measureText(`৳${PRICE}`).width;
  g.textAlign = 'left';
  g.fillText(`৳${PRICE}`, X, 1130);
  g.font = '34px HindMed'; g.fillStyle = 'rgba(255,253,249,.72)';
  g.fillText('সাতটি রঙ · একই দাম', X + pw + 28, 1120);

  // COD pill
  chipRect(g, X, 1200, 420, 96, { fill: 'rgba(201,164,92,.14)', stroke: 'rgba(201,164,92,.6)' });
  g.font = '38px AnekSB'; g.fillStyle = '#FFFDF9';
  g.fillText('ক্যাশ অন ডেলিভারি', X + 34, 1262);

  // the required CTA line, verbatim
  g.font = '36px HindMed'; g.fillStyle = 'rgba(255,253,249,.86)';
  const lines = wrap(g, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন।', '36px HindMed', WID);
  lines.forEach((l, i) => g.fillText(l, X, 1390 + i * 58));

  // CTA button + chevrons
  const bx = X, by = 1540, bw = WID, bh = 132;
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(bx, by, bw, bh, bh / 2); else g.rect(bx, by, bw, bh);
  g.fillStyle = C.brass; g.fill();
  g.restore();
  g.fillStyle = C.obs; g.font = '44px AnekXB'; g.textAlign = 'center';
  g.fillText('এখনই অর্ডার করুন', W / 2, by + 84);

  for (let i = 0; i < 3; i++) {
    const a = 0.85 - i * 0.26;
    g.strokeStyle = `rgba(201,164,92,${a})`; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath();
    const yy = 1730 + i * 34;
    g.moveTo(W / 2 - 26, yy); g.lineTo(W / 2, yy + 24); g.lineTo(W / 2 + 26, yy);
    g.stroke();
  }
  g.textAlign = 'left';
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', X, 1880, 'MontSB', 22, 'rgba(255,253,249,.45)', 5);
  return c;
}

/* ─────────────────────────────── build + render */
const SCENES = [
  sceneHook, sceneReveal, sceneLock, sceneDial, sceneWater,
  sceneColoursA, sceneColoursB, scenePromise, sceneFive, sceneCTA,
];
// VO clip name per scene — null means music only
const VO_FOR = [
  null, '02_reveal', '03_lock', '04_dial', '05_water',
  '06_colours_a', '07_colours_b', '08_promise', '09_five', '10_cta',
];

const probe = (f) => Number(execFileSync(FP, [
  '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f,
]).toString().trim());

const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function writeBed(path, seconds, cuts) {
  const SR = 48000, n = Math.ceil(seconds * SR);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);

  const chords = [
    [174.61, 220.00, 261.63],  // F
    [196.00, 246.94, 293.66],  // G
    [130.81, 164.81, 196.00],  // Am-ish low
    [196.00, 261.63, 329.63],  // C
  ];
  const smp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.min(chords.length - 1, Math.floor(t / 5.4) % chords.length);
    let v = 0;
    for (const f of chords[ci]) {
      v += Math.sin(2 * Math.PI * f * t) * 0.25
        + Math.sin(2 * Math.PI * f * 2 * t) * 0.04
        + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.11;
    }
    const trem = 0.88 + 0.12 * Math.sin(2 * Math.PI * 0.085 * t);
    v *= trem * Math.min(1, t / 1.6) * Math.min(1, (seconds - t) / 2.4) * 0.048;
    smp[i] = v;
  }
  for (const cu of cuts) {
    const start = Math.round(cu * SR), len = Math.round(0.09 * SR);
    let lp = 0;
    for (let j = 0; j < len && start + j < n; j++) {
      const env = Math.exp(-j / (0.02 * SR));
      lp += 0.22 * ((Math.random() * 2 - 1) - lp);
      smp[start + j] += lp * env * 0.06 + Math.sin(2 * Math.PI * 92 * (j / SR)) * env * 0.04;
    }
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(smp[i]));
  const gn = peak > 0 ? 0.62 / peak : 1;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, smp[i] * gn)) * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path, buf);
}

async function main() {
  fs.mkdirSync(OUTD, { recursive: true });
  if (process.env.CARDS_ONLY) {
    fs.mkdirSync(`${BASE}/work/cards`, { recursive: true });
    for (let i = 0; i < SCENES.length; i++) {
      const c = await SCENES[i]();
      fs.writeFileSync(`${BASE}/work/cards/${String(i + 1).padStart(2, '0')}.png`, c.toBuffer('image/png'));
      console.log('card', i + 1);
    }
    return;
  }
  fs.mkdirSync(`${BASE}/work`, { recursive: true });

  // timings: each scene = its VO clip + a breath; the hook gets a longer beat
  const durs = VO_FOR.map((n, i) => {
    const d = n ? probe(`${VO}/${n}.mp3`) : 0;
    if (i === 0) return Math.max(3.6, d + 2.6);
    if (i === SCENES.length - 1) return d + 2.2;
    return d + 0.9;
  });
  const starts = [];
  let t = 0;
  durs.forEach((d) => { starts.push(t); t += d; });
  const total = t;
  console.log('scenes', durs.map((d) => d.toFixed(2)).join(' / '), '≈', total.toFixed(2) + 's');

  const cards = [];
  for (const fn of SCENES) cards.push(await fn());

  const wav = `${BASE}/work/bed.wav`;
  writeBed(wav, total, starts.slice(1));

  /* ---------- pass 1: video only (raw frames in, h264 out) ---------- */
  const tmpVideo = `${BASE}/work/video-only.mp4`;
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0',
    '-frames:v', String(Math.round(total * FPS)),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.1', '-g', String(FPS * 2),
    '-r', String(FPS), '-movflags', '+faststart', tmpVideo,
  ];
  const ff = spawn(FF, args, { stdio: ['pipe', 'inherit', 'pipe'] });
  ff.stderr.on('data', (d) => process.stdout.write('FF: ' + d));
  ff.stdin.on('error', (e) => console.log('STDIN', e.message));
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));

  const frame = createCanvas(W, H), fg = frame.getContext('2d');
  const frames = Math.round(total * FPS);
  const push = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });

  for (let f = 0; f < frames; f++) {
    const at = f / FPS;
    let i = 0;
    while (i + 1 < SCENES.length && at >= starts[i + 1]) i++;
    const local = at - starts[i];
    const prev = i > 0 && local < SLIDE ? i - 1 : -1;

    fg.fillStyle = C.obs; fg.fillRect(0, 0, W, H);
    const scale = 1 + 0.02 * Math.min(1, local / durs[i]);
    const draw = (k, dx) => {
      fg.save();
      fg.translate(W / 2 + dx, H / 2);
      fg.scale(scale, scale);
      fg.drawImage(cards[k], -W / 2, -H / 2);
      fg.restore();
    };
    if (prev >= 0) {
      const p = easeOut(local / SLIDE);
      draw(prev, -W * p);
      draw(i, W * (1 - p));
    } else draw(i, 0);

    await push(frame.data());
    if (f % 300 === 0) console.log(`  ${f}/${frames} ${at.toFixed(1)}s ${(process.memoryUsage().rss / 1048576).toFixed(0)}MB`);
  }
  ff.stdin.end();
  await done;

  /* ---------- pass 2: voice + bed, then mux ---------- */
  const used = VO_FOR.filter(Boolean);
  const aInputs = ['-i', wav];
  used.forEach((n) => aInputs.push('-i', `${VO}/${n}.mp3`));

  const filters = ['[0:a]volume=1.0[bed]'];
  const amixIn = ['[bed]'];
  let idx = 1;
  VO_FOR.forEach((n, i) => {
    if (!n) return;
    const ms = Math.round((starts[i] + 0.35) * 1000);
    filters.push(`[${idx}:a]adelay=${ms}|${ms},volume=1.0[v${i}]`);
    amixIn.push(`[v${i}]`);
    idx += 1;
  });
  filters.push(
    `${amixIn.join('')}amix=inputs=${amixIn.length}:duration=longest,` +
    `volume=${amixIn.length},alimiter=limit=0.94,aresample=48000[aout]`
  );
  const tmpAudio = `${BASE}/work/mix.m4a`;
  execFileSync(FF, [
    '-y', '-hide_banner', '-loglevel', 'error', ...aInputs,
    '-filter_complex', filters.join(';'), '-map', '[aout]',
    '-t', total.toFixed(3), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', tmpAudio,
  ], { stdio: 'inherit' });

  execFileSync(FF, [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', tmpVideo, '-i', tmpAudio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy',
    '-shortest', '-movflags', '+faststart', OUT,
  ], { stdio: 'inherit' });

  console.log('OUT', OUT, (fs.statSync(OUT).size / 1048576).toFixed(1) + 'MB', total.toFixed(2) + 's');
}

main().catch((e) => { console.error('MAIN', e); process.exit(1); });
