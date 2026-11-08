/**
 * Set G — "Steel Night" launch film v2 (1080×1920, 30 fps, ≈45 s) — with VO.
 *
 * Client notes that drive this version:
 *   • no product names anywhere — one collection, "মিকা নিয়ে এলো ছেলেদের
 *     স্পেশাল ঘড়ির কালেকশন";
 *   • every scene gets its own theme/design (cascade gallery, blueprint,
 *     macro, split editorial, seal, ledger, poster) inside one Steel Daylight
 *     system, so the film never feels like eight copies of one layout;
 *   • Bengali voiceover (voice-02), mixed under a quiet music bed.
 *
 * Motion: hard-edge right→left slide (0.42 s), 2 % push-in inside a card.
 * Claims: butterfly lock · water resistant · quality good · ৳850 · 1-year
 * warranty · colour guarantee · 7-day replacement · cash on delivery.
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import { spawn, execFileSync } from 'child_process';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-Bold.ttf`, 'AnekB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');

const IMG = 'miqa/deliveries/2026-11-09_set-g-video/website';
const VO = 'miqa/products/2026-11-09_set-g-video/audio/vo2';
const BASE = 'miqa/products/2026-11-09_set-g-video';
const OUT = 'miqa/deliveries/2026-11-09_set-g-video/miqa-set-g-steel-night_1080x1920.mp4';
const FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const FP = 'node_modules/@ffprobe-installer/linux-x64/ffprobe';
const W = 1080, H = 1920, FPS = 30, SLIDE = 0.42, TEMPO = 1.06;

const C = {
  ink: '#14181D', ink2: '#2C333A', steel: '#8A939B', brass: '#C9A45C',
  stage1: '#FAF8F4', stage2: '#F0ECE4', stage3: '#DFD9D0', obs: '#0B0D10',
  paper: '#FFFDF9',
};
const X = 88, WID = W - X * 2;

/* ─────────────────────────────────────────── helpers */
function linen(ctx, w, h, alpha = 0.14, seed0 = 20261109) {
  const n = createCanvas(w, h), nx = n.getContext('2d');
  const img = nx.createImageData(w, h);
  let seed = seed0;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const v = 128 + Math.sin(x * 1.9) * 3 + Math.sin(y * 1.9) * 3 + (rnd() - 0.5) * 14;
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
  const rg = g.createRadialGradient(W * .5, H * .34, 0, W * .5, H * .34, W * 1.05);
  rg.addColorStop(0, 'rgba(255,255,252,0.9)');
  rg.addColorStop(.6, 'rgba(246,242,235,0.35)');
  rg.addColorStop(1, 'rgba(196,191,182,0.30)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  linen(g, W, H);
  return c;
}

function darkStage() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * .45, H);
  lg.addColorStop(0, '#171B21'); lg.addColorStop(.6, C.obs); lg.addColorStop(1, '#06080A');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .5, H * .38, 0, W * .5, H * .38, W * .92);
  rg.addColorStop(0, 'rgba(201,164,92,0.15)');
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

const rgba0 = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
};

/** photo band with a soft bottom edge so it melts into the card colour */
function fadeEdge(ctx, im, { h, to, y = 0, src = null, fade = 0.28, x = 0, w = W, side = null }) {
  cover(ctx, im, x, y, w, h, src, 1);
  const g = ctx.createLinearGradient(0, y + h * (1 - fade), 0, y + h);
  g.addColorStop(0, rgba0(to)); g.addColorStop(1, to);
  ctx.fillStyle = g; ctx.fillRect(x, y + h * (1 - fade) - 1, w, h * fade + 2);
  if (side) {
    const s = ctx.createLinearGradient(x, 0, x + w * side, 0);
    s.addColorStop(0, to); s.addColorStop(1, rgba0(to));
    ctx.fillStyle = s; ctx.fillRect(x, y, w * side, h);
  }
}

function glaze(ctx, { h, y = 0, a = 0.16 }) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(252,250,245,${a * 0.7})`);
  g.addColorStop(1, `rgba(240,236,228,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, y, W, h);
}

