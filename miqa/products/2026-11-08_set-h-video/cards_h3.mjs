/**
 * Set H v3 — "MONTVARE", 1080×1920, 30 fps.
 *
 * Built only after the client rejected v1/v2 and answered five direct questions:
 *   • plates re-rendered from the client's own photos, matched to their colour
 *     (cool silver steel, rich yellow gold, white backdrop — no beige, no sand);
 *   • theme: cool neutral steel-white, NOT the ladies' warm drapery;
 *   • composition: full watch on every colour card, like Set F;
 *   • type: Set F's recipe — small brand line, watch in the middle, big Bengali
 *     name and one supporting line underneath.
 *
 *   node miqa/products/2026-11-08_set-h-video/cards_h3.mjs
 *   CARDS_ONLY=1 node …/cards_h3.mjs    → 13 PNG cards for QC
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindMed');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Montserrat-Regular.ttf`, 'MontR');

const PLATES = 'miqa/products/2026-11-08_set-h/plates-v3';
const WEB = 'miqa/deliveries/2026-11-08_set-h/website';
const VO = 'miqa/products/2026-11-08_set-h-video/audio/vo';
const BASE = 'miqa/products/2026-11-08_set-h-video';
const OUTD = 'miqa/deliveries/2026-11-08_set-h-video';
const OUT = `${OUTD}/miqa-set-h-montvare-v3_1080x1920.mp4`;
const FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const FP = 'node_modules/@ffprobe-installer/linux-x64/ffprobe';

const W = 1080, H = 1920, FPS = 30, SLIDE = 0.42;
const PRICE = '৮৯৯';

/* cool neutral steel-white — the backdrop stays colourless so the two-tone
   case and the emerald/blue/red dials carry every bit of colour in the frame */
const C = {
  ink: '#14181D', ink2: '#2A3036', steel: '#79828A', brass: '#A8823F',
  white: '#FBFCFC', cool1: '#F4F6F8', cool2: '#E9EDF1', cool3: '#D8DFE5',
  obs: '#0A0C0F', paper: '#FFFFFF',
};
const X = 96, WID = W - X * 2;

const CW = [
  { slug: 'p01_green_v2', n: '০১ / ০৭', bn: 'এমারেল্ড সবুজ', en: 'EMERALD', line: 'সবুজ ডায়াল, সোনালি কাঁটা', vo: 'c1_green' },
  { slug: 'p02_champagne', n: '০২ / ০৭', bn: 'শ্যাম্পেন গোল্ড', en: 'CHAMPAGNE GOLD', line: 'পুরো সোনালি কেস ও ব্রেসলেট', vo: 'c2_champagne' },
  { slug: 'p03_black', n: '০৩ / ০৭', bn: 'কালো', en: 'BLACK', line: 'কালো ডায়াল, টু-টোন কেস', vo: 'c3_black' },
  { slug: 'p04_silver', n: '০৪ / ০৭', bn: 'সিলভার', en: 'SILVER', line: 'সিলভার ডায়াল, রোজ গোল্ড টোন', vo: 'c4_silver' },
  { slug: 'p05_blue', n: '০৫ / ০৭', bn: 'রয়্যাল নীল', en: 'ROYAL BLUE', line: 'নীল ডায়াল, বোল্ড লুক', vo: 'c5_blue' },
  { slug: 'p06_red', n: '০৬ / ০৭', bn: 'চেরি রেড', en: 'CHERRY RED', line: 'চেরি সানবার্স্ট ডায়াল', vo: 'c6_red' },
  { slug: 'p07_blacksteel', n: '০৭ / ০৭', bn: 'ব্ল্যাক স্টিল', en: 'BLACK STEEL', line: 'ফুল ব্ল্যাক PVD ফিনিশ', vo: 'c7_blacksteel' },
];

/* ── helpers */
function grain(ctx, w, h, alpha = 0.045, seed0 = 20261110) {
  const n = createCanvas(w, h), nx = n.getContext('2d');
  const img = nx.createImageData(w, h);
  let seed = seed0;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rnd() - 0.5) * 18;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(n, 0, 0); ctx.restore();
}

/** Cool neutral studio sweep: white at the top, a whisper of steel blue at the
 *  bottom, one big softbox from the upper left, and a soft floor. */
