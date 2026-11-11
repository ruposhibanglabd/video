/**
 * Set H video — "Steel Daylight" type layers for the Honeycomb collection reel.
 *
 * Theme: miqa/brand/MIQA-MEN-THEME.md (stage #FAF8F4 → #F0ECE4 → #DFD9D0, ink #14181D, brass #C9A45C)
 * Copy rules honoured here (BRAND-BIBLE §3–§6, client brief 2026-11-11):
 *   · features in the client's own words: বাটারফ্লাই লক · সেমি-অটোমেটিক মেশিন · ১ বছরের ওয়ারেন্টি ·
 *     ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি · ওয়াটারপ্রুফ · কালার গ্যারান্টি · ৳৯৯৯
 *   · the price tab ("tab") stays on the right edge for the whole film (client: দাম সবসময় এক সাইডে)
 *   · 5% line, COD pill and the two CTA lines verbatim; no URL / phone; no third-party brand name
 *
 *   SCALE=1 node mtype_h.mjs     → work/type1/*.png (1080×1920)
 *   SCALE=2 node mtype_h.mjs     → work/type2/*.png (2160×3840)
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const F = path.join(HERE, '../../brand/fonts');
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-Bold.ttf`, 'AnekB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');

const S = Number(process.env.SCALE || 1);
const OUT = path.join(HERE, `work/type${S}`);
fs.mkdirSync(OUT, { recursive: true });

const INK = '#14181D';
const INK_SOFT = 'rgba(20,24,29,0.62)';
const BRASS = '#8F6D34';
const BONE = '#F5F2EC';

function brass(ctx, x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#83642C'); g.addColorStop(0.30, '#C9A45C');
  g.addColorStop(0.58, '#A2823D'); g.addColorStop(1, '#775A26');
  return g;
}
function brassLight(ctx, x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#D9B974'); g.addColorStop(0.45, '#F3DFA8');
  g.addColorStop(0.75, '#D2AE66'); g.addColorStop(1, '#E6CB8C');
  return g;
}
function halo(ctx, blur = 26, a = 0.9) {
  ctx.shadowColor = `rgba(250,248,244,${a})`; ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }
function t(ctx, s, x, y, font, fill, blur = 26, align = 'center') {
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (blur) halo(ctx, blur);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); noShadow(ctx);
}
/** Latin only — Bengali never gets letter-spacing (fonts/README) */
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
function line(ctx, cx, y, w, a = 0.7, th = 2, col = '160,124,58') {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, th);
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function pill(ctx, cx, cy, w, h, fill) { rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); }
function scrim(ctx, y0, h, bottom = 0.9) {
  // soft lift under the type; runs to the bottom of the frame so there is no hard lower edge
  const H = 1920 - y0;
  const g = ctx.createLinearGradient(0, y0, 0, 1920);
  g.addColorStop(0, 'rgba(242,238,231,0)');
  g.addColorStop(Math.min(0.5, (h * 0.35) / H), `rgba(242,238,231,${bottom * 0.7})`);
  g.addColorStop(Math.min(0.8, h / H), `rgba(236,231,223,${bottom * 0.8})`);
  g.addColorStop(1, 'rgba(228,223,215,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y0, 1080, H);
}
function scrimTop(ctx, y1, h, top = 0.88) {
  const g = ctx.createLinearGradient(0, y1 - h, 0, y1);
  g.addColorStop(0, `rgba(250,248,244,${top})`); g.addColorStop(0.6, `rgba(250,248,244,${top * 0.6})`);
  g.addColorStop(1, 'rgba(250,248,244,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y1 - h, 1080, h);
}
function seal(ctx, cx, cy, r) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(160,124,58,0.55)'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(160,124,58,0.26)'; ctx.lineWidth = 1.4; ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r0 = r + 9, r1 = r + (i % 5 === 0 ? 23 : 15);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.strokeStyle = `rgba(160,124,58,${i % 5 === 0 ? 0.45 : 0.20})`; ctx.lineWidth = i % 5 === 0 ? 2 : 1.1; ctx.stroke();
  }
}
function drop(ctx, cx, cy, r, col) {            // line-art water drop
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.55);
  ctx.bezierCurveTo(cx + r * 0.25, cy - r * 0.9, cx + r, cy - r * 0.35, cx + r, cy + r * 0.25);
  ctx.arc(cx, cy + r * 0.25, r, 0, Math.PI, false);
  ctx.bezierCurveTo(cx - r, cy - r * 0.35, cx - r * 0.25, cy - r * 0.9, cx, cy - r * 1.55);
  ctx.closePath(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.25, r * 0.55, Math.PI * 0.55, Math.PI * 0.95);
  ctx.lineWidth = 2.4; ctx.stroke();
}
function layer(name, fn) {
  const c = createCanvas(1080 * S, 1920 * S);
  const ctx = c.getContext('2d');
  ctx.scale(S, S);
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
}