/** round-rect clipped image chip with a soft drop shadow (gallery scenes) */
function chip(ctx, im, { x, y, w, h, src, rot = 0, pad = 0 }) {
  const c = createCanvas(w + pad * 2, h + pad * 2), g = c.getContext('2d');
  g.save();
  g.translate(pad, pad);
  g.beginPath();
  if (g.roundRect) g.roundRect(0, 0, w, h, 18); else g.rect(0, 0, w, h);
  g.clip();
  cover(g, im, 0, 0, w, h, src, 1);
  g.restore();
  ctx.save();
  ctx.shadowColor = 'rgba(20,24,29,.22)';
  ctx.shadowBlur = 34; ctx.shadowOffsetY = 16;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.drawImage(c, -(w / 2 + pad), -(h / 2 + pad));
  ctx.restore();
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.strokeStyle = 'rgba(255,253,249,.65)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, 18); else ctx.rect(-w / 2, -h / 2, w, h);
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
  ctx.fillStyle = C.brass; ctx.fillRect(X, y - 24, 46, 3);
  spaced(ctx, txt, X, y + 16, 'MontSB', 24, light ? 'rgba(255,253,249,.60)' : C.steel, 5);
}

function tick(ctx, x, y, color = C.brass, s = 16) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.15);
  ctx.lineTo(x + s * 0.42, y + s * 0.55);
  ctx.lineTo(x + s * 1.15, y - s * 0.55);
  ctx.stroke();
  ctx.restore();
}

function priceBadge(ctx, x, y, { dark = false, size = 60, strong = false } = {}) {
  const label = '৳৮৫০';
  ctx.font = `${size}px AnekXB`;
  const w = ctx.measureText(label).width + 58, h = size * 1.62;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.fillRect(x, y, w, h);
  if (strong) {
    ctx.fillStyle = C.ink;
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,24,29,.9)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.brass;
  } else {
    ctx.fillStyle = dark ? 'rgba(201,164,92,.14)' : 'rgba(20,24,29,.045)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,164,92,.55)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.brass;
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 30, y + h / 2 + size * 0.06);
  ctx.textBaseline = 'alphabetic';
  return w;
}

/* ─────────────────────────────────────────── scenes (each its own design) */