function stage(ctx, { dark = false } = {}) {
  const lg = ctx.createLinearGradient(0, 0, 0, H);
  if (dark) {
    lg.addColorStop(0, '#171B20'); lg.addColorStop(0.55, '#0D1115'); lg.addColorStop(1, '#05070A');
  } else {
    lg.addColorStop(0, C.white); lg.addColorStop(0.52, C.cool1); lg.addColorStop(1, C.cool2);
  }
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);

  // softbox
  const rg = ctx.createRadialGradient(W * 0.40, H * 0.22, 0, W * 0.40, H * 0.22, W * 1.15);
  rg.addColorStop(0, dark ? 'rgba(120,145,170,0.16)' : 'rgba(255,255,255,0.95)');
  rg.addColorStop(0.55, dark ? 'rgba(60,75,90,0.06)' : 'rgba(247,250,252,0.35)');
  rg.addColorStop(1, dark ? 'rgba(0,0,0,0.35)' : 'rgba(196,208,220,0.30)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  // cool reflection strip on the right, matching how the plates are lit
  const sg = ctx.createLinearGradient(W * 0.78, 0, W, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)');
  sg.addColorStop(0.5, dark ? 'rgba(150,175,200,0.07)' : 'rgba(255,255,255,0.34)');
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg; ctx.fillRect(W * 0.7, 0, W * 0.3, H);

  // floor glow so the product sits on something
  const fg = ctx.createRadialGradient(W * 0.5, H * 0.74, 0, W * 0.5, H * 0.74, W * 0.62);
  fg.addColorStop(0, dark ? 'rgba(170,195,220,0.05)' : 'rgba(255,255,255,0.55)');
  fg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);

  grain(ctx, W, H, dark ? 0.03 : 0.045);
}

/**
 * The whole watch, and only the watch: white plate pixels are knocked out with
 * a soft luminance key so the plate's square can never show against the sweep.
 */
function placeWatch(ctx, im, { cx, cy, h }) {
  const k = h / im.height;
  const w = Math.round(im.width * k), hh = Math.round(h);

  const c = createCanvas(w, hh);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(im, 0, 0, w, hh);

  const d = g.getImageData(0, 0, w, hh);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const L = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    // 244+ is the clean backdrop, 232- is product or its shadow
    const a = 1 - Math.min(1, Math.max(0, (L - 232) / 12));
    px[i + 3] = Math.round(px[i + 3] * a);
  }
  g.putImageData(d, 0, 0);

  ctx.save();
  ctx.filter = 'blur(30px)';
  ctx.fillStyle = 'rgba(64,76,88,0.16)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + hh * 0.47, w * 0.26, hh * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(c, Math.round(cx - w / 2), Math.round(cy - hh / 2));
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

function display(ctx, text, { x = X, y, size = 92, color = C.ink, maxW = WID, lh = 1.16, align = 'left' }) {
  ctx.font = `${size}px AnekXB`;
  const lines = wrap(ctx, text, `${size}px AnekXB`, maxW);
  const anchor = align === 'center' ? W / 2 : x;
  ctx.textAlign = align;
  lines.forEach((l, i) => { ctx.fillStyle = color; ctx.fillText(l, anchor, y + i * size * lh); });
  ctx.textAlign = 'left';
  return y + (lines.length - 1) * size * lh;
}

function body(ctx, text, { x = X, y, size = 33, color = '#5D666F', maxW = WID, lh = 1.6, align = 'left' }) {
  ctx.font = `${size}px HindMed`;
  ctx.fillStyle = color;
  const lines = wrap(ctx, text, `${size}px HindMed`, maxW);
  const anchor = align === 'center' ? W / 2 : x;
  ctx.textAlign = align;
  lines.forEach((l, i) => ctx.fillText(l, anchor, y + i * size * lh));
  ctx.textAlign = 'left';
  return y + (lines.length - 1) * size * lh;
}

function pricePill(ctx, cx, y, { size = 66, dark = false, strong = false } = {}) {
  const label = `৳${PRICE}`;
  ctx.font = `${size}px AnekXB`;
  const w = ctx.measureText(label).width + 66, h = size * 1.62;
  const x = cx - w / 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.fillRect(x, y, w, h);
  if (strong) { ctx.fillStyle = C.ink; ctx.fill(); ctx.fillStyle = '#E7C98A'; }
  else {
    ctx.fillStyle = dark ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,24,29,.28)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = C.ink;
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, y + h / 2 + size * 0.05);
  ctx.textBaseline = 'alphabetic';
  return h;
}

