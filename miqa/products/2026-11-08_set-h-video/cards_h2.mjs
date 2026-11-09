/**
 * Set H v2 — "MONTVARE" film, 1080×1920, 30 fps.
 *
 * What changed after the client's note ("watch is never fully visible; design it
 * with the theme like the ladies' sets — but better"):
 *
 *   • the whole watch is always in frame — case, crown, full bracelet, lugs;
 *     nothing is cropped to a macro unless the crop is itself the subject;
 *   • the stage is a soft swung drapery behind the watch (the ladies' Daylight
 *     recipe), recoloured for the men's set: warm steel sand instead of ivory,
 *     graphite type, brushed-brass hairlines. It reads masculine and daylight at
 *     once, and every colourway card gets the same light so the row stays calm;
 *   • one colourway per card, numbered 01…07, with its own staged composition —
 *     not seven copies of one layout;
 *   • the type sits in a reserved lower-third, never over the watch.
 *
 *   node miqa/products/2026-11-08_set-h-video/cards_h2.mjs
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

const STAGE = 'miqa/products/2026-11-08_set-h/plates-stage';
const WEB = 'miqa/deliveries/2026-11-08_set-h/website';
const GRP = 'miqa/deliveries/2026-11-08_set-h/set-h_shared_group.jpg';
const VO = 'miqa/products/2026-11-08_set-h-video/audio/vo';
const BASE = 'miqa/products/2026-11-08_set-h-video';
const OUTD = 'miqa/deliveries/2026-11-08_set-h-video';
const OUT = `${OUTD}/miqa-set-h-montvare-v2_1080x1920.mp4`;
const FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const FP = 'node_modules/@ffprobe-installer/linux-x64/ffprobe';

const W = 1080, H = 1920, FPS = 30, SLIDE = 0.42;
const PRICE = '৮৯৯';

/* ── the men's daylight palette: warm sand stage, graphite ink, brass accent */
const C = {
  ink: '#14181D', ink2: '#252B31', steel: '#7D868E', brass: '#B08D4F',
  sand0: '#F6F2EA', sand1: '#EDE6DA', sand2: '#DCD2C2', sand3: '#C3B7A5',
  obs: '#0B0D10', paper: '#FFFCF6',
};
const X = 92, WID = W - X * 2;

const CW = [
  { slug: 'set-h-01-green', n: '০১', bn: 'এমারেল্ড', en: 'EMERALD', line: 'গাঢ় সবুজ সানবার্স্ট ডায়াল', vo: 'c1_green' },
  { slug: 'set-h-02-champagne', n: '০২', bn: 'শ্যাম্পেন গোল্ড', en: 'CHAMPAGNE GOLD', line: 'পুরো সোনালি কেস ও ব্রেসলেট', vo: 'c2_champagne' },
  { slug: 'set-h-03-black', n: '০৩', bn: 'কালো', en: 'BLACK', line: 'কালো ডায়াল, টু-টোন কেস', vo: 'c3_black' },
  { slug: 'set-h-04-silver', n: '০৪', bn: 'সিলভার', en: 'SILVER', line: 'হালকা ক্রিম-সিলভার ডায়াল', vo: 'c4_silver' },
  { slug: 'set-h-05-blue', n: '০৫', bn: 'রয়্যাল নীল', en: 'ROYAL BLUE', line: 'গাঢ় নীল, বোল্ড লুক', vo: 'c5_blue' },
  { slug: 'set-h-06-red', n: '০৬', bn: 'চেরি রেড', en: 'CHERRY RED', line: 'গভীর চেরি সানবার্স্ট', vo: 'c6_red' },
  { slug: 'set-h-07-black-steel', n: '০৭', bn: 'ব্ল্যাক স্টিল', en: 'BLACK STEEL', line: 'ফুল ব্ল্যাক PVD ফিনিশ', vo: 'c7_blacksteel' },
];

/* ─────────────────────────── canvas helpers */
function linen(ctx, w, h, alpha = 0.10, seed0 = 20261108) {
  const n = createCanvas(w, h), nx = n.getContext('2d');
  const img = nx.createImageData(w, h);
  let seed = seed0;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    const i = (y * w + x) * 4;
    const v = 128 + Math.sin(x * 1.3) * 2.6 + Math.sin(y * 1.9) * 2.8 + (rnd() - 0.5) * 12;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(n, 0, 0); ctx.restore();
}