/* 1 · HOOK — light editorial cover: the row, the name, the price */
async function sceneHook() {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g_shared_group.jpg`);

  // group row, feathered on all four edges so the plate's stage melts in
  const plc = createCanvas(W, 780), p = plc.getContext('2d');
  cover(p, im, 0, 0, W, 780, [0, 380, 1600, 1150], 1);
  const gx = p.createLinearGradient(0, 0, W, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(.06, 'rgba(0,0,0,1)');
  gx.addColorStop(.94, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
  const gy = p.createLinearGradient(0, 0, 0, 780);
  gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(.10, 'rgba(0,0,0,1)');
  gy.addColorStop(.84, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
  p.globalCompositeOperation = 'destination-in';
  p.fillStyle = gx; p.fillRect(0, 0, W, 780);
  p.fillStyle = gy; p.fillRect(0, 0, W, 780);
  g.drawImage(plc, 0, 130);

  // masthead
  g.fillStyle = 'rgba(20,24,29,.12)'; g.fillRect(X, 150, WID, 2);
  spaced(g, 'MIQA', X, 110, 'CinzelM', 40, C.ink, 12);
  spaced(g, 'STEEL NIGHT', W - X, 106, 'MontSB', 20, C.steel, 6, 'right');

  g.fillStyle = 'rgba(20,24,29,.10)'; g.fillRect(X, 900, WID, 2);
  spaced(g, 'MEN\'S WATCH COLLECTION · 2026', X, 962, 'MontSB', 21, C.steel, 5);

  // headline — the client's line, no product names
  g.fillStyle = C.ink; g.font = '84px AnekXB';
  wrap(g, 'মিকা নিয়ে এলো ছেলেদের স্পেশাল ঘড়ির কালেকশন', '84px AnekXB', WID)
    .forEach((l, i) => g.fillText(l, X, 1090 + i * 102));

  g.fillStyle = C.brass; g.fillRect(X, 1330, 46, 3);
  g.font = '34px HindR'; g.fillStyle = '#3A4249';
  g.fillText('একই কেস · পাঁচটি ফিনিশ · একই দাম', X, 1400);
  g.font = '28px AnekSB'; g.fillStyle = C.ink2;
  g.fillText('বাটারফ্লাই লক', X, 1470); tick(g, X + 236, 1461);
  g.fillText('ওয়াটার রেজিস্ট্যান্ট', X + 278, 1470); tick(g, X + 560, 1461);
  g.fillText('কোয়ালিটি: Good', X + 600, 1470); tick(g, X + 838, 1461);

  priceBadge(g, X, 1524, { size: 56, strong: true });
  g.font = '30px HindSB'; g.fillStyle = C.steel;
  g.fillText('সব ফিনিশে একই দাম', X + 240, 1576);
  g.fillStyle = C.brass; g.fillRect(X, 1810, WID, 2);
  spaced(g, 'STEEL NIGHT · FIVE FINISHES', X, 1866, 'MontSB', 22, C.steel, 6);
  return c;
}

/* 2 · FINISHES — gallery cascade of five plates */
async function sceneGallery() {
  const c = lightStage(), g = c.getContext('2d');
  eyebrow(g, 'FIVE FINISHES', 210);
  g.fillStyle = C.ink; g.font = '96px AnekXB';
  g.fillText('পাঁচটি ফিনিশ', X, 340);
  g.font = '32px HindR'; g.fillStyle = '#3A4249';
  g.fillText('একই কেস, একই ব্রেসলেট — শুধু রঙ বদলায়', X, 396);

  const slugs = ['set-g-01-black', 'set-g-02-twotone-navy', 'set-g-03-twotone-slate', 'set-g-04-gold-navy', 'set-g-05-gold-champagne'];
  const src = [110, 20, 1400, 1130];   // watch only, printed caption cropped away
  const chipW = 186, chipH = 262;
  const ys = [470, 560, 500, 470, 560];
  const rots = [-0.045, 0.02, -0.02, 0.03, -0.03];
  for (let i = 0; i < 5; i++) {
    const im = await loadImage(`${IMG}/${slugs[i]}_1_main.jpg`);
    chip(g, im, {
      x: 56 + i * 196, y: ys[i], w: chipW, h: chipH, src, rot: rots[i], pad: 0,
    });
  }

  // index rail under the cascade
  g.fillStyle = 'rgba(20,24,29,.10)'; g.fillRect(X, 1010, WID, 2);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = C.brass; g.fillRect(X + i * 178, 1010, 34, 2);
    spaced(g, `0${i + 1}`, X + i * 178, 1064, 'MontSB', 22, C.steel, 3);
  }

  // closing line
  g.fillStyle = C.ink; g.font = '62px AnekXB';
  g.fillText('আপনার রঙ, আপনার স্টাইল', X, 1250);
  g.font = '30px HindR'; g.fillStyle = '#3A4249';
  g.fillText('ব্ল্যাক · টু-টোন · গোল্ড — সব একই দামে', X, 1306);

  // floating price band
  g.save();
  g.shadowColor = 'rgba(20,24,29,.12)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
  g.fillStyle = C.paper;
  g.beginPath();
  if (g.roundRect) g.roundRect(X, 1420, WID, 280, 24); else g.fillRect(X, 1420, WID, 280);
  g.fill(); g.restore();
  g.fillStyle = C.brass; g.fillRect(X + 40, 1470, 44, 3);
  g.fillStyle = C.ink; g.font = '54px AnekXB';
  g.fillText('৳৮৫০', X + 40, 1566);
  g.font = '30px HindSB'; g.fillStyle = '#3A4249';
  g.fillText('সব ফিনিশে একই দাম', X + 40, 1620);
  tick(g, W - X - 90, 1540, C.brass, 20);

  g.fillStyle = C.brass; g.fillRect(X, 1810, WID, 2);
  spaced(g, 'STEEL NIGHT · FIVE FINISHES', X, 1866, 'MontSB', 22, C.steel, 6);
  return c;
}

/* 3 · LOCK — blueprint grid on obsidian */
async function sceneLock() {
  const c = darkStage(), g = c.getContext('2d');

  // technical grid
  g.strokeStyle = 'rgba(201,164,92,.12)'; g.lineWidth = 1;
  for (let x = 40; x < W; x += 72) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 40; y < H; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }

  const im = await loadImage(`${IMG}/set-g-04-gold-navy_4_bracelet.jpg`);
  // big circular lens holding the clasp macro — a different frame from the rest
  const R = 430, cx = W / 2, cy = 800;
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  cover(g, im, cx - R, cy - R, R * 2, R * 2, [190, 120, 1180, 860], 1);
  g.restore();
  g.strokeStyle = 'rgba(201,164,92,.55)'; g.lineWidth = 2;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(201,164,92,.18)'; g.lineWidth = 1;
  g.beginPath(); g.arc(cx, cy, R + 18, 0, Math.PI * 2); g.stroke();

  // callout ticks
  g.strokeStyle = 'rgba(246,243,236,.35)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(cx + R + 18, cy - 60); g.lineTo(cx + R + 92, cy - 60); g.stroke();
  spaced(g, 'CLASP', cx + R + 100, cy - 52, 'MontSB', 20, 'rgba(246,243,236,.45)', 4);

  eyebrow(g, 'BATTERFLY LOCK', 1330, true);
  g.fillStyle = '#F6F3EC'; g.font = '92px AnekXB';
  g.fillText('বাটারফ্লাই লক', X, 1462);
  g.font = '34px HindR'; g.fillStyle = 'rgba(246,243,236,.74)';
  g.fillText('দুই পাশ থেকে ভাঁজ হয়ে বন্ধ হয়', X, 1530);
  g.font = '28px AnekSB'; g.fillStyle = C.brass;
  g.fillText('৫-লিংক জুবিলি ব্রেসলেট', X, 1592);

  g.fillStyle = 'rgba(201,164,92,.35)'; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'BATTERFLY LOCK · ৳৮৫০', X, 1800, 'MontSB', 22, 'rgba(246,243,236,.46)', 6);
  return c;
}

/* 4 · DIAL — full-bleed macro with a corner caption slab */
async function sceneDial() {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-02-twotone-navy_3_dial.jpg`);
  fadeEdge(g, im, { h: 1180, to: C.stage2, fade: 0.18, src: [60, 60, 1480, 1360] });
  glaze(g, { h: 1360, a: 0.10 });

  // caption slab overlaps the photo — magazine feel
  g.save();
  g.shadowColor = 'rgba(20,24,29,.14)'; g.shadowBlur = 34; g.shadowOffsetY = 12;
  g.fillStyle = 'rgba(255,253,249,.94)';
  g.beginPath();
  if (g.roundRect) g.roundRect(X, 1250, 720, 240, 18); else g.fillRect(X, 1250, 720, 240);
  g.fill(); g.restore();
  g.fillStyle = C.brass; g.fillRect(X + 34, 1296, 40, 3);
  spaced(g, 'DIAL', X + 34, 1346, 'MontSB', 20, C.steel, 5);
  g.fillStyle = C.ink; g.font = '50px AnekXB';
  g.fillText('সানবার্স্ট ডায়াল', X + 34, 1416);
  g.font = '28px HindR'; g.fillStyle = '#3A4249';
  g.fillText('XII ও VI · পাথর মার্কার · ম্যাগনিফায়ার', X + 34, 1466);

  g.fillStyle = C.ink2; g.font = '32px HindSB';
  g.fillText('ফ্লুটেড রেজেল · ৩টার ঘরে তারিখ', X, 1560);
  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'QUALITY: GOOD · ৳৮৫০', X, 1800, 'MontSB', 22, C.steel, 6);
  return c;
}

