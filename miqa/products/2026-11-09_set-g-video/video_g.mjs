/**
 * Set G — "Steel Night" launch video (1080×1920, 30 fps, ≈42 s).
 *
 * Theme: Steel Daylight for the light cards, Midnight Precision (obsidian)
 * for the hook / lock / quality / CTA cards. Type: AnekBangla (display) +
 * HindSiliguri (body) + Montserrat (latin labels), brass #C9A45C for price.
 *
 * Motion: one idea per frame, hard-edge right→left slide (no crossfade, no
 * flash), 2 % push-in inside a card. Silent-friendly: every claim is on screen.
 *
 * Copy rules: butterfly lock · water resistant · quality: good · ৳৮৫০ ·
 * 1-year warranty · colour guarantee · 7-day replacement. Nothing else.
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import { spawn } from 'child_process';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-Bold.ttf`, 'AnekB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const IMG = 'miqa/deliveries/2026-11-09_set-g-video/website';
const OUT = 'miqa/deliveries/2026-11-09_set-g-video/miqa-set-g-steel-night_1080x1920.mp4';
const W = 1080, H = 1920, FPS = 30;
const C = {
  ink: '#14181D', ink2: '#2C333A', steel: '#8A939B', brass: '#C9A45C',
  stage1: '#FAF8F4', stage2: '#F0ECE4', stage3: '#DFD9D0', obs: '#0B0D10',
  paper: '#FFFDF9',
};
const SLIDE = 0.42; // seconds of hard-edge slide

/* ───────────────────────────────────────────── stage helpers */
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
  const lg = g.createLinearGradient(0, 0, W * .4, H);
  lg.addColorStop(0, '#14181D'); lg.addColorStop(.62, C.obs); lg.addColorStop(1, '#07090B');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .5, H * .40, 0, W * .5, H * .40, W * .95);
  rg.addColorStop(0, 'rgba(201,164,92,0.14)');
  rg.addColorStop(.55, 'rgba(138,147,155,0.05)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return c;
}