/**
 * Swung drapery — the ladies' sets use a soft fabric backdrop; for the men's set
 * the folds are wider and the light comes from one side so the folds stay quiet.
 */
function drapery(ctx, { dark = false } = {}) {
  const c0 = dark ? '#232930' : C.sand0;
  const c1 = dark ? '#12171C' : C.sand1;
  const c2 = dark ? '#05070A' : C.sand2;

  const lg = ctx.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, c0); lg.addColorStop(0.5, c1); lg.addColorStop(1, c2);
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);

  // the drape: a fan of long soft-edged folds, stronger than a plain gradient so
  // the backdrop reads as fabric and not as a colour field
  const bands = dark ? 7 : 9;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const x = -W * 0.25 + t * W * 1.5 + Math.sin(i * 1.7) * 40;
    const wdt = 90 + ((i * 37) % 130);
    const g = ctx.createLinearGradient(x - wdt, 0, x + wdt, 0);
    const hi = dark ? 'rgba(168,188,208,0.20)' : 'rgba(255,254,250,0.72)';
    const lo = dark ? 'rgba(0,0,0,0.42)' : 'rgba(138,122,100,0.42)';
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.32, hi);
    g.addColorStop(0.55, 'rgba(0,0,0,0)');
    g.addColorStop(0.78, lo);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.filter = 'blur(38px)';
    ctx.fillStyle = g;
    // the folds lean slightly, like cloth hanging from one side
    ctx.translate(x, 0);
    ctx.transform(1, 0, 0.10, 1, 0, 0);
    ctx.fillRect(-wdt, 0, wdt * 2, H);
    ctx.restore();
  }

  // softbox pool, upper-left — matches the direction the plates were lit from
  const rg = ctx.createRadialGradient(W * 0.33, H * 0.24, 0, W * 0.33, H * 0.24, W * 1.2);
  rg.addColorStop(0, dark ? 'rgba(150,170,192,0.18)' : 'rgba(255,255,250,0.92)');
  rg.addColorStop(0.46, dark ? 'rgba(90,105,122,0.06)' : 'rgba(249,244,235,0.34)');
  rg.addColorStop(1, dark ? 'rgba(0,0,0,0)' : 'rgba(172,158,136,0.30)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  // contact pool under the watch so the product sits IN the scene
  const pg = ctx.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, W * 0.52);
  pg.addColorStop(0, dark ? 'rgba(190,205,220,0.07)' : 'rgba(255,255,252,0.42)');
  pg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = pg; ctx.fillRect(0, 0, W, H);

  linen(ctx, W, H, dark ? 0.055 : 0.11);
}

/**
 * Place a watch plate so the whole product is visible and its stage melts into
 * the card. The plates already sit on the same gradient, so a radial feather
 * around the watch reads as the drapery continuing behind it.
 */