/* 5 · WATER — split editorial: photo right, type left */
async function sceneWater() {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-03-twotone-slate_5_wrist.jpg`);

  // right-hand photo card: bleeds off the right edge, rounded on the left only
  const pw = W - 540, ph = H;
  const pc = createCanvas(pw, ph), pq = pc.getContext('2d');
  pq.save();
  pq.beginPath();
  if (pq.roundRect) pq.roundRect(0, 0, pw, ph, 28); else pq.rect(0, 0, pw, ph);
  pq.clip();
  cover(pq, im, 0, 0, pw, ph, [60, 0, 940, 1600], 1);
  pq.restore();

  g.save();
  g.shadowColor = 'rgba(20,24,29,.20)'; g.shadowBlur = 46; g.shadowOffsetY = 18;
  g.drawImage(pc, 540, 0);
  g.fillStyle = 'rgba(201,164,92,.55)'; g.fillRect(540, 0, 2, H);
  g.restore();

  eyebrow(g, 'WATER RESISTANT', 300);
  g.fillStyle = C.ink; g.font = '76px AnekXB';
  ['ওয়াটার', 'রেজিস্ট্যান্ট'].forEach((l, i) => g.fillText(l, X, 430 + i * 88));
  g.font = '30px HindR'; g.fillStyle = '#3A4249';
  ['হাত ধোয়া, বৃষ্টি, ঘাম —', 'সাধারণ ব্যবহারে নিরাপদ।'].forEach((l, i) => g.fillText(l, X, 620 + i * 44));

  // three quiet points, stacked
  const pts = ['ঘামে সমস্যা নেই', 'বৃষ্টিতে পরা যায়', 'হাত ধুলেও ঠিক'];
  pts.forEach((t, i) => {
    tick(g, X, 760 + i * 92, C.brass, 18);
    g.fillStyle = C.ink2; g.font = '30px AnekSB';
    g.fillText(t, X + 44, 768 + i * 92);
  });
  g.font = '24px AnekSB'; g.fillStyle = C.steel;
  g.fillText('পানিতে ডুবিয়ে ব্যবহারের জন্য নয়', X, 1060);

  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'STEEL NIGHT · ৳৮৫০', X, 1800, 'MontSB', 22, C.steel, 6);
  return c;
}

/* 6 · QUALITY — brass seal over a darkened dial */
async function sceneQuality() {
  const c = darkStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-05-gold-champagne_3_dial.jpg`);
  cover(g, im, 0, 0, W, H, [80, 60, 1440, 1500], 0.42);
  // dark wash so the seal reads
  const rg = g.createRadialGradient(W / 2, 760, 60, W / 2, 760, 900);
  rg.addColorStop(0, 'rgba(6,8,10,.30)');
  rg.addColorStop(1, 'rgba(6,8,10,.88)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);

  // seal
  const cx = W / 2, cy = 760, R = 250;
  g.strokeStyle = C.brass; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(201,164,92,.35)'; g.lineWidth = 1.5;
  g.beginPath(); g.arc(cx, cy, R - 26, 0, Math.PI * 2); g.stroke();
  spaced(g, 'QUALITY', cx, cy - 60, 'MontSB', 26, 'rgba(246,243,236,.7)', 10, 'center');
  g.textAlign = 'center'; g.fillStyle = C.brass; g.font = '116px AnekXB';
  g.fillText('GOOD', cx, cy + 44);
  g.textAlign = 'left';
  spaced(g, 'M I Q A', cx, cy + 120, 'MontSB', 20, 'rgba(246,243,236,.5)', 6, 'center');

  const band = g.createLinearGradient(0, 1120, 0, 1330);
  band.addColorStop(0, 'rgba(6,8,10,0)'); band.addColorStop(0.55, 'rgba(6,8,10,.88)');
  band.addColorStop(1, 'rgba(6,8,10,.97)');
  g.fillStyle = band; g.fillRect(0, 1120, W, 340);
  g.fillStyle = C.obs; g.fillRect(0, 1450, W, H - 1450);
  g.textAlign = 'center';
  g.fillStyle = C.brass; g.font = '32px AnekSB';
  g.fillText('১ বছরের ওয়ারেন্টি · কালার গ্যারেন্টি', W / 2, 1330);
  g.fillStyle = 'rgba(246,243,236,.72)'; g.font = '28px HindR';
  g.fillText('সাত দিনের রিপ্লেসমেন্ট · ৳৮৫০', W / 2, 1382);
  g.textAlign = 'left';

  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'QUALITY: GOOD · FOR MEN', X, 1800, 'MontSB', 22, 'rgba(246,243,236,.46)', 6);
  return c;
}