/** feather a placed image so its own stage blends into the card stage */
function feathered(target, im, { x, y, w, h, src = null, fx = .12, fy = .12, radial = .72, alpha = 1 }) {
  const buf = createCanvas(w, h), b = buf.getContext('2d');
  b.imageSmoothingQuality = 'high';
  if (src) b.drawImage(im, src[0], src[1], src[2], src[3], 0, 0, w, h);
  else b.drawImage(im, 0, 0, w, h);

  const gx = b.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(fx, 'rgba(0,0,0,1)');
  gx.addColorStop(1 - fx, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
  const gy = b.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(fy, 'rgba(0,0,0,1)');
  gy.addColorStop(1 - fy, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
  b.globalCompositeOperation = 'destination-in';
  b.fillStyle = gx; b.fillRect(0, 0, w, h);
  b.fillStyle = gy; b.fillRect(0, 0, w, h);
  if (radial > 0) {
    const rg = b.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .24, w / 2, h / 2, Math.max(w, h) * radial);
    rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(.7, 'rgba(0,0,0,.96)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = rg; b.fillRect(0, 0, w, h);
  }
  b.globalCompositeOperation = 'source-over';
  target.save();
  if (alpha < 1) target.globalAlpha = alpha;
  target.drawImage(buf, x, y);
  target.restore();
}

/** cover-crop into a rect */
function cover(target, im, x, y, w, h, src = null, alpha = 1) {
  const [sx, sy, sw, sh] = src || [0, 0, im.width, im.height];
  const k = Math.max(w / sw, h / sh);
  const dw = sw * k, dh = sh * k;
  target.save();
  if (alpha < 1) target.globalAlpha = alpha;
  target.imageSmoothingQuality = 'high';
  target.drawImage(im, sx, sy, sw, sh, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  target.restore();
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

/* ───────────────────────────────────────────── card factory */
const X = 88;
const WID = W - X * 2;

function eyebrow(ctx, txt, y, light = false) {
  ctx.fillStyle = C.brass; ctx.fillRect(X, y - 24, 46, 3);
  spaced(ctx, txt, X, y + 16, 'MontSB', 24, light ? 'rgba(255,253,249,.60)' : C.steel, 5);
}

function priceBadge(ctx, x, y, { dark = false, size = 60 } = {}) {
  const label = '৳৮৫০';
  ctx.font = `${size}px AnekXB`;
  const w = ctx.measureText(label).width + 58, h = size * 1.62;
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, h / 2); } else ctx.fillRect(x, y, w, h);
  ctx.fillStyle = dark ? 'rgba(201,164,92,.14)' : 'rgba(20,24,29,.045)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,164,92,.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.brass; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 30, y + h / 2 + size * 0.06);
  ctx.textBaseline = 'alphabetic';
  return w;
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

const rgba0 = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
};
function fadeEdge(ctx, im, { h, to, y = 0, src = null, fade = 0.30 }) {
  cover(ctx, im, 0, y, W, h, src, 1);
  const g = ctx.createLinearGradient(0, y + h * (1 - fade), 0, y + h);
  g.addColorStop(0, rgba0(to));
  g.addColorStop(1, to);
  ctx.fillStyle = g;
  ctx.fillRect(0, y + h * (1 - fade) - 1, W, h * fade + 2);
}

/** warm wash over a photo band so the still's own stage matches ours */
function glaze(ctx, { h, y = 0, a = 0.16 }) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(252,250,245,${a * 0.7})`);
  g.addColorStop(1, `rgba(240,236,228,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, y, W, h);
}

/* ───────────────────────────────────────────── the cards */

async function hookCard() {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g_shared_group.jpg`);
  // fitted, not cover: all five watches stay in frame, edges feathered
  // the group plate has a hard top/bottom edge in its own stage — feather those,
  // and crop to the row of watches only (measured: y 400…1360 of 1600)
  feathered(g, im, {
    x: 0, y: 330, w: W, h: 648, src: [0, 400, 1600, 960],
    fx: 0.02, fy: 0.16, radial: 0.92,
  });
  glaze(g, { y: 330, h: 648, a: 0.22 });

  eyebrow(g, 'MIQA · STEEL NIGHT · FOR MEN', 1270);
  g.fillStyle = C.ink; g.font = '104px AnekXB';
  g.fillText('৫টি ফিনিশ', X, 1400);
  g.font = '36px AnekSB'; g.fillStyle = '#3A4249';
  g.fillText('একই কেস · একই ব্রেসলেট · একই দাম', X, 1462);

  g.font = '28px AnekSB'; g.fillStyle = C.ink2;
  g.fillText('বাটারফ্লাই লক', X, 1544);
  tick(g, X + 236, 1535);
  g.fillText('ওয়াটার রেজিস্ট্যান্ট', X + 278, 1544);
  tick(g, X + 560, 1535);
  g.fillText('কোয়ালিটি: Good', X + 602, 1544);

  priceBadge(g, X, 1592, { size: 56 });
  g.font = '30px HindSB'; g.fillStyle = C.steel;
  g.fillText('ছেলেদের হাতঘড়ি', X + 250, 1640);

  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'STEEL NIGHT · FIVE FINISHES', X, 1800, 'MontSB', 22, C.steel, 6);
  return c;
}

async function colourCard(p, idx) {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/${p.slug}_1_main.jpg`);
  // crop: the watch only — the printed caption at the bottom of the still is cut
  fadeEdge(g, im, { h: 1210, to: C.stage2, fade: 0.24, src: [150, 20, 1300, 1160] });
  glaze(g, { h: 1210, a: 0.14 });

  g.fillStyle = C.ink; g.font = '76px AnekXB';
  g.fillText(p.bn, X, 1300);
  priceBadge(g, W - X - 232, 1240, { size: 50 });

  g.font = '34px HindR'; g.fillStyle = '#3A4249';
  wrap(g, p.one, '34px HindR', WID - 60).slice(0, 2).forEach((l, i) => g.fillText(l, X, 1362 + i * 48));

  g.fillStyle = 'rgba(20,24,29,.10)'; g.fillRect(X, 1478, WID, 2);

  g.font = '30px AnekSB'; g.fillStyle = C.ink2;
  g.fillText('বাটারফ্লাই লক', X, 1540);
  g.fillText('ওয়াটার রেজিস্ট্যান্ট', X, 1586);
  spaced(g, p.en.toUpperCase(), X, 1640, 'MontSB', 24, C.steel, 5);

  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, `FOR MEN · 0${idx} / 05 · QUALITY: GOOD`, X, 1800, 'MontSB', 22, C.steel, 5);
  return c;
}