/* body-band geometry — everything stays above y≈1610 so Reels' own UI never covers it */
const Y = { label: 1338, head: 1448, rule: 1482, sub: 1550, small: 1606 };
function feature(ctx, label, head, sub, small, headPx = 86) {
  scrim(ctx, 1210, 440, 0.9);
  spaced(ctx, label, 540, Y.label, '23px MontSB', BRASS, 6, 18);
  t(ctx, head, 540, Y.head, `${headPx}px AnekXB`, INK, 32);
  line(ctx, 540, Y.rule, 400);
  if (sub) t(ctx, sub, 540, Y.sub, '40px AnekSB', BRASS, 24);
  if (small) t(ctx, small, 540, Y.small, '30px HindM', INK_SOFT, 22);
}

/* ── header on every footage card ─────────────────────────────────────── */
layer('head', ctx => {
  scrimTop(ctx, 320, 320, 0.88);
  spaced(ctx, 'MIQA', 540, 142, '34px CinzelM', brass(ctx, 380, 700), 12, 20);
  line(ctx, 540, 166, 210, 0.6);
  t(ctx, 'ছেলেদের হানিকম্ব কালেকশন', 540, 226, '34px AnekSB', INK_SOFT, 22);
});

/* ── the persistent price tab (right edge, whole film) ────────────────── */
layer('tab', ctx => {
  // text stays inside the token safeBox (x ≤ 1015); the plate itself runs off the right edge
  ctx.shadowColor = 'rgba(20,24,29,0.30)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
  rrect(ctx, 772, 292, 400, 152, 42); ctx.fillStyle = 'rgba(17,21,26,0.97)'; ctx.fill(); noShadow(ctx);
  ctx.shadowOffsetY = 0;
  rrect(ctx, 778, 298, 400, 140, 36); ctx.strokeStyle = 'rgba(201,164,92,0.75)'; ctx.lineWidth = 2; ctx.stroke();
  t(ctx, 'দাম মাত্র', 902, 344, '30px AnekSB', '#E9E3D6', 0);
  t(ctx, '৳৯৯৯', 902, 420, '76px AnekXB', brassLight(ctx, 800, 1005), 0);
});

/* ── 01 hook: the price is the hook ───────────────────────────────────── */
layer('hook', ctx => {
  scrim(ctx, 1210, 440, 0.9);
  t(ctx, 'মাত্র', 540, 1322, '46px AnekSB', INK, 24);
  t(ctx, '৳৯৯৯', 540, 1482, '176px AnekXB', brass(ctx, 220, 860), 42);
  line(ctx, 540, 1516, 360);
  t(ctx, 'সেমি-অটোমেটিক মেশিন · বাটারফ্লাই লক', 540, 1580, '36px AnekSB', INK, 24);
});
layer('hook2', ctx => {
  feature(ctx, 'NEW COLLECTION', 'হানিকম্ব কালেকশন', 'চারটি রঙ · একই দাম', '১ বছরের ওয়ারেন্টি · ক্যাশ অন ডেলিভারি', 82);
});

