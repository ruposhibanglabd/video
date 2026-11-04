// MIQA Set-A video v2: Bengali/English text layers (4K, transparent PNG).
// Pango/HarfBuzz shaping via @napi-rs/canvas. Run: node text_layers.mjs
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/TiroBangla-Regular.ttf`, 'Tiro');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-MediumItalic.ttf`, 'CormMI');

const W = 2160, H = 3840;
const OUT = 'miqa/products/2026-11-04_set-a-video/plates/layers';
fs.mkdirSync(OUT, { recursive: true });

const INK = '#2A141C', PEARL = '#FBF4F1', ROSEWOOD = '#9E4A63', BURGUNDY = '#5A1A2E', CHAMP = '#D9B779';

function layer(name, draw) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  draw(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}

function shadow(ctx, blur, color, dx = 0, dy = 6) {
  ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx; ctx.shadowOffsetY = dy;
}
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

function centerText(ctx, text, x, y, font, fill, opts = {}) {
  const { shadowBlur = 0, shadowColor = 'rgba(42,20,28,0.55)' } = opts;
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (shadowBlur) shadow(ctx, shadowBlur, shadowColor);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  noShadow(ctx);
}

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#B8925A'); g.addColorStop(0.45, '#F3E1B5'); g.addColorStop(0.72, '#D9B779'); g.addColorStop(1, '#C9A061');
  return g;
}

function wordmark(ctx, cx, y, size, tracking = 0.35) {
  const font = `${size}px CinzelM`;
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...'MIQA'];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const track = size * tracking;
  const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let x = cx - total / 2;
  shadow(ctx, size * 0.12, 'rgba(90,26,46,0.5)');
  for (let i = 0; i < chars.length; i++) {
    ctx.fillStyle = goldGradient(ctx, x, y - size, x + widths[i], y);
    ctx.fillText(chars[i], x, y);
    x += widths[i] + track;
  }
  noShadow(ctx);
}

function pill(ctx, cx, cy, text, fontPx, opts = {}) {
  const { bg = BURGUNDY, fg = PEARL, padX = 88, padY = 38 } = opts;
  ctx.font = `${fontPx}px HindSB`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2, h = fontPx + padY * 2;
  ctx.beginPath();
  const r = h / 2;
  ctx.moveTo(cx - w / 2 + r, cy - h / 2);
  ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r);
  ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r);
  ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r);
  ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r);
  ctx.closePath();
  ctx.fillStyle = bg; ctx.fill();
  centerText(ctx, text, cx, cy + fontPx * 0.35, `${fontPx}px HindSB`, fg);
}

function sealRings(ctx, cx, cy, r) {
  ctx.strokeStyle = CHAMP; ctx.lineWidth = 6; ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2); ctx.stroke();
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = CHAMP;
    ctx.fillRect(-9, -9, 18, 18); ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ---- s1 hook ----
layer('t_hook', ctx => {
  centerText(ctx, 'ছোট্ট একটি ঘড়ি,', 1080, 2820, '132px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'পুরো লুক বদলে দেয়।', 1080, 3000, '132px HindSB', PEARL, { shadowBlur: 26 });
  ctx.fillStyle = CHAMP; ctx.fillRect(1080 - 170, 3070, 340, 5);
});

// ---- s2 reveal wordmark + tagline (with soft scrim) ----
layer('t_wordmark', ctx => {
  const rg = ctx.createRadialGradient(1080, 2740, 60, 1080, 2740, 980);
  rg.addColorStop(0, 'rgba(42,14,24,0.62)'); rg.addColorStop(0.55, 'rgba(42,14,24,0.38)'); rg.addColorStop(1, 'rgba(42,14,24,0)');
  ctx.fillStyle = rg; ctx.fillRect(100, 2350, 1960, 900);
  wordmark(ctx, 1080, 2640, 150);
  centerText(ctx, 'Beyond Time, Beyond Style.', 1080, 2870, 'italic 96px CormMI', 'rgba(251,244,241,0.92)', { shadowBlur: 18 });
});

// ---- s3 lock ----
layer('t_lock', ctx => {
  centerText(ctx, 'বাটারফ্লাই লক', 1080, 2760, '136px HindSB', INK);
  centerText(ctx, 'সহজে খোলা-বন্ধ হয়, হাতে পরে আরামদায়ক', 1080, 2930, '78px HindM', 'rgba(90,26,46,0.82)');
  ctx.fillStyle = CHAMP; ctx.fillRect(1080 - 150, 3010, 300, 4);
});

// ---- s4 water ----
layer('t_water', ctx => {
  centerText(ctx, 'ওয়াটার রেজিস্ট্যান্ট', 1080, 2740, '128px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'হালকা পানির ছিটা সহনশীল — পানিতে ডুবাবেন না', 1080, 2910, '74px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 20 });
});