/** the seven, in a row: each watch carved to its own bounding box, so cells
 *  never overlap and every bracelet stays whole */
async function buildRow({ width, watchH }) {
  const cut = [];
  for (const w of CW) {
    const im = await loadImage(`${PLATES}/${w.slug}.png`);
    const t = createCanvas(im.width, im.height);
    const tg = t.getContext('2d');
    tg.imageSmoothingQuality = 'high';
    tg.drawImage(im, 0, 0);
    const d = tg.getImageData(0, 0, im.width, im.height);
    const px = d.data;
    let x0 = im.width, y0 = im.height, x1 = 0, y1 = 0;
    for (let y = 0; y < im.height; y++) {
      for (let x = 0; x < im.width; x++) {
        const i = (y * im.width + x) * 4;
        const L = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        if (L < 236) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
    }
    cut.push({ im, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }

  const widest = Math.max(...cut.map((c) => (c.w / c.h) * watchH));
  const cell = Math.max(widest * 1.02, width / CW.length);
  const totalW = Math.round(cell * CW.length);
  const c = createCanvas(totalW, Math.round(watchH));
  const g = c.getContext('2d');
  cut.forEach((cc, i) => {
    const k = watchH / cc.h;
    const ww = Math.round(cc.w * k), hh = Math.round(watchH);
    // carve the watch out of its white plate so the cell stays transparent
    const tmp = createCanvas(ww, hh);
    const tg = tmp.getContext('2d');
    tg.imageSmoothingQuality = 'high';
    tg.drawImage(cc.im, cc.x0, cc.y0, cc.w, cc.h, 0, 0, ww, hh);
    const d = tg.getImageData(0, 0, ww, hh);
    const px = d.data;
    for (let j = 0; j < px.length; j += 4) {
      const L = 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2];
      const a = 1 - Math.min(1, Math.max(0, (L - 236) / 10));
      px[j + 3] = Math.round(px[j + 3] * a);
    }
    tg.putImageData(d, 0, 0);
    g.drawImage(tmp, Math.round(i * cell + (cell - ww) / 2), 0);
  });
  // scale the whole row down to the requested width if it came out wider
  if (totalW > width) {
    const sc = width / totalW;
    const out = createCanvas(Math.round(width), Math.round(watchH * sc));
    const og = out.getContext('2d');
    og.imageSmoothingQuality = 'high';
    og.drawImage(c, 0, 0, out.width, out.height);
    return out;
  }
  return c;
}

/* ── scenes */

/* 1 · HOOK — the set, then the name and the price */
async function sceneHook() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g);

  spaced(g, 'M I Q A', W / 2, 150, 'MontSB', 26, C.ink, 10, 'center');
  g.fillStyle = 'rgba(20,24,29,.22)';
  g.fillRect(W / 2 - 40, 176, 80, 1.6);

  // the seven, in a clean row — every watch whole
  const row = await buildRow({ width: W - 16, watchH: 480 });
  g.drawImage(row, 8, 300);

  display(g, 'ছেলেদের স্পেশাল\nঘড়ির কালেকশন', { y: 1070, size: 106, align: 'center', maxW: W - 140, lh: 1.15 });
  body(g, 'সাতটি ফিনিশ · একই কেস · একই দাম', { y: 1330, size: 38, align: 'center' });
  pricePill(g, W / 2, 1420, { size: 92, strong: true });
  spaced(g, '7 COLOURWAYS  ·  STEEL DAYLIGHT', W / 2, 1740, 'MontSB', 21, C.steel, 6, 'center');
  return c;
}

/* 2 · COLLECTION — the row with names, price */
async function sceneReveal() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g);

  spaced(g, 'T H E   C O L L E C T I O N', X, 200, 'MontSB', 22, C.steel, 6);
  display(g, 'একই ঘড়ি,\nসাতটি মেজাজ', { y: 320, size: 100, lh: 1.15 });

  const row = await buildRow({ width: W - 20, watchH: 660 });
  g.drawImage(row, 10, 660);

  const names = CW.map((w) => w.bn);
  let nx = X, ny = 1500;
  g.font = '27px HindMed';
  names.forEach((n, i) => {
    const wd = g.measureText(n).width;
    if (nx + wd > W - X) { nx = X; ny += 52; }
    g.fillStyle = C.ink2; g.fillText(n, nx, ny);
    nx += wd + 16;
    if (i < names.length - 1) { g.fillStyle = 'rgba(20,24,29,.4)'; g.fillText('·', nx - 10, ny); nx += 12; }
  });
  pricePill(g, W / 2, ny + 80, { size: 70 });
  return c;
}