/* ── 02 the four colours ──────────────────────────────────────────────── */
const COLS = [['সাদা', '#F4F2EC', '#B9B2A4'], ['নেভি', '#1D2530', '#1D2530'], ['নীল', '#2A4B9A', '#2A4B9A'], ['সবুজ', '#1F7A55', '#1F7A55']];
function colourRow(ctx, active) {
  ctx.font = '40px AnekSB';
  const gap = 46, dot = 15;
  const ws = COLS.map(c => ctx.measureText(c[0]).width + dot * 2 + 14);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (COLS.length - 1);
  let x = 540 - total / 2;
  COLS.forEach((c, i) => {
    const on = active === 'all' || active === i;
    ctx.globalAlpha = on ? 1 : 0.32;
    ctx.beginPath(); ctx.arc(x + dot, Y.sub - 14, dot, 0, Math.PI * 2);
    ctx.fillStyle = c[1]; ctx.fill(); ctx.strokeStyle = c[2]; ctx.lineWidth = 2; ctx.stroke();
    if (on && active !== 'all') {
      ctx.beginPath(); ctx.arc(x + dot, Y.sub - 14, dot + 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160,124,58,0.9)'; ctx.lineWidth = 2.5; ctx.stroke();
    }
    t(ctx, c[0], x + dot * 2 + 14, Y.sub, '40px AnekSB', on ? INK : INK_SOFT, on ? 22 : 0, 'left');
    ctx.globalAlpha = 1;
    x += ws[i] + gap;
  });
}
layer('col_base', ctx => {
  scrim(ctx, 1210, 440, 0.9);
  spaced(ctx, 'FOUR COLOURS', 540, Y.label, '23px MontSB', BRASS, 6, 18);
  t(ctx, 'চারটি রঙ', 540, Y.head, '86px AnekXB', INK, 32);
  line(ctx, 540, Y.rule, 400);
});
COLS.forEach((c, i) => layer(`col_${i + 1}`, ctx => colourRow(ctx, i)));
layer('col_all', ctx => { colourRow(ctx, 'all'); t(ctx, 'সব রঙে একই দাম — ৳৯৯৯', 540, Y.small, '30px HindM', INK_SOFT, 22); });

/* ── 03–06 features, client's exact words ─────────────────────────────── */
layer('lock', ctx => feature(ctx, 'FEATURE 01', 'বাটারফ্লাই লক', 'দুই পাশ থেকে ভাঁজ হয়ে বন্ধ হয়', null));
layer('machine', ctx => feature(ctx, 'FEATURE 02', 'সেমি-অটোমেটিক মেশিন', 'পেছন দিক থেকে মেশিন দেখা যায়', 'সি-থ্রু ব্যাক ডিজাইন', 72));
layer('water', ctx => {
  feature(ctx, 'FEATURE 03', 'ওয়াটারপ্রুফ', null, null);   // client's word only — no usage promises added
  drop(ctx, 540, 1268, 15, 'rgba(96,128,156,0.95)');
});
layer('colour', ctx => { t(ctx, 'সাথে কালার গ্যারান্টি', 540, Y.sub + 8, '50px AnekB', BRASS, 26); });
layer('promise1', ctx => {
  scrim(ctx, 1210, 440, 0.9);
  spaced(ctx, 'THE PROMISE', 540, Y.label, '23px MontSB', BRASS, 7, 18);
  t(ctx, '১ বছরের ওয়ারেন্টি', 540, Y.head, '80px AnekXB', INK, 32);
  line(ctx, 540, Y.rule, 420);
});
layer('promise2', ctx => {
  t(ctx, '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি', 540, Y.sub + 8, '50px AnekB', BRASS, 26);
});

/* ── 07 price ─────────────────────────────────────────────────────────── */
layer('price', ctx => {
  scrim(ctx, 1170, 480, 0.92);
  spaced(ctx, 'PRICE', 540, 1262, '23px MontSB', BRASS, 7, 18);
  t(ctx, '৳৯৯৯', 540, 1432, '184px AnekXB', brass(ctx, 210, 870), 44);
  line(ctx, 540, 1466, 400, 0.75, 2.5);
  t(ctx, 'চারটি রঙ · একই দাম', 540, 1524, '40px AnekSB', INK, 24);
});
layer('cod', ctx => {
  pill(ctx, 540, 1594, 520, 84, 'rgba(20,24,29,0.94)');
  ctx.font = '36px AnekSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = BONE; ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1598);
});