// ---- s5 color ----
layer('t_color', ctx => {
  centerText(ctx, 'চেনের কালার গ্যারান্টি', 1080, 2760, '128px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'কালার ধরে রাখে দীর্ঘদিন', 1080, 2925, '78px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 20 });
});

// ---- s6 replace (pearl text over lifestyle photo) ----
layer('t_replace', ctx => {
  centerText(ctx, '৭ দিনের রিপ্লেসমেন্ট সুবিধা', 1080, 2760, '122px HindSB', PEARL, { shadowBlur: 28 });
  centerText(ctx, 'ক্রয়ের ৭ দিনের মধ্যে সমস্যা হলে রিপ্লেসমেন্ট', 1080, 2925, '74px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 22 });
  ctx.fillStyle = CHAMP; ctx.fillRect(1080 - 160, 3005, 320, 4);
});

// ---- s7 warranty ----
layer('t_warranty', ctx => {
  sealRings(ctx, 1080, 2430, 160);
  centerText(ctx, '৬ মাস', 1080, 2485, '100px Tiro', '#D9B779');
  centerText(ctx, '৬ মাসের ওয়ারেন্টি', 1080, 2790, '132px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'নিশ্চিন্তে পরুন', 1080, 2955, '80px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 20 });
});

// ---- s8 collection glance (count + tagline) ----
layer('t_collection', ctx => {
  centerText(ctx, '১২টি কালার ও ডিজাইন', 1080, 2900, '128px HindSB', PEARL, { shadowBlur: 34 });
  centerText(ctx, 'প্রতিটি স্টাইলে, প্রতিটি মুহূর্তে', 1080, 3080, '84px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 26 });
});

// ---- s9 price ----
layer('t_price', ctx => {
  const font = '520px Tiro';
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 40, 'rgba(42,14,24,0.7)', 0, 14);
  ctx.fillStyle = goldGradient(ctx, 1080 - 520, 1300, 1080 + 520, 1820);
  ctx.fillText('৳৫৯৯', 1080, 1770);
  noShadow(ctx);
  centerText(ctx, 'মাত্র ৫৯৯ টাকা', 1080, 2020, '108px HindSB', PEARL, { shadowBlur: 22 });
  pill(ctx, 1080, 2310, 'ক্যাশ অন ডেলিভারি', 82);
});

// ---- s10 5% (verbatim + employment line) ----
layer('t_5', ctx => {
  sealRings(ctx, 1080, 1180, 260);
  centerText(ctx, '৫%', 1080, 1290, '210px Tiro', BURGUNDY);
  centerText(ctx, 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।', 1080, 2560, '104px HindSB', INK);
  centerText(ctx, 'লভ্যাংশের ৫% পথশিশুদের কর্মসংস্থানে ব্যয় হবে।', 1080, 2750, '76px HindM', 'rgba(90,26,46,0.85)');
  wordmark(ctx, 1080, 3140, 96);
});

// ---- s11 cta + end card ----
layer('t_cta', ctx => {
  pill(ctx, 1080, 1210, 'ক্যাশ অন ডেলিভারি', 86);
  centerText(ctx, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে', 1080, 1620, '116px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'এখনই অর্ডার করুন।', 1080, 1810, '116px HindSB', PEARL, { shadowBlur: 26 });
  ctx.strokeStyle = CHAMP; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(980, 2110); ctx.lineTo(1080, 2210); ctx.lineTo(1180, 2110); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(980, 2270); ctx.lineTo(1080, 2370); ctx.lineTo(1180, 2270); ctx.stroke();
});

layer('t_endcard', ctx => {
  wordmark(ctx, 1080, 1800, 180);
  centerText(ctx, 'Beyond Time, Beyond Style.', 1080, 2040, 'italic 100px CormMI', 'rgba(251,244,241,0.92)', { shadowBlur: 18 });
});

// droplet sprite for water scene
layer('t_drop', ctx => {
  const c2 = createCanvas(256, 256); const x = c2.getContext('2d');
  const g = x.createRadialGradient(110, 100, 10, 128, 128, 120);
  g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(0.25, 'rgba(255,255,255,0.25)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(128, 128, 120, 0, Math.PI * 2); x.fill();
  ctx.drawImage(c2, 0, 0);
});
console.log('ALL LAYERS DONE');