async function macroCard(p, idx, shot, label, sub) {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/${p.slug}_${shot}.jpg`);
  fadeEdge(g, im, { h: 1240, to: C.stage2, fade: 0.26 });

  eyebrow(g, `STEEL NIGHT · 0${idx} / 05`, 1350);
  g.fillStyle = C.ink; g.font = '72px AnekXB';
  g.fillText(label, X, 1470);
  g.font = '32px HindR'; g.fillStyle = '#3A4249';
  wrap(g, sub, '32px HindR', WID).slice(0, 2).forEach((l, i) => g.fillText(l, X, 1532 + i * 46));

  g.font = '26px AnekSB'; g.fillStyle = C.steel;
  g.fillText(`${p.bn} · ৳৮৫০`, X, 1670);
  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'MIQA', X, 1800, 'MontSB', 22, C.steel, 8);
  return c;
}

function darkHead(g, eyebrowTxt, headline, lines, footerTxt) {
  eyebrow(g, eyebrowTxt, 1310, true);
  g.fillStyle = '#F6F3EC'; g.font = '84px AnekXB';
  g.fillText(headline, X, 1440);
  g.font = '34px HindR'; g.fillStyle = 'rgba(246,243,236,.74)';
  (lines || []).forEach((l, i) => g.fillText(l, X, 1510 + i * 50));
  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, footerTxt, X, 1800, 'MontSB', 22, 'rgba(246,243,236,.46)', 6);
}

async function lockCard() {
  const c = darkStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-04-gold-navy_4_bracelet.jpg`);
  fadeEdge(g, im, { h: 1240, to: C.obs, fade: 0.28, src: [120, 60, 1360, 1360] });
  darkHead(g, 'BATTERFLY LOCK', 'বাটারফ্লাই লক',
    ['দুই পাশ থেকে ভাঁজ হয়ে বন্ধ হয়', '৫-লিংক জুবিলি ব্রেসলেট'],
    'BATTERFLY LOCK · ৳৮৫০');
  return c;
}

async function waterCard() {
  const c = lightStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-03-twotone-slate_5_wrist.jpg`);
  fadeEdge(g, im, { h: 1240, to: C.stage2, fade: 0.28 });

  eyebrow(g, 'WATER RESISTANT', 1350);
  g.fillStyle = C.ink; g.font = '78px AnekXB';
  g.fillText('ওয়াটার রেজিস্ট্যান্ট', X, 1478);
  g.font = '32px HindR'; g.fillStyle = '#3A4249';
  g.fillText('হাত ধোয়া, বৃষ্টি, ঘাম — সাধারণ ব্যবহারে নিরাপদ।', X, 1540);
  g.font = '26px AnekSB'; g.fillStyle = C.steel;
  g.fillText('পানিতে ডুবিয়ে ব্যবহারের জন্য নয়', X, 1606);
  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'STEEL NIGHT · ৳৮৫০', X, 1800, 'MontSB', 22, C.steel, 6);
  return c;
}

async function qualityCard() {
  const c = darkStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-02-twotone-navy_3_dial.jpg`);
  fadeEdge(g, im, { h: 1240, to: C.obs, fade: 0.30, src: [80, 40, 1440, 1440] });
  darkHead(g, 'QUALITY', 'কোয়ালিটি: Good',
    ['ডায়ালে XII ও VI, পাথর বসানো মার্কার', '৩টার ঘরে তারিখ, ম্যাগনিফায়ার সহ'],
    'QUALITY: GOOD · FOR MEN');
  return c;
}