/* ── 08 the 5% pledge — verbatim (BRAND-BIBLE §3) ─────────────────────── */
layer('five', ctx => {
  seal(ctx, 540, 720, 232);
  t(ctx, '৫%', 540, 794, '182px AnekXB', brass(ctx, 300, 780), 36);
  spaced(ctx, 'MIQA', 540, 1036, '32px CinzelM', brass(ctx, 380, 700), 12, 20);
  line(ctx, 540, 1066, 240, 0.6);
  t(ctx, 'MIQA-এর মুনাফার ৫%', 540, 1170, '62px AnekXB', INK, 30);
  t(ctx, 'পথশিশুদের কল্যাণে।', 540, 1254, '62px AnekXB', INK, 30);
  line(ctx, 540, 1304, 420, 0.6, 2, '150,158,166');
  t(ctx, 'প্রতিটি অর্ডারের একটি অংশ', 540, 1362, '30px HindM', INK_SOFT, 22);
  spaced(ctx, 'BEYOND TIME, BEYOND STYLE.', 540, 1436, '24px MontSB', BRASS, 6, 18);
});

/* ── 09 order CTA — the two lines verbatim ────────────────────────────── */
function ctaBody(ctx, y0, withFive) {
  scrim(ctx, y0 - 60, 1920 - y0 + 60, 0.94);
  t(ctx, '৳৯৯৯', 540, y0 + 150, '150px AnekXB', brass(ctx, 220, 860), 40);
  line(ctx, 540, y0 + 184, 380);
  t(ctx, '১ বছরের ওয়ারেন্টি · ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি', 540, y0 + 244, '34px AnekSB', INK, 24);
  t(ctx, 'বাটারফ্লাই লক · ওয়াটারপ্রুফ · কালার গ্যারান্টি', 540, y0 + 294, '34px AnekSB', BRASS, 24);
  pill(ctx, 540, y0 + 384, 600, 90, 'rgba(20,24,29,0.94)');
  ctx.font = '38px AnekSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = BONE; ctx.fillText('ক্যাশ অন ডেলিভারি', 540, y0 + 388);
  t(ctx, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে', 540, y0 + 496, '40px AnekSB', INK, 22);
  t(ctx, 'এখনই অর্ডার করুন।', 540, y0 + 550, '40px AnekSB', INK, 22);
  if (withFive) {
    line(ctx, 540, y0 + 640, 520, 0.5, 2, '150,158,166');
    t(ctx, 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।', 540, y0 + 692, '30px AnekSB', INK, 20);
    spaced(ctx, 'BEYOND TIME, BEYOND STYLE.', 540, y0 + 738, '20px MontSB', BRASS, 5, 16);
  } else {
    spaced(ctx, 'BEYOND TIME, BEYOND STYLE.', 540, y0 + 700, '22px MontSB', BRASS, 6, 18);
  }
}
layer('cta', ctx => ctaBody(ctx, 1030, false));
layer('cta_short', ctx => ctaBody(ctx, 1030, true));
layer('chev', ctx => {
  for (let i = 0; i < 2; i++) {
    const y = 1616 + i * 16;
    ctx.beginPath(); ctx.moveTo(518, y); ctx.lineTo(540, y + 14); ctx.lineTo(562, y + 14 - 14);
    ctx.strokeStyle = `rgba(143,109,52,${0.9 - i * 0.35})`; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
});
/* short cut only: the two promises that lost their own scene ride on the warranty card */
layer('promise3', ctx => { t(ctx, 'ওয়াটারপ্রুফ · কালার গ্যারান্টি', 540, Y.small + 22, '34px AnekSB', INK, 22); });

console.log('type layers →', OUT);