function placeWatch(ctx, im, { cx, cy, h, feather = 0.62, shadow = true }) {
  const k = h / im.height;
  const w = im.width * k;
  const x = cx - w / 2, y = cy - h / 2;

  if (shadow) {
    ctx.save();
    ctx.filter = 'blur(38px)';
    ctx.fillStyle = 'rgba(60,48,36,0.20)';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.965, w * 0.30, h * 0.028, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // feathered plate: a radial mask for the body plus a hard border ramp, so the
  // plate's rectangular edge can never show on the drapery
  const cw = Math.round(w), ch = Math.round(h);
  const c = createCanvas(cw, ch);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(im, 0, 0, cw, ch);
  g.globalCompositeOperation = 'destination-in';

  const rg = g.createRadialGradient(cw / 2, ch * 0.46, cw * 0.15,
    cw / 2, ch * 0.46, Math.max(cw, ch) * feather);
  rg.addColorStop(0, 'rgba(0,0,0,1)');
  rg.addColorStop(0.58, 'rgba(0,0,0,1)');
  rg.addColorStop(0.78, 'rgba(0,0,0,0.82)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, cw, ch);

  const F = 0.20;
  const hg = g.createLinearGradient(0, 0, cw, 0);
  hg.addColorStop(0, 'rgba(0,0,0,0)');
  hg.addColorStop(F, 'rgba(0,0,0,1)');
  hg.addColorStop(1 - F, 'rgba(0,0,0,1)');
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hg; g.fillRect(0, 0, cw, ch);

  const vg = g.createLinearGradient(0, 0, 0, ch);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(0.12, 'rgba(0,0,0,1)');
  vg.addColorStop(0.90, 'rgba(0,0,0,1)');
  vg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = vg; g.fillRect(0, 0, cw, ch);
  g.globalCompositeOperation = 'source-over';

  ctx.drawImage(c, x, y);
}

/** group row: feather all four edges so the plate never shows a rectangle */
function placeRow(ctx, im, { y, w, h }) {
  const k = Math.min(w / im.width, h / im.height);
  const dw = Math.round(im.width * k), dh = Math.round(im.height * k);
  const c = createCanvas(dw, dh);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(im, 0, 0, dw, dh);
  g.globalCompositeOperation = 'destination-in';
  const F = 0.07;
  const hg = g.createLinearGradient(0, 0, dw, 0);
  hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(F, 'rgba(0,0,0,1)');
  hg.addColorStop(1 - F, 'rgba(0,0,0,1)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hg; g.fillRect(0, 0, dw, dh);
  const vg = g.createLinearGradient(0, 0, 0, dh);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.16, 'rgba(0,0,0,1)');
  vg.addColorStop(0.84, 'rgba(0,0,0,1)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = vg; g.fillRect(0, 0, dw, dh);
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(c, (W - dw) / 2, y);
  return dh;
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

function hairline(ctx, x, y, w, { dark = false } = {}) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, `rgba(176,141,79,${dark ? 0.9 : 0.85})`);
  g.addColorStop(1, 'rgba(176,141,79,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, 2.5);
}

function display(ctx, text, { x = X, y, size = 92, color = C.ink, maxW = WID, lh = 1.17, align = 'left' }) {
  ctx.font = `${size}px AnekXB`;
  const lines = wrap(ctx, text, `${size}px AnekXB`, maxW);
  const anchor = align === 'center' ? W / 2 : x;
  ctx.textAlign = align;
  lines.forEach((l, i) => {
    ctx.fillStyle = color;
    ctx.fillText(l, anchor, y + i * size * lh);
  });
  ctx.textAlign = 'left';
  return y + (lines.length - 1) * size * lh;
}

function body(ctx, text, { x = X, y, size = 33, color = '#5B6169', maxW = WID, lh = 1.6 }) {
  ctx.font = `${size}px HindMed`;
  ctx.fillStyle = color;
  const lines = wrap(ctx, text, `${size}px HindMed`, maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lh));
  return y + (lines.length - 1) * size * lh;
}

function pricePill(ctx, x, y, { size = 62, dark = false, strong = false } = {}) {
  const label = `৳${PRICE}`;
  ctx.font = `${size}px AnekXB`;
  const w = ctx.measureText(label).width + 62, h = size * 1.62;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.fillRect(x, y, w, h);
  if (strong) { ctx.fillStyle = C.ink; ctx.fill(); ctx.fillStyle = C.brass; }
  else {
    ctx.fillStyle = dark ? 'rgba(176,141,79,.16)' : 'rgba(255,252,246,.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(176,141,79,.62)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = dark ? C.brass : C.ink;
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 31, y + h / 2 + size * 0.05);
  ctx.textBaseline = 'alphabetic';
  return h;
}

function cardShell(ctx, { dark = false } = {}) {
  drapery(ctx, { dark });
  // inner frame: a single brass hairline, the men's sets' quiet signature
  ctx.strokeStyle = dark ? 'rgba(176,141,79,0.28)' : 'rgba(176,141,79,0.30)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(34.5, 34.5, W - 69, H - 69);
}

/* ─────────────────────────── cards */

/* 1 · HOOK — the set, whole, one row, price under it */
async function sceneHook() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g);

  spaced(g, 'MIQA · STEEL DAYLIGHT', W / 2, 150, 'MontSB', 22, C.steel, 7, 'center');
  hairline(g, W / 2 - 90, 178, 180);

  const grp = await loadImage(GRP);
  placeRow(g, grp, { y: 300, w: W - 20, h: 720 });

  const y = display(g, 'ছেলেদের স্পেশাল\nঘড়ির কালেকশন', { y: 1230, size: 104, lh: 1.16 });
  body(g, 'সাতটি ফিনিশ · একই কেস · একই দাম', { y: y + 88, size: 37 });
  pricePill(g, W / 2 - 118, y + 152, { size: 88, strong: true });
  spaced(g, '7 COLOURWAYS', W / 2, 1790, 'MontSB', 21, C.steel, 6, 'center');
  return c;
}