async function warrantyCard() {
  const c = lightStage(), g = c.getContext('2d');
  eyebrow(g, 'MIQA PROMISE', 250);
  g.fillStyle = C.ink; g.font = '88px AnekXB';
  g.fillText('৳৮৫০-এ যা যা', X, 390);
  g.fillText('পাচ্ছেন', X, 490);

  const rows = [['১ বছর', 'ওয়ারেন্টি'], ['কালার', 'গ্যারেন্টি'], ['৭ দিন', 'রিপ্লেসমেন্ট'], ['ক্যাশ অন', 'ডেলিভারি']];
  let y = 640;
  for (const [a, b] of rows) {
    g.fillStyle = 'rgba(20,24,29,.08)'; g.fillRect(X, y, WID, 2);
    g.fillStyle = C.ink; g.font = '64px AnekXB';
    g.fillText(a, X, y + 96);
    g.fillStyle = '#3A4249'; g.font = '44px AnekSB';
    g.fillText(b, X + 330, y + 96);
    tick(g, W - X - 40, y + 74, C.brass, 18);
    y += 232;
  }
  g.fillStyle = 'rgba(20,24,29,.08)'; g.fillRect(X, y, WID, 2);

  g.font = '30px HindSB'; g.fillStyle = C.ink2;
  g.fillText('ক্যাশ অন ডেলিভারি — হাতে পেয়ে টাকা দিবেন', X, 1694);
  g.fillStyle = C.brass; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'STEEL NIGHT · 1 YEAR WARRANTY', X, 1800, 'MontSB', 22, C.steel, 5);
  return c;
}

