#!/usr/bin/env node
/**
 * MIQA design-guide boards (visual companion to creative/*-DESIGN-GUIDE.md).
 *
 *   node miqa/tools/style-board.mjs            # women + men + couple
 *   node miqa/tools/style-board.mjs men        # one line
 *
 * Output: miqa/brand/style-boards/<line>-design-guide.jpg (1440 × 3760)
 *
 * Everything is drawn from brand/design-tokens.json + brand/fonts + brand/mood.
 * No product imagery is used: product positions are shown as dashed
 * placeholders, because the real watch always comes from the client's photos.
 * The six style frames are laid out on the real 1080 × 1920 design grid
 * (scaled down), with Meta's Reels safe zone drawn on top.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIQA = path.resolve(HERE, '..');
const T = JSON.parse(fs.readFileSync(path.join(MIQA, 'brand/design-tokens.json'), 'utf8'));
const FONT_DIR = path.join(MIQA, 'brand/fonts');
for (const f of fs.readdirSync(FONT_DIR)) {
  if (f.endsWith('.ttf')) GlobalFonts.registerFromPath(path.join(FONT_DIR, f), f.slice(0, -4));
}

const W = 1440;
const H = 3760;

// ---------------------------------------------------------------- copy per line
const LINES = {
  women: {
    title: "WOMEN'S DESIGN GUIDE", bnTitle: 'মেয়েদের ঘড়ির বিজ্ঞাপন — ডিজাইন গাইড', dark: false,
    mood: 'womens-mood-blush-silk.jpg',
    hookBn: ['আপনার কব্জিতে', 'এক টুকরো আভিজাত্য'], hookEn: 'Elegance, in every second.',
    featEn: 'BUTTERFLY LOCK', featBn: 'বাটারফ্লাই লক', featSub: 'ম্যাক্রো ক্লোজ-আপ · লকের গঠন',
    collBn: 'আপনার রঙ বেছে নিন', dots: ['#D9B779', '#C9CED4', '#E2A99A', '#2A2A2E'],
    price: '৳৬৫০', priceOld: '৳১,০০০',
    specBn: 'ছোট্ট একটি ঘড়ি, বদলে দেয় পুরো লুক', specEn: 'Elegance That Speaks',
    labels: 'BUTTERFLY LOCK  ·  WATERPROOF',
  },
  men: {
    title: "MEN'S DESIGN GUIDE", bnTitle: 'ছেলেদের ঘড়ির বিজ্ঞাপন — ডিজাইন গাইড', dark: true,
    mood: 'mens-mood-obsidian-steel.jpg',
    hookBn: ['সময় যার হাতে,', 'আত্মবিশ্বাস তার চোখে'], hookEn: 'Bold by design.',
    featEn: 'WATER RESISTANT', featBn: 'ওয়াটার রেজিস্ট্যান্স', featSub: 'বৃষ্টির ফোঁটা · স্টিলের ওপর আলো',
    collBn: 'আপনার স্টাইল, আপনার রঙ', dots: ['#C9CED4', '#1C3F94', '#0E3B33', '#C9A45C'],
    price: '৳১,৭৫০', priceOld: '৳২,৯৯৯',
    specBn: 'প্রথম দেখাতেই ব্যক্তিত্বের পরিচয়', specEn: 'Quiet Confidence',
    labels: 'CHRONO DIAL  ·  LEATHER STRAP',
  },
  couple: {
    title: 'COUPLE DESIGN GUIDE', bnTitle: 'কাপল ঘড়ির বিজ্ঞাপন — ডিজাইন গাইড', dark: false,
    mood: null,
    hookBn: ['দুটি হাত,', 'একই সময়ের গল্প'], hookEn: 'Together in time.',
    featEn: 'MATCHING PAIR', featBn: 'ম্যাচিং কাপল সেট', featSub: 'দুটি ঘড়ি · একই ডিজাইন ভাষা',
    collBn: 'তার জন্য · তোমার জন্য', dots: ['#F4C9D6', '#0F1B2D', '#D9B779', '#F6EDE3'],
    price: '৳১,২৫০', priceOld: '৳১,৯৯৯',
    specBn: 'ভালোবাসার মুহূর্তগুলো থাকুক সময়ের বাঁধনে', specEn: 'Together in Time',
    labels: 'HER  ·  HIS  ·  GIFT SET',
  },
};

// ---------------------------------------------------------------- helpers
const BN_FALLBACK = '"HindSiliguri-Medium"';
function font(px, family, italic = false) {
  return `${italic ? 'italic ' : ''}${px}px "${family}", ${BN_FALLBACK}`;
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function grad(ctx, g, x, y, w, h) {
  let G;
  if (g.type === 'radial') {
    G = ctx.createRadialGradient(x + w * 0.5, y + h * 0.38, 0, x + w * 0.5, y + h * 0.5, Math.max(w, h) * 0.75);
  } else {
    G = ctx.createLinearGradient(x, y, x, y + h);
  }
  for (const [c, s] of g.stops) G.addColorStop(s, c);
  return G;
}
function metal(ctx, stops, x, w) {
  const G = ctx.createLinearGradient(x, 0, x + w, 0);
  for (const [c, s] of stops) G.addColorStop(s, c);
  return G;
}
/** Latin text with tracking (never use for Bengali). */
function tracked(ctx, text, x, y, px, family, spacingPx, align = 'center') {
  ctx.save();
  ctx.font = font(px, family);
  ctx.letterSpacing = `${spacingPx}px`;
  const w = ctx.measureText(text).width - spacingPx;
  const sx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left';
  ctx.fillText(text, sx, y);
  ctx.restore();
  return w;
}
/** Bengali / mixed text — letterSpacing always 0. */
function bn(ctx, text, x, y, px, family, align = 'center') {
  ctx.save();
  ctx.letterSpacing = '0px';
  ctx.font = font(px, family);
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}
/** Word-wrap Bengali/mixed text (no tracking). */
function wrapBn(ctx, text, x, y, maxW, px, family, lh, maxLines = 3) {
  ctx.save();
  ctx.letterSpacing = '0px';
  ctx.font = font(px, family);
  ctx.textAlign = 'left';
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  ctx.restore();
}
function hairline(ctx, cx, y, half, color, diamond = true) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - 14, y);
  ctx.moveTo(cx + 14, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  if (diamond) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, y - 7); ctx.lineTo(cx + 7, y); ctx.lineTo(cx, y + 7); ctx.lineTo(cx - 7, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
function coverImage(ctx, img, x, y, w, h, focusY = 0.5) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
}
function grain(ctx, w, h, amount) {
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  let seed = 1337;
  for (let i = 0; i < d.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const n = ((seed >>> 24) / 255 - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(id, 0, 0);
}
function dashedCircle(ctx, cx, cy, r, color, label, labelColor) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  if (label) {
    ctx.fillStyle = labelColor || color;
    bn(ctx, label, cx, cy + 14, 40, 'HindSiliguri-Medium');
  }
  ctx.restore();
}
function safeOverlay(ctx, color) {
  const [x0, y0, x1, y1] = T.layout.px['1080x1920'].safeBox;
  const [cx, cy] = T.layout.px['1080x1920'].lowerRightCornerFrom;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  ctx.setLineDash([]);
  // shade the zones Meta's UI covers
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.fillRect(0, 0, 1080, y0);
  ctx.fillRect(0, y1, 1080, 1920 - y1);
  ctx.fillRect(cx, cy, 1080 - cx, y1 - cy);
  ctx.restore();
}

// ---------------------------------------------------------------- style frames (1080 × 1920 space)
function frameHook(ctx, L, P, line, mood) {
  if (mood) {
    coverImage(ctx, mood, 0, 0, 1080, 1920, 0.5);
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, L.dark ? 'rgba(6,8,11,0.78)' : 'rgba(251,244,241,0.80)');
    g.addColorStop(0.42, L.dark ? 'rgba(6,8,11,0.25)' : 'rgba(251,244,241,0.18)');
    g.addColorStop(1, L.dark ? 'rgba(6,8,11,0.35)' : 'rgba(90,26,46,0.10)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
  } else {
    ctx.fillStyle = grad(ctx, line.gradients.heroPlate, 0, 0, 1080, 1920);
    ctx.fillRect(0, 0, 1080, 1920);
  }
  const ink = L.dark ? P.bone.hex : (P.ink || P.espresso).hex;
  ctx.fillStyle = ink;
  bn(ctx, L.hookBn[0], 540, 420, 92, line.type.bnDisplay);
  ctx.fillStyle = L.dark ? metal(ctx, line.gradients.metalText.stops, 140, 800) : (P.rosewood || P.espresso).hex;
  bn(ctx, L.hookBn[1], 540, 540, 92, line.type.bnDisplay);
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.85;
  bn(ctx, L.hookEn, 540, 640, 60, line.type.enDisplayItalic || line.type.enDisplay);
  ctx.globalAlpha = 1;
  dashedCircle(ctx, 540, 1180, 300, L.dark ? 'rgba(201,206,212,0.75)' : 'rgba(158,74,99,0.7)', 'আসল প্রোডাক্ট', ink);
}

function frameFeature(ctx, L, P, line) {
  ctx.fillStyle = grad(ctx, line.gradients.featurePlate, 0, 0, 1080, 1920);
  ctx.fillRect(0, 0, 1080, 1920);
  // diagonal light sweep
  const s = ctx.createLinearGradient(100, 0, 900, 1920);
  s.addColorStop(0.35, 'rgba(255,255,255,0)');
  s.addColorStop(0.5, L.dark ? 'rgba(201,206,212,0.10)' : 'rgba(255,255,255,0.55)');
  s.addColorStop(0.65, 'rgba(255,255,255,0)');
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, 1080, 1920);
  const ink = L.dark ? P.bone.hex : (P.ink || P.espresso).hex;
  const accent = line.gradients.metalText.stops;
  ctx.fillStyle = L.dark ? metal(ctx, accent, 300, 480) : (P.rosewood || P.espresso).hex;
  tracked(ctx, L.featEn, 540, 360, 32, line.type.enLabel, 9);
  ctx.fillStyle = ink;
  bn(ctx, L.featBn, 540, 470, 84, line.type.bnDisplay);
  hairline(ctx, 540, 525, 170, L.dark ? P.brass.hex : P.champagne.hex);
  ctx.globalAlpha = 0.8;
  bn(ctx, L.featSub, 540, 600, 42, line.type.bnText);
  ctx.globalAlpha = 1;
  dashedCircle(ctx, 540, 1050, 330, L.dark ? 'rgba(201,206,212,0.7)' : 'rgba(158,74,99,0.65)', 'ম্যাক্রো শট', ink);
}