/* 3–9 · one colourway per card — full watch, name underneath */
async function colourCard(i) {
  const w = CW[i];
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g);

  spaced(g, `${w.n}`, X, 168, 'AnekSB', 26, C.steel, 3);
  spaced(g, w.en, W - X, 168, 'MontSB', 23, C.steel, 6, 'right');

  const im = await loadImage(`${PLATES}/${w.slug}.png`);
  placeWatch(g, im, { cx: W / 2, cy: 900, h: 1330 });

  g.fillStyle = 'rgba(20,24,29,.18)';
  g.fillRect(X, 1590, 92, 2.4);
  display(g, w.bn, { y: 1690, size: 96 });
  body(g, w.line, { y: 1770, size: 35 });
  return c;
}

/* 10 · LOCK — clasp macro in a lens, whole watch small underneath */
async function sceneLock() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g);

  spaced(g, 'F E A T U R E   0 1', X, 200, 'MontSB', 22, C.steel, 5);
  display(g, 'রোলেক্স লক', { y: 320, size: 100 });
  body(g, 'ক্ল্যাশে উঁচু ক্রাউন এমবস, ভেতরে হিডেন —\nবাইরে থেকে লিংকগুলো একটানা দেখায়।', { y: 400, size: 32, maxW: 880 });

  const lock = await loadImage(`${WEB}/set-h_shared_lock.jpg`);
  const R = 320, cx = W / 2, cy = 900;
  g.save();
  g.shadowColor = 'rgba(40,52,64,.20)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = C.paper; g.fill();
  g.restore();
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  g.imageSmoothingQuality = 'high';
  g.drawImage(lock, cx - R, cy - R, R * 2, R * 2);
  g.restore();
  g.strokeStyle = 'rgba(20,24,29,.30)'; g.lineWidth = 2.4;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();

  const green = await loadImage(`${PLATES}/p01_green_v2.png`);
  placeWatch(g, green, { cx: W / 2, cy: 1560, h: 560 });
  return c;
}

/* 11 · PROMISE — the five approved claims, three cards + two chips */
async function scenePromise() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g);

  spaced(g, 'T H E   P R O M I S E', X, 210, 'MontSB', 22, C.steel, 6);
  display(g, 'কেনা নিশ্চিন্তে', { y: 330, size: 96 });

  const rows = [
    ['১ বছরের ওয়ারেন্টি', 'কেনার পরও পাশে আছি'],
    ['৭ দিনের রিপ্লেসমেন্ট', 'সমস্যা হলে ৭ দিনের মধ্যে বদলে দেওয়া'],
    ['কালার গ্যারান্টি', 'রঙ ওঠে না'],
  ];
  let y = 560;
  for (const [title, sub] of rows) {
    g.save();
    g.beginPath();
    if (g.roundRect) g.roundRect(X, y - 70, WID, 200, 16); else g.rect(X, y - 70, WID, 200);
    g.fillStyle = 'rgba(255,255,255,.78)'; g.fill();
    g.strokeStyle = 'rgba(20,24,29,.13)'; g.lineWidth = 1.6; g.stroke();
    g.restore();
    g.font = '45px AnekSB'; g.fillStyle = C.ink; g.fillText(title, X + 52, y);
    g.font = '29px HindMed'; g.fillStyle = '#5D666F'; g.fillText(sub, X + 52, y + 56);
    g.strokeStyle = C.brass; g.lineWidth = 3.6; g.lineCap = 'round';
    const tx = X + WID - 98, ty = y - 18;
    g.beginPath(); g.moveTo(tx, ty + 6); g.lineTo(tx + 13, ty + 19); g.lineTo(tx + 34, ty - 8); g.stroke();
    y += 244;
  }

  // the two features that are shown, not written as cards
  g.font = '34px HindMed'; g.fillStyle = '#5D666F';
  g.fillText('সাথে ওয়াটার রেজিস্ট্যান্ট আর রোলেক্স লক — সব একই ঘড়িতে।', X, 1350);

  const br = await loadImage(`${WEB}/set-h-02-champagne_4_bracelet.jpg`);
  const bh = 300, by = 1430;
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(X, by, WID, bh, 14); else g.rect(X, by, WID, bh);
  g.clip();
  g.imageSmoothingQuality = 'high';
  const src = { x: 170, y: 300, w: 1260, h: 430 };
  const k = Math.max(WID / src.w, bh / src.h);
  g.drawImage(br, src.x, src.y, src.w, src.h,
    X + (WID - src.w * k) / 2, by + (bh - src.h * k) / 2, src.w * k, src.h * k);
  g.restore();
  return c;
}