async function ctaCard() {
  const c = darkStage(), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-01-black_2_angle.jpg`);
  fadeEdge(g, im, { h: 1180, to: C.obs, fade: 0.30, src: [120, 30, 1360, 1300] });

  eyebrow(g, 'ORDER NOW', 1250, true);
  g.fillStyle = C.brass; g.font = '168px AnekXB';
  g.fillText('৳৮৫০', X, 1430);
  g.font = '38px HindSB'; g.fillStyle = 'rgba(246,243,236,.80)';
  g.fillText('ছেলেদের হাতঘড়ি · ৫টি ফিনিশ', X, 1496);
  g.font = '30px AnekSB'; g.fillStyle = C.brass;
  g.fillText('বাটারফ্লাই লক · ওয়াটার রেজিস্ট্যান্ট · কোয়ালিটি Good', X, 1552);

  const label = 'অর্ডার করতে মেসেজ দিন';
  g.font = '42px AnekSB';
  const pw = g.measureText(label).width + 92;
  g.beginPath();
  if (g.roundRect) { g.roundRect(X, 1592, pw, 100, 50); } else g.fillRect(X, 1592, pw, 100);
  g.fillStyle = C.brass; g.fill();
  g.fillStyle = '#1A1610'; g.textBaseline = 'middle';
  g.fillText(label, X + 46, 1646);
  g.textBaseline = 'alphabetic';

  g.fillStyle = 'rgba(201,164,92,.35)'; g.fillRect(X, 1740, WID, 2);
  spaced(g, 'MIQA · STEEL NIGHT', X, 1800, 'MontSB', 24, 'rgba(246,243,236,.55)', 6);
  return c;
}

/* ───────────────────────────────────────────── build cards */
const P = [
  { slug: 'set-g-01-black', bn: 'ব্ল্যাক নেভি', en: 'Black Navy', one: 'ব্ল্যাক কেস, ব্ল্যাক ব্রেসলেট, ভেতরে গাঢ় নেভি ডায়াল।' },
  { slug: 'set-g-02-twotone-navy', bn: 'টু-টোন রয়্যাল ব্লু', en: 'Two-Tone Royal Blue', one: 'সিলভার কেসে গোল্ড রেজেল, রয়্যাল ব্লু ডায়াল।' },
  { slug: 'set-g-03-twotone-slate', bn: 'টু-টোন স্লেট', en: 'Two-Tone Slate', one: 'সিলভার-গোল্ড কেসে ধূসর স্লেট ডায়াল।' },
  { slug: 'set-g-04-gold-navy', bn: 'গোল্ড রয়্যাল ব্লু', en: 'Gold Royal Blue', one: 'ফুল গোল্ড কেস, গাঢ় নীল ডায়াল — সবচেয়ে জমকালো।' },
  { slug: 'set-g-05-gold-champagne', bn: 'গোল্ড শ্যাম্পেন', en: 'Gold Champagne', one: 'ফুল গোল্ড কেসে শ্যাম্পেন ডায়াল, উষ্ণ ও হালকা।' },
];

const MACRO = [
  ['4_bracelet', '৫-লিংক জুবিলি', 'পলিশড মাঝের লিংক, ব্রাশড বাইরে — আলোয় দুই টেক্সচার।'],
  ['3_dial', 'সানবার্স্ট ডায়াল', 'XII ও VI রোমান, পাথর বসানো মার্কার, ম্যাগনিফায়ার-সহ তারিখ।'],
  ['2_angle', 'ফ্লুটেড রেজেল', 'চারপাশে খাঁজকাটা রেজেল — আলো পড়লে একটার পর একটা রেখা।'],
  ['5_wrist', 'হাতে পরে', 'শার্ট কাফের সাথে মিশে যায়, হালকা ও আরামদায়ক।'],
  ['4_bracelet', 'ব্রেসলেট ক্লোজ-আপ', 'পলিশড ও ব্রাশড লিংক, বাটারফ্লাই লক — দুই পাশ থেকে ভাঁজ।'],
];

const SPEC = []; // {canvas, dur, kind}

async function build() {
  const hook = await hookCard(); SPEC.push({ c: hook, d: 3.4, dark: true });
  for (let i = 0; i < P.length; i++) {
    SPEC.push({ c: await colourCard(P[i], i + 1), d: 2.6 });
    SPEC.push({ c: await macroCard(P[i], i + 1, MACRO[i][0], MACRO[i][1], MACRO[i][2]), d: 2.2 });
  }
  SPEC.push({ c: await lockCard(), d: 2.8, dark: true });
  SPEC.push({ c: await waterCard(), d: 2.4 });
  SPEC.push({ c: await qualityCard(), d: 2.2, dark: true });
  SPEC.push({ c: await warrantyCard(), d: 3.4 });
  SPEC.push({ c: await ctaCard(), d: 4.0, dark: true });
}

/* ───────────────────────────────────────────── audio bed */
function writeWav(path, seconds, cuts) {
  const SR = 48000;
  const n = Math.ceil(seconds * SR);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);

  // chord bed: Am F C G, one chord per 4 s, soft sines + slow tremolo
  const chords = [
    [220.0, 261.63, 329.63], [174.61, 220.0, 261.63],
    [196.0, 261.63, 329.63], [196.0, 246.94, 293.66],
  ];
  const cutSet = new Set(cuts.map((c) => Math.round(c * SR)));
  let peak = 0;
  const smp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.min(chords.length - 1, Math.floor(t / 4) % chords.length);
    let v = 0;
    for (let k = 0; k < 3; k++) {
      const f = chords[ci][k];
      v += Math.sin(2 * Math.PI * f * t) * 0.30
        + Math.sin(2 * Math.PI * f * 2.0 * t) * 0.055
        + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.10;
    }
    const trem = 0.82 + 0.18 * Math.sin(2 * Math.PI * 0.11 * t);
    const fadeIn = Math.min(1, t / 1.2);
    const fadeOut = Math.min(1, (seconds - t) / 1.8);
    v *= trem * fadeIn * fadeOut * 0.052;
    smp[i] = v;
  }
  // soft "tick" on every hard cut (short filtered noise burst)
  for (const cu of cuts) {
    const start = Math.round(cu * SR);
    const len = Math.round(0.10 * SR);
    let lp = 0;
    for (let j = 0; j < len && start + j < n; j++) {
      const env = Math.exp(-j / (0.022 * SR));
      lp += 0.22 * ((Math.random() * 2 - 1) - lp);
      smp[start + j] += lp * env * 0.11 + Math.sin(2 * Math.PI * 96 * (j / SR)) * env * 0.06;
    }
  }
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(smp[i]));
  const g = peak > 0 ? 0.72 / peak : 1;
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, smp[i] * g));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path, buf);
  return seconds;
}

/* ───────────────────────────────────────────── render */
const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

async function main() {
  await build();
  const FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg';

  const starts = [];
  let t = 0;
  for (const s of SPEC) { starts.push(t); t += s.d; }
  const total = t;

  const wav = 'miqa/products/2026-11-09_set-g-video/work/bed.wav';
  fs.mkdirSync('miqa/products/2026-11-09_set-g-video/work', { recursive: true });
  writeWav(wav, total, starts.slice(1));

  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0',
    '-i', wav,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.1', '-g', String(FPS * 2),
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart', OUT,
  ];
  const ff = spawn(FF, args, { stdio: ['pipe', 'inherit', 'pipe'] });
  ff.stderr.on('data', (d) => process.stdout.write('FF: ' + d));
  ff.stdin.on('error', (e) => console.log('STDIN ERR', e.message));
  ff.on('close', (c) => console.log('FF CLOSE', c));
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));

  const frame = createCanvas(W, H), fg = frame.getContext('2d');
  const totalFrames = Math.round(total * FPS);
  console.log(`cards=${SPEC.length}  duration=${total.toFixed(2)}s  frames=${totalFrames}`);

  const push = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });

  for (let f = 0; f < totalFrames; f++) {
    const at = f / FPS;
    let i = 0;
    while (i + 1 < SPEC.length && at >= starts[i + 1]) i++;
    const local = at - starts[i];
    const inCard = local / SPEC[i].d;
    const prev = i > 0 && local < SLIDE ? i - 1 : -1;

    fg.setTransform(1, 0, 0, 1, 0, 0);
    fg.fillStyle = SPEC[i].dark ? C.obs : C.stage2;
    fg.fillRect(0, 0, W, H);

    const scale = 1.0 + 0.02 * Math.min(1, inCard);
    const drawCard = (idx, dx) => {
      fg.save();
      fg.translate(W / 2 + dx, H / 2);
      fg.scale(scale, scale);
      fg.drawImage(SPEC[idx].c, -W / 2, -H / 2);
      fg.restore();
    };

    if (prev >= 0) {
      const p = easeOut(local / SLIDE);
      drawCard(prev, -W * p);
      drawCard(i, W * (1 - p));
    } else {
      drawCard(i, 0);
    }

    const raw = frame.data();   // raw RGBA pixels — no extra JS copy, no leak
    await push(raw);
    if (f % 120 === 0) console.log(`  ${f}/${totalFrames}  ${(f / FPS).toFixed(1)}s  ${(process.memoryUsage().rss / 1048576).toFixed(0)}MB`);
  }

  ff.stdin.end();
  await done;
  const st = fs.statSync(OUT);
  console.log('OUT', OUT, (st.size / 1048576).toFixed(1) + ' MB', total.toFixed(2) + 's');
}

process.on('exit', (c) => console.log('EXIT', c));
process.on('uncaughtException', (e) => console.log('UNCAUGHT', e));
process.on('unhandledRejection', (e) => console.log('UNHANDLED', e));
process.on('SIGTERM', () => console.log('SIGTERM'));
main().catch((e) => { console.error('MAIN', e); process.exit(1); });