function frameCollection(ctx, L, P, line) {
  ctx.fillStyle = grad(ctx, line.gradients.heroPlate, 0, 0, 1080, 1920);
  ctx.fillRect(0, 0, 1080, 1920);
  const ink = L.dark ? P.bone.hex : (P.ink || P.espresso).hex;
  ctx.fillStyle = ink;
  tracked(ctx, 'THE COLLECTION', 540, 360, 30, line.type.enLabel, 9);
  bn(ctx, L.collBn, 540, 460, 72, line.type.bnDisplay);
  const pts = [[250, 820], [830, 820], [250, 1150], [830, 1150]];
  pts.forEach(([x, y], i) => {
    ctx.save();
    ctx.strokeStyle = L.dark ? 'rgba(201,206,212,0.6)' : 'rgba(158,74,99,0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.arc(x, y, 140, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = L.dots[i];
    ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = L.dark ? 'rgba(255,255,255,0.35)' : 'rgba(42,20,28,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.75;
  bn(ctx, 'প্রতিটি রঙ — আসল ছবির সাথে মিলিয়ে', 540, 1420, 38, line.type.bnText);
  ctx.globalAlpha = 1;
}

function framePrice(ctx, L, P, line) {
  ctx.fillStyle = grad(ctx, line.gradients.ctaPlate, 0, 0, 1080, 1920);
  ctx.fillRect(0, 0, 1080, 1920);
  const light = L.dark ? P.bone.hex : (P.pearl || P.ivory).hex;
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.75;
  tracked(ctx, 'PRICE', 540, 470, 30, line.type.enLabel, 12);
  ctx.globalAlpha = 1;
  // old price, struck through
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.font = font(54, line.type.bnSoft || line.type.bnText);
  ctx.textAlign = 'center';
  ctx.fillText(L.priceOld, 540, 580);
  const ow = ctx.measureText(L.priceOld).width;
  ctx.strokeStyle = light;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(540 - ow / 2 - 8, 562); ctx.lineTo(540 + ow / 2 + 8, 562); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = metal(ctx, (line.gradients.brassText || line.gradients.metalText).stops, 300, 480);
  bn(ctx, L.price, 540, 790, 170, line.type.price);
  hairline(ctx, 540, 850, 200, L.dark ? P.brass.hex : P.champagne.hex);
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.85;
  bn(ctx, 'ক্যাশ অন ডেলিভারি', 540, 940, 46, line.type.bnCta);
  ctx.globalAlpha = 0.45;
  bn(ctx, '(নমুনা মূল্য — প্রতিবার আপনার দেওয়া দাম)', 540, 1180, 30, line.type.bnText);
  ctx.globalAlpha = 1;
}

function frameFive(ctx, L, P, line) {
  ctx.fillStyle = grad(ctx, line.gradients.featurePlate, 0, 0, 1080, 1920);
  ctx.fillRect(0, 0, 1080, 1920);
  const ink = L.dark ? P.bone.hex : (P.ink || P.espresso).hex;
  const gold = L.dark ? P.brass.hex : P.champagne.hex;
  // seal
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(540, 640, 190, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(540, 640, 170, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r0 = i % 5 === 0 ? 196 : 200;
    ctx.beginPath();
    ctx.moveTo(540 + Math.cos(a) * r0, 640 + Math.sin(a) * r0);
    ctx.lineTo(540 + Math.cos(a) * 208, 640 + Math.sin(a) * 208);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = metal(ctx, line.gradients.metalText.stops, 400, 280);
  bn(ctx, '৫%', 540, 700, 150, line.type.price);
  ctx.fillStyle = ink;
  bn(ctx, 'MIQA-এর মুনাফার ৫%', 540, 990, 66, line.type.bnDisplay);
  bn(ctx, 'পথশিশুদের কল্যাণে।', 540, 1080, 66, line.type.bnDisplay);
}

function frameCta(ctx, L, P, line) {
  ctx.fillStyle = grad(ctx, line.gradients.ctaPlate, 0, 0, 1080, 1920);
  ctx.fillRect(0, 0, 1080, 1920);
  const light = L.dark ? P.bone.hex : (P.pearl || P.ivory).hex;
  const gold = L.dark ? P.brass.hex : P.champagne.hex;
  ctx.fillStyle = metal(ctx, line.gradients.metalText.stops, 330, 420);
  tracked(ctx, 'MIQA', 540, 395, 92, 'Cinzel-Medium', 30);
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.8;
  bn(ctx, T.brand.tagline, 540, 460, 40, 'CormorantGaramond-MediumItalic');
  ctx.globalAlpha = 1;
  // COD badge
  ctx.save();
  rr(ctx, 170, 600, 740, 132, 66);
  ctx.fillStyle = L.dark ? 'rgba(201,164,92,0.12)' : 'rgba(217,183,121,0.14)';
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = light;
  bn(ctx, T.brand.mandatory.ctaOnScreen[0], 540, 690, 66, line.type.bnCta);
  bn(ctx, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে', 540, 860, 50, line.type.bnCta);
  bn(ctx, 'এখনই অর্ডার করুন।', 540, 935, 50, line.type.bnCta);
  // chevrons pointing to Meta's button
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.4 + i * 0.3;
    const y = 1075 + i * 52;
    ctx.beginPath(); ctx.moveTo(500, y); ctx.lineTo(540, y + 30); ctx.lineTo(580, y); ctx.stroke();
  }
  ctx.restore();
}

const FRAMES = [
  ['01  HOOK', 'হুক · প্রথম ৩ সেকেন্ড', frameHook],
  ['02  FEATURE', 'ফিচার দৃশ্য', frameFeature],
  ['03  COLLECTION', 'কালার কালেকশন', frameCollection],
  ['04  PRICE', 'দাম প্রকাশ', framePrice],
  ['05  5% PROMISE', '৫% অঙ্গীকার', frameFive],
  ['06  ORDER CTA', 'অর্ডার CTA', frameCta],
];

// ---------------------------------------------------------------- board
async function board(key) {
  const L = LINES[key];
  const line = T.lines[key];
  const P = line.palette;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  const mood = L.mood ? await loadImage(path.join(MIQA, 'brand/mood', L.mood)) : null;

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  if (L.dark) { bg.addColorStop(0, '#0B0D10'); bg.addColorStop(1, '#0F1B2D'); }
  else if (key === 'couple') { bg.addColorStop(0, '#FBF6EF'); bg.addColorStop(1, '#EFE2D2'); }
  else { bg.addColorStop(0, '#FBF4F1'); bg.addColorStop(1, '#F6DCE4'); }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 120, 0, W / 2, 120, 900);
  glow.addColorStop(0, L.dark ? 'rgba(60,90,120,0.35)' : 'rgba(255,255,255,0.9)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1000);

  const ink = L.dark ? P.bone.hex : (P.ink || P.espresso).hex;
  const sub = L.dark ? P.graphite.hex : (P.rosewood || P.taupe).hex;
  const gold = L.dark ? P.brass.hex : P.champagne.hex;

  // header
  ctx.fillStyle = metal(ctx, line.gradients.metalText.stops, 450, 540);
  tracked(ctx, 'MIQA', W / 2, 175, 120, 'Cinzel-Medium', 42);
  ctx.fillStyle = ink;
  bn(ctx, T.brand.tagline, W / 2, 245, 46, 'CormorantGaramond-MediumItalic');
  hairline(ctx, W / 2, 290, 300, gold);
  ctx.fillStyle = sub;
  tracked(ctx, `${L.title}  ·  ${line.codename.toUpperCase()}`, W / 2, 345, 24, 'Montserrat-SemiBold', 7);
  ctx.fillStyle = ink;
  bn(ctx, L.bnTitle, W / 2, 400, 38, 'HindSiliguri-Medium');

  // section heading helper
  const heading = (y, en, bnText) => {
    ctx.fillStyle = sub;
    tracked(ctx, en, 80, y, 22, 'Montserrat-SemiBold', 6, 'left');
    ctx.fillStyle = ink;
    bn(ctx, bnText, W - 80, y, 26, 'HindSiliguri-Medium', 'right');
    ctx.save();
    ctx.strokeStyle = gold; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, y + 18); ctx.lineTo(W - 80, y + 18); ctx.stroke();
    ctx.restore();
  };

  // palette
  heading(480, 'PALETTE', 'কালার প্যালেট');
  const names = Object.keys(P);
  names.forEach((n, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 80 + col * 330;
    const y = 525 + row * 270;
    ctx.save();
    rr(ctx, x, y, 300, 140, 18);
    ctx.fillStyle = P[n].hex;
    ctx.fill();
    ctx.strokeStyle = L.dark ? 'rgba(255,255,255,0.14)' : 'rgba(42,20,28,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = ink;
    tracked(ctx, n.replace(/([A-Z])/g, ' $1').toUpperCase(), x, y + 178, 19, 'Montserrat-SemiBold', 4, 'left');
    ctx.fillStyle = sub;
    tracked(ctx, P[n].hex, x + 300, y + 178, 19, 'Montserrat-Medium', 2, 'right');
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.8;
    wrapBn(ctx, P[n].role, x, y + 212, 300, 20, 'HindSiliguri-Regular', 26, 2);
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = sub;
  bn(ctx, line.ratio, W / 2, 1075, 21, 'Montserrat-Medium');

  // typography
  heading(1150, 'TYPOGRAPHY', 'টাইপোগ্রাফি');
  const specs = [
    [L.specBn, line.type.bnDisplay, 60, `Bengali Display — ${line.type.bnDisplay}`],
    [L.specEn, line.type.enDisplayItalic || line.type.enDisplay, 66, `English Display — ${line.type.enDisplayItalic || line.type.enDisplay}`],
    [T.brand.mandatory.ctaOnScreen[1], line.type.bnCta, 40, `Bengali Text / CTA — ${line.type.bnCta}`],
    [null, line.type.enLabel, 26, `English Label (tracked caps) — ${line.type.enLabel}`],
    [`${L.price}   ${L.priceOld}`, line.type.price, 70, `Price (Bengali digits) — ${line.type.price}`],
  ];
  let ty = 1250;
  for (const [text, fam, px, label] of specs) {
    ctx.fillStyle = ink;
    if (text === null) tracked(ctx, L.labels, 80, ty, px, fam, 8, 'left');
    else bn(ctx, text, 80, ty, px, fam, 'left');
    ctx.fillStyle = sub;
    tracked(ctx, label, 80, ty + 36, 16, 'Montserrat-Medium', 2, 'left');
    ty += px + 78;
  }

  // style frames
  heading(1840, 'STYLE FRAMES · 1080×1920 GRID · META SAFE ZONE', 'স্টাইল ফ্রেম');
  const fw = 405;
  const fh = 720;
  const gap = (W - 160 - fw * 3) / 2;
  for (let i = 0; i < FRAMES.length; i++) {
    const [en, bnCap, fn] = FRAMES[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 80 + col * (fw + gap);
    const y = 1890 + row * (fh + 130);
    ctx.save();
    rr(ctx, x, y, fw, fh, 22);
    ctx.clip();
    ctx.translate(x, y);
    ctx.scale(fw / 1080, fh / 1920);
    fn(ctx, L, P, line, mood);
    safeOverlay(ctx, L.dark ? 'rgba(201,206,212,0.55)' : 'rgba(90,26,46,0.45)');
    ctx.restore();
    ctx.save();
    rr(ctx, x, y, fw, fh, 22);
    ctx.strokeStyle = L.dark ? 'rgba(255,255,255,0.18)' : 'rgba(42,20,28,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = ink;
    tracked(ctx, en, x, y + fh + 42, 19, 'Montserrat-SemiBold', 4, 'left');
    ctx.fillStyle = sub;
    bn(ctx, bnCap, x + fw, y + fh + 42, 22, 'HindSiliguri-Medium', 'right');
  }

  // grade · motion · music notes
  heading(3590, 'GRADE · MOTION · SOUND', 'কালার গ্রেড · মোশন · সাউন্ড');
  const g = line.grade;
  const m = T.motion[line.motion];
  const notes = [
    `Grade — ${g.look || `shadows ${g.shadowsTint} · highlights ${g.highlightsTint} · contrast ${g.contrast} · sat ${g.saturation}`}`,
    `Finish — grain ${g.grain} · vignette ${g.vignette} · bloom ${g.bloom || 'soft'} · never hue-shift the product`,
    `Motion "${line.motion}" — ${m.easing} · text in ${m.textIn} ms / out ${m.textOut} ms · camera push ${m.cameraPush}`,
    `Sound — ${line.music.bpm[0]}–${line.music.bpm[1]} BPM · ${line.music.keys.join(' / ')} · voice ${line.voiceId}`,
  ];
  notes.forEach((n, i) => {
    ctx.save();
    ctx.font = `18px "Montserrat-Medium", ${BN_FALLBACK}`;
    ctx.fillStyle = i % 2 ? sub : ink;
    ctx.fillText(n.length > 128 ? n.slice(0, 127) + '…' : n, 80, 3650 + i * 30);
    ctx.restore();
  });

  grain(ctx, W, H, L.dark ? 4 : 3);
  return c;
}

async function render(key) {
  const c = await board(key);
  const out = path.join(MIQA, 'brand/style-boards', `${key}-design-guide.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, c.toBuffer('image/jpeg', 90));
  console.log(`[style-board] ${path.relative(process.cwd(), out)}`);
}

const want = process.argv[2];
for (const key of want ? [want] : Object.keys(LINES)) await render(key);