/* 7 · PROMISE — ledger list on paper */
async function scenePromise() {
  const c = lightStage(), g = c.getContext('2d');
  eyebrow(g, 'MIQA PROMISE', 230);
  g.fillStyle = C.ink; g.font = '92px AnekXB';
  g.fillText('৭ দিনের', X, 372);
  g.fillText('রিপ্লেসমেন্ট', X, 470);
  g.font = '30px HindR'; g.fillStyle = '#3A4249';
  g.fillText('হাতে পাওয়ার সাত দিনের মধ্যে সমস্যা পেলে বদলে নিন', X, 536);

  const rows = [
    ['১ বছর', 'ওয়ারেন্টি'],
    ['কালার', 'গ্যারেন্টি'],
    ['ক্যাশ অন', 'ডেলিভারি'],
    ['সব ফিনিশে', 'একই দাম — ৳৮৫০'],
  ];
  let y = 700;
  for (const [a, b] of rows) {
    g.fillStyle = 'rgba(20,24,29,.10)'; g.fillRect(X, y, WID, 2);
    g.fillStyle = C.ink; g.font = '58px AnekXB';
    g.fillText(a, X, y + 100);
    g.fillStyle = '#3A4249'; g.font = '40px AnekSB';
    g.fillText(b, X + 340, y + 100);
    tick(g, W - X - 44, y + 78, C.brass, 18);
    y += 240;
  }
  g.fillStyle = 'rgba(20,24,29,.10)'; g.fillRect(X, y, WID, 2);

  g.fillStyle = C.brass; g.fillRect(X, 1810, WID, 2);
  spaced(g, '1 YEAR WARRANTY · COLOUR GUARANTEE', X, 1866, 'MontSB', 21, C.steel, 5);
  return c;
}