/* 2 · REVEAL — the set on a swung drape, named one by one */
async function sceneReveal() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g);

  spaced(g, 'THE COLLECTION', X, 190, 'MontSB', 22, C.steel, 6);
  display(g, 'একই ঘড়ি,\nসাতটি মেজাজ', { y: 300, size: 96, lh: 1.16 });

  const grp = await loadImage(GRP);
  placeRow(g, grp, { y: 620, w: W - 10, h: 780 });

  // names in order, as a two-line ledger
  const names = CW.map((w) => w.bn);
  let nx = X, ny = 1560;
  g.font = '28px HindMed';
  names.forEach((n, i) => {
    const wdt = g.measureText(n).width;
    if (nx + wdt > W - X) { nx = X; ny += 54; }
    g.fillStyle = C.ink2; g.fillText(n, nx, ny);
    nx += wdt + 18;
    if (i < names.length - 1) { g.fillStyle = 'rgba(176,141,79,.9)'; g.fillText('·', nx - 12, ny); nx += 14; }
  });
  hairline(g, X, ny + 46, 240);
  pricePill(g, X, ny + 74, { size: 72 });
  return c;
}

/* 3–9 · one colourway per card, whole watch, own composition */
async function colourCard(i) {
  const w = CW[i];
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g);

  const plate = await loadImage(`${STAGE}/${
    ['p01_green.png', 'p02_champagne.png', 'p05_black.png', 'p04_silver.png',
      'p06_blue.png', 'p07_red.png', 'p07_blacksteel.png'][i]}`);

  // alternate the composition so seven cards never look like one repeated layout
  // champagne and silver sit smaller inside their plates, so their boxes are
  // pushed up a notch — the watch then reads the same size on every card
  const variants = [
    { watchH: 1400, cx: W / 2, cy: 900, nameY: 1600, subY: 1682 },
    { watchH: 1460, cx: W * 0.5, cy: 890, nameY: 1600, subY: 1682 },
    { watchH: 1420, cx: W * 0.52, cy: 900, nameY: 1610, subY: 1692 },
    { watchH: 1470, cx: W * 0.48, cy: 890, nameY: 1600, subY: 1682 },
    { watchH: 1430, cx: W * 0.5, cy: 895, nameY: 1605, subY: 1687 },
    { watchH: 1410, cx: W * 0.51, cy: 890, nameY: 1600, subY: 1682 },
    { watchH: 1440, cx: W * 0.5, cy: 900, nameY: 1615, subY: 1697 },
  ];
  const v = variants[i];

  // number + english label at the top
  spaced(g, `${w.n} / ০৭`, X, 150, 'AnekSB', 26, C.brass, 4);
  spaced(g, w.en, W - X, 150, 'MontSB', 22, C.steel, 6, 'right');

  placeWatch(g, plate, { cx: v.cx, cy: v.cy, h: v.watchH });

  hairline(g, X, v.nameY - 96, 210);
  display(g, w.bn, { y: v.nameY, size: 92 });
  body(g, w.line, { y: v.subY, size: 34 });
  return c;
}

/* 10 · LOCK — the clasp as the hero, watch still whole in a small inset */
async function sceneLock() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g);

  spaced(g, 'FEATURE 01', X, 190, 'MontSB', 22, C.steel, 6);
  display(g, 'রোলেক্স লক', { y: 300, size: 96 });
  body(g, 'ক্ল্যাশে উঁচু ক্রাউন এমবস, ভেতরে হিডেন —\nবাইরে থেকে লিংকগুলো একটানা দেখায়।', { y: 380, size: 32, maxW: 900 });

  const lock = await loadImage(`${WEB}/set-h_shared_lock.jpg`);
  const R = 330, cx = W / 2, cy = 900;
  g.save();
  g.shadowColor = 'rgba(50,40,30,.22)'; g.shadowBlur = 54; g.shadowOffsetY = 22;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = C.paper; g.fill();
  g.restore();
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  g.imageSmoothingQuality = 'high';
  g.drawImage(lock, cx - R, cy - R, R * 2, R * 2);
  g.restore();
  g.strokeStyle = C.brass; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,252,246,.75)'; g.lineWidth = 9;
  g.beginPath(); g.arc(cx, cy, R + 8, 0, Math.PI * 2); g.stroke();

  const green = await loadImage(`${STAGE}/p02_champagne.png`);
  placeWatch(g, green, { cx: W / 2, cy: 1545, h: 560, shadow: false, feather: 0.72 });
  return c;
}