/* 12 · 5% — dark plate, brass seal */
async function sceneFive() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g, { dark: true });

  const cx = W / 2, cy = 780, R = 280;
  g.strokeStyle = 'rgba(200,168,104,.80)'; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1.4; g.strokeStyle = 'rgba(200,168,104,.40)';
  g.beginPath(); g.arc(cx, cy, R - 20, 0, Math.PI * 2); g.stroke();

  g.textAlign = 'center';
  g.font = '112px AnekXB'; g.fillStyle = '#C8A868';
  g.fillText('৫%', cx, cy + 26);
  spaced(g, 'FOR THE CHILDREN', cx, cy + 90, 'MontSB', 22, 'rgba(255,255,255,.58)', 7, 'center');
  g.textAlign = 'left';

  display(g, 'MIQA-এর মুনাফার ৫%\nপথশিশুদের কল্যাণে।', { y: 1300, size: 76, color: '#FFFFFF', lh: 1.24 });
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', X, 1700, 'MontSB', 22, 'rgba(200,168,104,.85)', 6);
  return c;
}

/* 13 · CTA */
async function sceneCTA() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  stage(g, { dark: true });

  spaced(g, 'M I Q A  ·  M O N T V A R E', W / 2, 300, 'MontSB', 25, 'rgba(200,168,104,.95)', 4, 'center');
  display(g, 'আজই অর্ডার করুন', { y: 460, size: 100, color: '#FFFFFF', align: 'center' });

  // the row, small and clean
  const row = await buildRow({ width: W - 60, watchH: 330 });
  g.drawImage(row, 30, 570);

  g.font = '170px AnekXB'; g.fillStyle = '#C8A868';
  g.textAlign = 'center';
  g.fillText(`৳${PRICE}`, W / 2, 1090);
  g.font = '34px HindMed'; g.fillStyle = 'rgba(255,255,255,.72)';
  g.fillText('সাতটি রঙ · একই দাম', W / 2, 1145);
  g.textAlign = 'left';

  // COD pill
  const cw = 440, chh = 94;
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(W / 2 - cw / 2, 1200, cw, chh, chh / 2); else g.rect(W / 2 - cw / 2, 1200, cw, chh);
  g.fillStyle = 'rgba(200,168,104,.16)'; g.fill();
  g.strokeStyle = 'rgba(200,168,104,.6)'; g.lineWidth = 2; g.stroke();
  g.restore();
  g.font = '38px AnekSB'; g.fillStyle = '#FFFFFF'; g.textAlign = 'center';
  g.fillText('ক্যাশ অন ডেলিভারি', W / 2, 1262);

  g.font = '35px HindMed'; g.fillStyle = 'rgba(255,255,255,.86)';
  const lines = wrap(g, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন।', '35px HindMed', WID);
  lines.forEach((l, i) => g.fillText(l, W / 2, 1380 + i * 56));
  g.textAlign = 'left';

  const by = 1540, bh = 128;
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(X, by, WID, bh, bh / 2); else g.rect(X, by, WID, bh);
  g.fillStyle = '#C8A868'; g.fill();
  g.restore();
  g.fillStyle = C.obs; g.font = '44px AnekXB'; g.textAlign = 'center';
  g.fillText('এখনই অর্ডার করুন', W / 2, by + 84);

  for (let i = 0; i < 3; i++) {
    g.strokeStyle = `rgba(200,168,104,${0.85 - i * 0.26})`; g.lineWidth = 5; g.lineCap = 'round';
    const yy = 1730 + i * 32;
    g.beginPath(); g.moveTo(W / 2 - 25, yy); g.lineTo(W / 2, yy + 22); g.lineTo(W / 2 + 25, yy); g.stroke();
  }
  g.textAlign = 'left';
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', X, 1870, 'MontSB', 21, 'rgba(255,255,255,.40)', 5);
  return c;
}