/* 8 · CTA — night poster: hero watch, big price, pill */
async function sceneCTA() {
  const c = darkStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-01-black_2_angle.jpg`);
  cover(g, im, 0, 0, W, 1180, [90, 30, 1400, 1400], 0.62);
  const wash = g.createLinearGradient(0, 700, 0, 1300);
  wash.addColorStop(0, rgba0(C.obs)); wash.addColorStop(1, C.obs);
  g.fillStyle = wash; g.fillRect(0, 700, W, 600);
  const vg = g.createRadialGradient(W / 2, 620, 200, W / 2, 620, 900);
  vg.addColorStop(0, 'rgba(6,8,10,0)'); vg.addColorStop(1, 'rgba(6,8,10,.72)');
  g.fillStyle = vg; g.fillRect(0, 0, W, 1250);

  spaced(g, 'MIQA · STEEL NIGHT', X, 900, 'MontSB', 24, 'rgba(246,243,236,.5)', 6);

  g.fillStyle = C.brass; g.font = '190px AnekXB';
  g.fillText('৳৮৫০', X, 1092);
  g.font = '38px HindSB'; g.fillStyle = 'rgba(246,243,236,.82)';
  g.fillText('ছেলেদের স্পেশাল ঘড়ির কালেকশন', X, 1154);
  g.font = '30px AnekSB'; g.fillStyle = C.brass;
  g.fillText('বাটারফ্লাই লক · ওয়াটার রেজিস্ট্যান্ট · কোয়ালিটি Good', X, 1208);

  const label = 'অর্ডার করতে মেসেজ দিন';
  g.font = '42px AnekSB';
  const pw2 = g.measureText(label).width + 92;
  g.beginPath();
  if (g.roundRect) g.roundRect(X, 1272, pw2, 104, 52); else g.fillRect(X, 1272, pw2, 104);
  g.fillStyle = C.brass; g.fill();
  g.fillStyle = '#1A1610'; g.textBaseline = 'middle';
  g.fillText(label, X + 46, 1328);
  g.textBaseline = 'alphabetic';

  g.font = '28px HindR'; g.fillStyle = 'rgba(246,243,236,.66)';
  ['১ বছর ওয়ারেন্টি · কালার গ্যারেন্টি', '৭ দিনের রিপ্লেসমেন্ট · ক্যাশ অন ডেলিভারি']
    .forEach((l, i) => g.fillText(l, X, 1440 + i * 46));
  g.font = '26px HindSB'; g.fillStyle = 'rgba(246,243,236,.42)';
  g.fillText('৫% লাভ স্ট্রিট চিলড্রেনের জন্য', X, 1554);

  g.fillStyle = 'rgba(201,164,92,.35)'; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'MIQA', X, 1806, 'CinzelM', 34, 'rgba(246,243,236,.6)', 12);
  return c;
}

/* ─────────────────────────────────────────── audio bed */
function writeBed(path, seconds, cuts) {
  const SR = 48000, n = Math.ceil(seconds * SR);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);

  const chords = [
    [196.00, 246.94, 293.66],  // G
    [174.61, 220.00, 261.63],  // F
    [130.81, 196.00, 246.94],  // C
    [146.83, 220.00, 293.66],  // D
  ];
  const smp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.min(chords.length - 1, Math.floor(t / 5.2) % chords.length);
    let v = 0;
    for (const f of chords[ci]) {
      v += Math.sin(2 * Math.PI * f * t) * 0.26
        + Math.sin(2 * Math.PI * f * 2 * t) * 0.045
        + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.12;
    }
    const trem = 0.86 + 0.14 * Math.sin(2 * Math.PI * 0.09 * t);
    v *= trem * Math.min(1, t / 1.6) * Math.min(1, (seconds - t) / 2.2) * 0.05;
    smp[i] = v;
  }
  for (const cu of cuts) {
    const start = Math.round(cu * SR), len = Math.round(0.09 * SR);
    let lp = 0;
    for (let j = 0; j < len && start + j < n; j++) {
      const env = Math.exp(-j / (0.02 * SR));
      lp += 0.22 * ((Math.random() * 2 - 1) - lp);
      smp[start + j] += lp * env * 0.07 + Math.sin(2 * Math.PI * 90 * (j / SR)) * env * 0.045;
    }
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(smp[i]));
  const g = peak > 0 ? 0.7 / peak : 1;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, smp[i] * g)) * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path, buf);
}

/* ─────────────────────────────────────────── build + render */
const VO_LINES = [
  '01_hook', '02_finish', '03_lock', '04_dial', '05_water', '06_quality', '07_replace', '08_cta',
];
const SCENES = [
  sceneHook, sceneGallery, sceneLock, sceneDial, sceneWater, sceneQuality, scenePromise, sceneCTA,
];

const probe = (f) => Number(execFileSync(FP, [
  '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f,
]).toString().trim());

const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

async function main() {
  const voDur = VO_LINES.map((n) => probe(`${VO}/${n}.mp3`) / TEMPO);
  const TARGET = voDur.map((d, i) => d + (i === 0 ? 1.15 : i === 7 ? 1.5 : 0.85));

  const starts = [];
  let t = 0;
  TARGET.forEach((d) => { starts.push(t); t += d; });
  const total = t;

  console.log('scenes', TARGET.map((d) => d.toFixed(2)).join(' / '), '≈', total.toFixed(2) + 's');

  // render the 8 cards
  const cards = [];
  for (const fn of SCENES) cards.push(await fn());

  const wav = `${BASE}/work/bed2.wav`;
  fs.mkdirSync(`${BASE}/work`, { recursive: true });
  writeBed(wav, total, starts.slice(1));

  /* ---------- ffmpeg ---------- */
  const inputs = [
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0',
    '-i', wav,
  ];
  for (const n of VO_LINES) inputs.push('-i', `${VO}/${n}.mp3`);

  const filters = ['[1:a]volume=1.0[bed]'];
  const amixIn = ['[bed]'];
  VO_LINES.forEach((_, i) => {
    const ms = Math.round(starts[i] * 1000);
    filters.push(`[${i + 2}:a]atempo=${TEMPO},adelay=${ms}|${ms},volume=1.0[v${i}]`);
    amixIn.push(`[v${i}]`);
  });
  // this ffmpeg build's amix divides by the input count — undo that, then limit
  filters.push(
    `${amixIn.join('')}amix=inputs=${amixIn.length}:duration=longest,` +
    `volume=${amixIn.length},alimiter=limit=0.94,aresample=48000[a]`
  );

  const args = [
    '-y', '-hide_banner', '-loglevel', 'error', ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.1', '-g', String(FPS * 2),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-t', total.toFixed(3), '-movflags', '+faststart', OUT,
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
    const scale = 1 + 0.02 * Math.min(1, local / TARGET[i]);
    const draw = (idx, dx) => {
      fg.save();
      fg.translate(W / 2 + dx, H / 2);
      fg.scale(scale, scale);
      fg.drawImage(cards[idx], -W / 2, -H / 2);
      fg.restore();
    };
    if (prev >= 0) {
      const p = easeOut(local / SLIDE);
      draw(prev, -W * p);
      draw(i, W * (1 - p));
    } else draw(i, 0);

    await push(frame.data());
    if (f % 150 === 0) console.log(`  ${f}/${frames} ${(at).toFixed(1)}s ${(process.memoryUsage().rss / 1048576).toFixed(0)}MB`);
  }
  ff.stdin.end();
  await done;
  console.log('OUT', OUT, (fs.statSync(OUT).size / 1048576).toFixed(1) + 'MB', total.toFixed(2) + 's');
}

process.on('exit', (c) => console.log('EXIT', c));
main().catch((e) => { console.error('MAIN', e); process.exit(1); });