/* 11 · PROMISE — three claims, ledger cards */
async function scenePromise() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g);

  spaced(g, 'THE PROMISE', X, 200, 'MontSB', 22, C.steel, 6);
  display(g, 'কেনা নিশ্চিন্তে', { y: 320, size: 92 });

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
    g.fillStyle = 'rgba(255,252,246,.80)'; g.fill();
    g.strokeStyle = 'rgba(176,141,79,.34)'; g.lineWidth = 2; g.stroke();
    g.restore();
    g.font = '44px AnekSB'; g.fillStyle = C.ink; g.fillText(title, X + 52, y);
    g.font = '28px HindMed'; g.fillStyle = '#5B6169'; g.fillText(sub, X + 52, y + 54);
    g.strokeStyle = C.brass; g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath();
    const tx = X + WID - 96, ty = y - 18;
    g.moveTo(tx, ty + 6); g.lineTo(tx + 13, ty + 19); g.lineTo(tx + 34, ty - 8);
    g.stroke();
    y += 244;
  }

  body(g, 'সাথে ওয়াটার রেজিস্ট্যান্স আর রোলেক্স লক — সব একই ঘড়িতে।', { y: 1340, size: 32, maxW: WID });

  // the bracelet macro as a deliberate full-width band (crop chosen so the
  // links read as a texture strip, never as a half-cut watch)
  const br = await loadImage(`${WEB}/set-h-02-champagne_4_bracelet.jpg`);
  const bh = 300, by = 1420;
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(X, by, WID, bh, 14); else g.rect(X, by, WID, bh);
  g.clip();
  g.imageSmoothingQuality = 'high';
  const src = { x: 160, y: 300, w: 1280, h: 420 };
  const k = Math.max(WID / src.w, bh / src.h);
  g.drawImage(br, src.x, src.y, src.w, src.h,
    X + (WID - src.w * k) / 2, by + (bh - src.h * k) / 2, src.w * k, src.h * k);
  g.restore();
  g.strokeStyle = 'rgba(176,141,79,.30)'; g.lineWidth = 1.4;
  g.beginPath();
  if (g.roundRect) g.roundRect(X, by, WID, bh, 14); else g.rect(X, by, WID, bh);
  g.stroke();
  return c;
}

/* 12 · 5% — dark plate, brass seal */
async function sceneFive() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g, { dark: true });

  const cx = W / 2, cy = 780, R = 280;
  g.strokeStyle = 'rgba(176,141,79,.80)'; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1.4; g.strokeStyle = 'rgba(176,141,79,.42)';
  g.beginPath(); g.arc(cx, cy, R - 20, 0, Math.PI * 2); g.stroke();

  g.textAlign = 'center';
  g.font = '112px AnekXB'; g.fillStyle = C.brass;
  g.fillText('৫%', cx, cy + 26);
  spaced(g, 'FOR THE CHILDREN', cx, cy + 90, 'MontSB', 22, 'rgba(255,252,246,.60)', 7, 'center');
  g.textAlign = 'left';

  display(g, 'MIQA-এর মুনাফার ৫%\nপথশিশুদের কল্যাণে।', { y: 1300, size: 74, color: '#FFFCF6', lh: 1.24 });
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', X, 1700, 'MontSB', 22, 'rgba(176,141,79,.9)', 6);
  return c;
}

