/**
 * Set H video 2 (2026-11-14) — minimal type layers.
 *
 * Client brief: "খুব কম লেখা" — MIQA mark, a small price, one short label per feature, the order card at the end.
 * Rules carried over: D54 (price stays on one side for the whole film), D56 (type on small SOLID chips,
 * never a white haze over the footage), MEN-THEME §6 (only the client's own feature words; no third-party
 * brand name; "সেমি-অটোমেটিক", never "অটোমেটিক"), the 5 % line and the two CTA lines verbatim.
 *
 *   node mtype_n.mjs   → work/type/*.png (1080×1920, transparent)
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
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');

const OUT = path.join(HERE, 'work/type');
fs.mkdirSync(OUT, { recursive: true });

const INK = '#14181D', INK_SOFT = 'rgba(20,24,29,0.66)', BRASS = '#8F6D34', BONE = 'rgba(248,246,241,0.97)';

function brass(ctx, x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#83642C'); g.addColorStop(0.30, '#C9A45C'); g.addColorStop(0.58, '#A2823D'); g.addColorStop(1, '#775A26');
  return g;
}
function brassLight(ctx, x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#D9B974'); g.addColorStop(0.45, '#F3DFA8'); g.addColorStop(0.75, '#D2AE66'); g.addColorStop(1, '#E6CB8C');
  return g;
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function chip(ctx, x, y, w, h, r, fill, shadow = 0.32) {
  ctx.save();
  ctx.shadowColor = `rgba(8,10,14,${shadow})`; ctx.shadowBlur = 28; ctx.shadowOffsetY = 8;
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
}
function t(ctx, s, x, y, font, fill, align = 'center') {
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
/** Latin only — Bengali never gets letter-spacing */
function spaced(ctx, s, cx, y, font, fill, gap) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const ch = [...s], ws = ch.map(c => ctx.measureText(c).width);
  let x = cx - (ws.reduce((a, b) => a + b, 0) + gap * (ch.length - 1)) / 2;
  ctx.fillStyle = fill;
  ch.forEach((c, i) => { ctx.fillText(c, x, y); x += ws[i] + gap; });
}
function rule(ctx, cx, y, w, a = 0.7, col = '160,124,58') {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, 2);
}
function layer(name, fn) {
  const c = createCanvas(1080, 1920), ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
}

/* ── brand mark, top-left (whole film) ───────────────────────────────── */
layer('head', ctx => {
  chip(ctx, 56, 150, 214, 70, 35, BONE);
  spaced(ctx, 'MIQA', 163, 198, '34px CinzelM', brass(ctx, 90, 236), 10);
});

/* ── the price, top-right (whole film — D54) ─────────────────────────── */
layer('price', ctx => {
  chip(ctx, 822, 150, 202, 70, 35, 'rgba(17,21,26,0.96)');
  rrect(ctx, 826, 154, 194, 62, 31); ctx.strokeStyle = 'rgba(201,164,92,0.70)'; ctx.lineWidth = 1.6; ctx.stroke();
  t(ctx, '৳৯৯৯', 923, 202, '46px AnekXB', brassLight(ctx, 850, 1000));
});

/* ── one short label per beat: a small bone pill under the watch ─────── */
const CY = 1452;
function label(name, text, px = 46) {
  layer(name, ctx => {
    ctx.font = `${px}px AnekB`;
    const w = Math.ceil(ctx.measureText(text).width) + 124, h = 96;
    chip(ctx, 540 - w / 2, CY - h / 2, w, h, h / 2, BONE);
    ctx.beginPath(); ctx.arc(540 - w / 2 + 40, CY, 7, 0, Math.PI * 2); ctx.fillStyle = brass(ctx, 540 - w / 2 + 30, 540 - w / 2 + 50); ctx.fill();
    t(ctx, text, 540 + 18, CY + px * 0.34, `${px}px AnekB`, INK);
  });
}
label('lab_name', 'হানিকম্ব কালেকশন');
label('lab_colours', '৪টি রঙ');
label('lab_white', 'সাদা');
label('lab_blue', 'নীল');
label('lab_green', 'সবুজ');
label('lab_black', 'কালো');
label('lab_lock', 'বাটারফ্লাই লক');
label('lab_machine', 'সেমি-অটোমেটিক মেশিন');
label('lab_water', 'ওয়াটারপ্রুফ');
label('lab_colour', 'কালার গ্যারান্টি');
label('lab_warranty', '১ বছরের ওয়ারেন্টি');
label('lab_replace', '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি', 42);
label('lab_price', 'দাম মাত্র ৳৯৯৯');
label('lab_cod', 'ক্যাশ অন ডেলিভারি');

/* ── order card (end) ─────────────────────────────────────────────────── */
layer('cta', ctx => {
  const X = 84, Y = 936, W = 912, H = 612;
  chip(ctx, X, Y, W, H, 46, BONE, 0.36);
  spaced(ctx, 'MIQA', 540, Y + 70, '30px CinzelM', brass(ctx, 470, 610), 10);
  t(ctx, 'হানিকম্ব কালেকশন', 540, Y + 122, '34px AnekSB', INK_SOFT);
  t(ctx, '৳৯৯৯', 540, Y + 262, '136px AnekXB', brass(ctx, 300, 780));
  rule(ctx, 540, Y + 292, 380);
  rrect(ctx, 540 - 250, Y + 322, 500, 76, 38); ctx.fillStyle = 'rgba(20,24,29,0.95)'; ctx.fill();
  ctx.font = '36px AnekSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F5F2EC';
  ctx.fillText('ক্যাশ অন ডেলিভারি', 540, Y + 363);
  t(ctx, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে', 540, Y + 458, '38px AnekSB', INK);
  t(ctx, 'এখনই অর্ডার করুন।', 540, Y + 516, '48px AnekXB', INK);
  rule(ctx, 540, Y + 544, 520, 0.5, '150,158,166');
  t(ctx, 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।', 540, Y + 588, '27px AnekSB', INK_SOFT);
});

/* ── cover still ──────────────────────────────────────────────────────── */
layer('cover', ctx => {
  const X = 120, Y = 1330, W = 840, H = 236;
  chip(ctx, X, Y, W, H, 44, BONE, 0.36);
  t(ctx, 'হানিকম্ব কালেকশন', 540, Y + 104, '76px AnekXB', INK);
  rule(ctx, 540, Y + 132, 380);
  t(ctx, '৪টি রঙ · দাম মাত্র ৳৯৯৯', 540, Y + 196, '42px AnekSB', BRASS);
});

console.log('type layers →', OUT);
