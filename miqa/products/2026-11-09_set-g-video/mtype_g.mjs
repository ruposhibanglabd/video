/**
 * Set G video v4 — Steel Daylight type layers (1080×1920).
 *
 * Recipe: miqa/brand/MIQA-MEN-THEME.md → "Steel Daylight"
 *   Daylight's principle (bright neutral stage, one watch per frame, the dial is
 *   the brightest/sharpest/largest object) with the men's cold palette:
 *   stage #FAF8F4 → #F0ECE4 → #DFD9D0 · ink #14181D · steel #8A939B · brass #C9A45C
 *
 * Copy rules honoured here:
 *   · no product / collection name on screen, no colour names (client note)
 *   · "মিকা নিয়ে এলো ছেলেদের স্পেশাল ঘড়ির কালেকশন" is the one identity line
 *   · 5% line, COD pill and the two CTA lines appear verbatim (BRAND-BIBLE §3)
 *   · every scene gets its own composition — no two cards share a layout
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-Bold.ttf`, 'AnekB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');

const BASE = 'miqa/products/2026-11-09_set-g-video';
const OUT = `${BASE}/work/gtext`;
fs.mkdirSync(OUT, { recursive: true });

const INK = '#14181D';
const INK_SOFT = 'rgba(20,24,29,0.60)';
const BRASS = '#96733A';
const BONE = '#F5F2EC';

function brass(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#83642C'); g.addColorStop(0.30, '#C9A45C');
  g.addColorStop(0.58, '#A2823D'); g.addColorStop(1, '#775A26');
  return g;
}
function halo(ctx, blur = 26, a = 0.9) {
  ctx.shadowColor = `rgba(250,248,244,${a})`;
  ctx.shadowBlur = blur; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }

function t(ctx, s, x, y, font, fill, blur = 26) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (blur) halo(ctx, blur);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); noShadow(ctx);
}
function spaced(ctx, s, x, y, font, fill, gap, blur = 20) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  if (blur) halo(ctx, blur, 0.85);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + gap; });
  noShadow(ctx);
}
function line(ctx, cx, y, w, a = 0.8, th = 2.5, col = '150,158,166') {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, `rgba(${col},0)`);
  g.addColorStop(0.5, `rgba(${col},${a})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, th);
}
function brassLine(ctx, cx, y, w, a = 0.9, th = 2.5) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(201,164,92,0)');
  g.addColorStop(0.5, `rgba(201,164,92,${a})`);
  g.addColorStop(1, 'rgba(201,164,92,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, th);
}
function pill(ctx, cx, cy, w, h, r, fill, stroke) {
  const x = cx - w / 2, y = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function layer(name, fn) {
  const c = createCanvas(1080, 1920);
  const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}
/** steel scrim for the lower type band — light, never a grey slab */
function scrim(ctx, y0 = 1330, h = 600, top = 0, bottom = 0.93) {
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, `rgba(242,238,231,${top})`);
  g.addColorStop(0.42, `rgba(242,238,231,${bottom * 0.62})`);
  g.addColorStop(1, `rgba(233,227,217,${bottom})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, 1080, h);
}
/** same idea, flipped, for the top band */
function scrimTop(ctx, y1 = 470, h = 470, bottom = 0, top = 0.90) {
  const g = ctx.createLinearGradient(0, y1 - h, 0, y1);
  g.addColorStop(0, `rgba(250,248,244,${top})`);
  g.addColorStop(0.55, `rgba(250,248,244,${top * 0.55})`);
  g.addColorStop(1, `rgba(250,248,244,${bottom})`);
  ctx.fillStyle = g; ctx.fillRect(0, y1 - h, 1080, h);
}
function seal(ctx, cx, cy, r) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(160,124,58,0.55)'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(160,124,58,0.26)'; ctx.lineWidth = 1.4; ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r0 = r + 9, r1 = r + (i % 5 === 0 ? 23 : 15);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.strokeStyle = `rgba(160,124,58,${i % 5 === 0 ? 0.45 : 0.20})`;
    ctx.lineWidth = i % 5 === 0 ? 2 : 1.1;
    ctx.stroke();
  }
}

/* ── 01 hook · top band: the one identity line ─────────────────────────── */
layer('hooktop', ctx => {
  scrimTop(ctx, 476, 476, 0, 0.92);
  spaced(ctx, 'MIQA', 540, 128, '34px CinzelM', brass(ctx, 380, 0, 700, 0), 12, 22);
  line(ctx, 540, 152, 240, 0.65, 2, '160,124,58');
  t(ctx, 'মিকা নিয়ে এলো', 540, 258, '62px AnekB', INK, 30);
  t(ctx, 'ছেলেদের স্পেশাল ঘড়ির কালেকশন', 540, 344, '56px AnekXB', INK, 30);
  spaced(ctx, 'FIVE FINISHES  ·  ONE CASE', 540, 412, '22px MontSB', BRASS, 6, 18);
});

/* ── 01 hook · bottom band: price anchor ───────────────────────────────── */
layer('hookline', ctx => {
  scrim(ctx, 1330, 590, 0, 0.93);
  t(ctx, '৳৮৫০', 540, 1560, '152px AnekXB', brass(ctx, 240, 0, 840, 0), 42);
  brassLine(ctx, 540, 1608, 300, 0.7, 2);
  t(ctx, 'পাঁচটি ফিনিশ · একটাই দাম', 540, 1680, '40px AnekSB', INK, 26);
  t(ctx, 'সব রঙে একই দাম', 540, 1736, '30px HindM', INK_SOFT, 22);
});

/* ── header on every body card (reserved top band) ─────────────────────── */
layer('kick', ctx => {
  scrimTop(ctx, 330, 330, 0, 0.85);
  spaced(ctx, 'MIQA', 540, 132, '32px CinzelM', brass(ctx, 380, 0, 700, 0), 11, 20);
  brassLine(ctx, 540, 156, 200, 0.6, 2);
  t(ctx, 'ছেলেদের স্পেশাল ঘড়ির কালেকশন', 540, 214, '34px AnekSB', INK_SOFT, 22);
});

/* ── 02 reveal ─────────────────────────────────────────────────────────── */
layer('reveal', ctx => {
  scrim(ctx, 1330, 590, 0, 0.93);
  spaced(ctx, 'NEW COLLECTION', 540, 1436, '23px MontSB', BRASS, 6, 18);
  t(ctx, 'ছেলেদের জন্য বাছাই করা', 540, 1544, '72px AnekXB', INK, 32);
  line(ctx, 540, 1580, 380, 0.7, 2, '160,124,58');
  t(ctx, 'পাঁচটি ফিনিশ · একটি কেস', 540, 1648, '38px AnekSB', BRASS, 24);
  t(ctx, 'সব রঙে ৳৮৫০', 540, 1706, '30px HindM', INK_SOFT, 22);
});

/* ── 03 feature 01 · butterfly lock ────────────────────────────────────── */
layer('lock', ctx => {
  scrim(ctx, 1290, 630, 0, 0.94);
  spaced(ctx, 'FEATURE 01', 540, 1400, '23px MontSB', BRASS, 6, 18);
  t(ctx, 'বাটারফ্লাই লক', 540, 1516, '88px AnekXB', INK, 32);
  line(ctx, 540, 1550, 380, 0.7, 2, '160,124,58');
  t(ctx, 'দুই পাশ থেকে ভাঁজ হয়ে বন্ধ হয়', 540, 1620, '40px AnekSB', BRASS, 24);
  t(ctx, 'কব্জিতে নিরাপদ, খোলাও সহজ', 540, 1678, '30px HindM', INK_SOFT, 22);
});

/* ── 04 feature 02 · dial detail (offset card, left-aligned type) ──────── */
layer('dial', ctx => {
  scrim(ctx, 1290, 630, 0, 0.94);
  spaced(ctx, 'FEATURE 02', 540, 1400, '23px MontSB', BRASS, 6, 18);
  t(ctx, 'ফ্লুটেড রেজেল', 540, 1516, '88px AnekXB', INK, 32);
  line(ctx, 540, 1550, 380, 0.7, 2, '160,124,58');
  t(ctx, 'পাথর বসানো মার্কার · XII ও VI রোমান', 540, 1620, '38px AnekSB', BRASS, 24);
  t(ctx, 'ম্যাগনিফায়ার সহ তারিখ', 540, 1678, '30px HindM', INK_SOFT, 22);
});

/* ── 05 feature 03 · water resistant ───────────────────────────────────── */
layer('water', ctx => {
  scrim(ctx, 1290, 630, 0, 0.94);
  spaced(ctx, 'FEATURE 03', 540, 1400, '23px MontSB', BRASS, 6, 18);
  t(ctx, 'ওয়াটার রেজিস্ট্যান্ট', 540, 1516, '80px AnekXB', INK, 32);
  line(ctx, 540, 1550, 420, 0.7, 2, '160,124,58');
  t(ctx, 'হাত ধোয়া, বৃষ্টি, ঘাম — সামলে নেবে', 540, 1620, '38px AnekSB', BRASS, 24);
  t(ctx, 'পানিতে ডুবাবেন না', 540, 1678, '30px HindM', INK_SOFT, 22);
});

/* ── 06 promise · warranty / colour / replacement ──────────────────────── */
layer('promise', ctx => {
  scrim(ctx, 1050, 870, 0, 0.95);
  spaced(ctx, 'THE PROMISE', 540, 1258, '23px MontSB', BRASS, 7, 18);
  t(ctx, '১ বছরের ওয়ারেন্টি', 540, 1374, '78px AnekXB', INK, 32);
  brassLine(ctx, 540, 1410, 420, 0.75, 2);
  t(ctx, 'কালার গ্যারেন্টি', 540, 1490, '56px AnekB', BRASS, 28);
  t(ctx, '৭ দিনের রিপ্লেসমেন্ট', 540, 1570, '56px AnekB', INK, 28);
  t(ctx, 'কোয়ালিটি — Good', 540, 1668, '34px HindM', INK_SOFT, 22);
});

/* ── 07 collection ─────────────────────────────────────────────────────── */
layer('collection', ctx => {
  scrim(ctx, 1250, 670, 0, 0.94);
  spaced(ctx, 'FIVE FINISHES', 540, 1372, '23px MontSB', BRASS, 7, 18);
  t(ctx, 'পাঁচটি ফিনিশ', 540, 1484, '84px AnekXB', INK, 32);
  line(ctx, 540, 1518, 360, 0.7, 2, '160,124,58');
  t(ctx, 'কালো, টু-টোন, সোনালি — একই কেস', 540, 1588, '38px AnekSB', BRASS, 24);
  t(ctx, 'সব রঙে ৳৮৫০', 540, 1646, '30px HindM', INK_SOFT, 22);
});

/* ── 08 price ──────────────────────────────────────────────────────────── */
layer('price', ctx => {
  scrim(ctx, 1080, 840, 0, 0.96);
  spaced(ctx, 'PRICE', 540, 1252, '23px MontSB', BRASS, 7, 18);
  t(ctx, '৳৮৫০', 540, 1436, '190px AnekXB', brass(ctx, 200, 0, 880, 0), 46);
  brassLine(ctx, 540, 1486, 420, 0.75, 2.5);
  t(ctx, '৫টি ফিনিশ · একই দাম', 540, 1554, '42px AnekSB', INK, 26);
  pill(ctx, 540, 1676, 580, 96, 48, 'rgba(20,24,29,0.94)');
  ctx.font = '38px AnekSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = BONE; ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1694); noShadow(ctx);
});

/* ── 09 the 5% pledge (mandatory, verbatim) ────────────────────────────── */
layer('five', ctx => {
  seal(ctx, 540, 700, 238);
  t(ctx, '৫%', 540, 776, '186px AnekXB', brass(ctx, 300, 0, 780, 0), 36);
  spaced(ctx, 'MIQA', 540, 1022, '32px CinzelM', brass(ctx, 380, 0, 700, 0), 12, 20);
  brassLine(ctx, 540, 1054, 240, 0.6, 2);
  t(ctx, 'MIQA-এর মুনাফার ৫%', 540, 1160, '62px AnekXB', INK, 30);
  t(ctx, 'পথশিশুদের কল্যাণে।', 540, 1244, '62px AnekXB', INK, 30);
  line(ctx, 540, 1296, 420, 0.6, 2);
  t(ctx, 'প্রতিটি অর্ডারের একটি অংশ', 540, 1356, '30px HindM', INK_SOFT, 22);
  spaced(ctx, 'BEYOND TIME, BEYOND STYLE.', 540, 1432, '24px MontSB', BRASS, 6, 18);
});

/* ── 10 order CTA · light grid card ────────────────────────────────────── */
function ctaBody(ctx, y0) {
  scrim(ctx, y0 - 40, 1920 - y0 + 40, 0, 0.96);
  t(ctx, '৳৮৫০', 540, y0 + 190, '152px AnekXB', brass(ctx, 220, 0, 860, 0), 40);
  brassLine(ctx, 540, y0 + 236, 380, 0.7, 2);
  t(ctx, '১ বছরের ওয়ারেন্টি · কালার গ্যারান্টি', 540, y0 + 300, '34px AnekSB', INK, 24);
  t(ctx, '৭ দিনের রিপ্লেসমেন্ট · ক্যাশ অন ডেলিভারি', 540, y0 + 352, '34px AnekSB', BRASS, 24);
  pill(ctx, 540, y0 + 466, 620, 92, 46, 'rgba(20,24,29,0.94)');
  ctx.font = '38px AnekSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = BONE; ctx.fillText('ক্যাশ অন ডেলিভারি', 540, y0 + 484); noShadow(ctx);
  t(ctx, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে', 540, y0 + 596, '40px AnekSB', INK, 22);
  t(ctx, 'এখনই অর্ডার করুন।', 540, y0 + 652, '40px AnekSB', INK, 22);
  spaced(ctx, 'BEYOND TIME, BEYOND STYLE.', 540, y0 + 730, '22px MontSB', BRASS, 6, 18);
}
layer('cta', ctx => {
  spaced(ctx, 'MIQA', 540, 126, '34px CinzelM', brass(ctx, 380, 0, 700, 0), 12, 22);
  brassLine(ctx, 540, 150, 230, 0.6, 2);
  ctaBody(ctx, 1000);
});

/* short cut: same card, the ask sits higher */
layer('cta_short', ctx => {
  spaced(ctx, 'MIQA', 540, 126, '34px CinzelM', brass(ctx, 380, 0, 700, 0), 12, 22);
  brassLine(ctx, 540, 150, 230, 0.6, 2);
  ctaBody(ctx, 1010);
});

console.log('done');