/* 13 · CTA — the row, the price, the exact instruction */
async function sceneCTA() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  cardShell(g, { dark: true });

  const grp = await loadImage(GRP);
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(X, 196, WID, 380, 14); else g.rect(X, 196, WID, 380);
  g.clip();
  g.fillStyle = 'rgba(255,252,246,.06)'; g.fill();
  g.imageSmoothingQuality = 'high';
  const kk = Math.min((WID - 20) / grp.width, 360 / grp.height);
  g.drawImage(grp, (W - grp.width * kk) / 2, 196 + (380 - grp.height * kk) / 2,
    grp.width * kk, grp.height * kk);
  g.restore();
  g.strokeStyle = 'rgba(176,141,79,.30)'; g.lineWidth = 1.4;
  g.beginPath();
  if (g.roundRect) g.roundRect(X, 196, WID, 380, 14); else g.rect(X, 196, WID, 380);
  g.stroke();

  spaced(g, 'MIQA · MONTVARE', W / 2, 700, 'MontSB', 24, 'rgba(176,141,79,.95)', 7, 'center');
  display(g, 'আজই অর্ডার করুন', { y: 840, size: 96, color: '#FFFCF6' });

  g.font = '146px AnekXB'; g.fillStyle = C.brass;
  const pw = g.measureText(`৳${PRICE}`).width;
  g.fillText(`৳${PRICE}`, X, 1050);
  g.font = '33px HindMed'; g.fillStyle = 'rgba(255,252,246,.72)';
  g.fillText('সাতটি রঙ · একই দাম', X + pw + 26, 1040);

  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(X, 1120, 430, 92, 46); else g.rect(X, 1120, 430, 92);
  g.fillStyle = 'rgba(176,141,79,.14)'; g.fill();
  g.strokeStyle = 'rgba(176,141,79,.6)'; g.lineWidth = 2; g.stroke();
  g.restore();
  g.font = '37px AnekSB'; g.fillStyle = '#FFFCF6';
  g.fillText('ক্যাশ অন ডেলিভারি', X + 34, 1180);

  g.font = '35px HindMed'; g.fillStyle = 'rgba(255,252,246,.86)';
  const lines = wrap(g, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন।', '35px HindMed', WID);
  lines.forEach((l, i) => g.fillText(l, X, 1310 + i * 56));

  const by = 1470, bh = 128;
  g.save();
  g.beginPath();
  if (g.roundRect) g.roundRect(X, by, WID, bh, bh / 2); else g.rect(X, by, WID, bh);
  g.fillStyle = C.brass; g.fill();
  g.restore();
  g.fillStyle = C.obs; g.font = '43px AnekXB'; g.textAlign = 'center';
  g.fillText('এখনই অর্ডার করুন', W / 2, by + 82);

  for (let i = 0; i < 3; i++) {
    const a = 0.85 - i * 0.26;
    g.strokeStyle = `rgba(176,141,79,${a})`; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath();
    const yy = 1670 + i * 32;
    g.moveTo(W / 2 - 25, yy); g.lineTo(W / 2, yy + 22); g.lineTo(W / 2 + 25, yy);
    g.stroke();
  }
  g.textAlign = 'left';
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', X, 1840, 'MontSB', 21, 'rgba(255,252,246,.42)', 5);
  return c;
}

/* ─────────────────────────── timeline + render */
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

  const chords = [
    [146.83, 196.00, 246.94],  // Dm
    [174.61, 220.00, 261.63],  // F
    [196.00, 246.94, 293.66],  // G
    [130.81, 196.00, 261.63],  // C
  ];
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
    const trem = 0.88 + 0.12 * Math.sin(2 * Math.PI * 0.075 * t);
    v *= trem * Math.min(1, t / 1.8) * Math.min(1, (seconds - t) / 2.6) * 0.045;
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
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, smp[i] * gn)) * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path, buf);
}

async function main() {
  fs.mkdirSync(OUTD, { recursive: true });
  fs.mkdirSync(`${BASE}/work`, { recursive: true });

  if (process.env.CARDS_ONLY) {
    fs.mkdirSync(`${BASE}/work/cards2`, { recursive: true });
    for (let i = 0; i < SCENES.length; i++) {
      const c = await SCENES[i]();
      fs.writeFileSync(`${BASE}/work/cards2/${String(i + 1).padStart(2, '0')}.png`, c.toBuffer('image/png'));
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

  const wav = `${BASE}/work/bed2.wav`;
  writeBed(wav, total, starts.slice(1));

  /* pass 1 — video only */
  const tmpVideo = `${BASE}/work/video-only2.mp4`;
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

  /* pass 2 — voice + bed, then mux */
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
  filters.push(
    `${amixIn.join('')}amix=inputs=${amixIn.length}:duration=longest,` +
    `volume=${amixIn.length},alimiter=limit=0.94,aresample=48000[aout]`
  );
  const tmpAudio = `${BASE}/work/mix2.m4a`;
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