/* ── timeline */
const SCENES = [
  sceneHook, sceneReveal,
  () => colourCard(0), () => colourCard(1), () => colourCard(2), () => colourCard(3),
  () => colourCard(4), () => colourCard(5), () => colourCard(6),
  sceneLock, scenePromise, sceneFive, sceneCTA,
];
const VO_FOR = [
  null, '02_reveal',
  'c1_green', 'c2_champagne', 'c3_black', 'c4_silver', 'c5_blue', 'c6_red', 'c7_blacksteel',
  '03_lock', '08_promise', '09_five', '10_cta',
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

  const chords = [[146.83, 196.00, 246.94], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66], [130.81, 196.00, 261.63]];
  const smp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.min(chords.length - 1, Math.floor(t / 6.2) % chords.length);
    let v = 0;
    for (const f of chords[ci]) {
      v += Math.sin(2 * Math.PI * f * t) * 0.24
        + Math.sin(2 * Math.PI * f * 2 * t) * 0.038
        + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.11;
    }
    v *= (0.88 + 0.12 * Math.sin(2 * Math.PI * 0.075 * t))
      * Math.min(1, t / 1.8) * Math.min(1, (seconds - t) / 2.6) * 0.045;
    smp[i] = v;
  }
  for (const cu of cuts) {
    const start = Math.round(cu * SR), len = Math.round(0.09 * SR);
    let lp = 0;
    for (let j = 0; j < len && start + j < n; j++) {
      const env = Math.exp(-j / (0.02 * SR));
      lp += 0.22 * ((Math.random() * 2 - 1) - lp);
      smp[start + j] += lp * env * 0.055 + Math.sin(2 * Math.PI * 92 * (j / SR)) * env * 0.038;
    }
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(smp[i]));
  const gn = peak > 0 ? 0.60 / peak : 1;
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, smp[i] * gn)) * 32767), 44 + i * 2);
  fs.writeFileSync(path, buf);
}

async function main() {
  fs.mkdirSync(OUTD, { recursive: true });
  fs.mkdirSync(`${BASE}/work`, { recursive: true });

  if (process.env.CARDS_ONLY) {
    fs.mkdirSync(`${BASE}/work/cards3`, { recursive: true });
    for (let i = 0; i < SCENES.length; i++) {
      const c = await SCENES[i]();
      fs.writeFileSync(`${BASE}/work/cards3/${String(i + 1).padStart(2, '0')}.png`, c.toBuffer('image/png'));
      console.log('card', i + 1);
    }
    return;
  }

  const durs = VO_FOR.map((n, i) => {
    const d = n ? probe(`${VO}/${n}.mp3`) : 0;
    if (i === 0) return 4.0;
    if (i === SCENES.length - 1) return d + 2.6;
    return Math.max(2.9, d + 0.85);
  });
  const starts = [];
  let t = 0;
  durs.forEach((d) => { starts.push(t); t += d; });
  const total = t;
  console.log('scenes', durs.map((d) => d.toFixed(2)).join(' / '), '≈', total.toFixed(2) + 's');

  const cards = [];
  for (const fn of SCENES) cards.push(await fn());

  const wav = `${BASE}/work/bed3.wav`;
  writeBed(wav, total, starts.slice(1));

  /* pass 1 — video only */
  const tmpVideo = `${BASE}/work/video-only3.mp4`;
  const ff = spawn(FF, [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0',
    '-frames:v', String(Math.round(total * FPS)),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.1', '-g', String(FPS * 2),
    '-r', String(FPS), '-movflags', '+faststart', tmpVideo,
  ], { stdio: ['pipe', 'inherit', 'pipe'] });
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

  /* pass 2 — audio, then mux */
  const used = VO_FOR.filter(Boolean);
  const aInputs = ['-i', wav];
  used.forEach((n) => aInputs.push('-i', `${VO}/${n}.mp3`));
  const filters = ['[0:a]volume=1.0[bed]'];
  const amixIn = ['[bed]'];
  let idx = 1;
  VO_FOR.forEach((n, i) => {
    if (!n) return;
    const ms = Math.round((starts[i] + 0.3) * 1000);
    filters.push(`[${idx}:a]adelay=${ms}|${ms},volume=1.0[v${i}]`);
    amixIn.push(`[v${i}]`);
    idx += 1;
  });
  filters.push(`${amixIn.join('')}amix=inputs=${amixIn.length}:duration=longest,`
    + `volume=${amixIn.length},alimiter=limit=0.94,aresample=48000[aout]`);

  const tmpAudio = `${BASE}/work/mix3.m4a`;
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
