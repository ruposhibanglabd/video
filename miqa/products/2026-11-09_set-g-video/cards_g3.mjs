/**
 * Set G — "Midnight Precision" card art (2160×3840 base, rendered straight to
 * 1080×1920 PNG for the 1080 copy; the 4K master re-renders at 2× via SCALE).
 *
 * Playbook structure (PLAYBOOK §1): hook · reveal · 4 features · collection ·
 * price · 5% · CTA. Mandatory copy from BRAND-BIBLE §3 is drawn verbatim.
 * Look: MENS-DESIGN-GUIDE "Midnight Precision" — obsidian base, strip-lit
 * edges, graphite hairlines, brass used sparingly, bone type.
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import { execFileSync } from 'child_process';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/AnekBanglaSemiCondensed-Bold.ttf`, 'AnekSC');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');

const IMG = 'miqa/deliveries/2026-11-09_set-g-video/website';
const VO = 'miqa/products/2026-11-09_set-g-video/audio/vo3';
const BASE = 'miqa/products/2026-11-09_set-g-video';
const WORK = `${BASE}/work`;
const FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const FP = 'node_modules/@ffprobe-installer/linux-x64/ffprobe';

const SCALE = Number(process.env.SCALE || 1);
const W = 1080 * SCALE, H = 1920 * SCALE, S = (n) => Math.round(n * SCALE);
const M = S(88);                       // page margin
const WID = W - M * 2;

const C = {
  obs: '#0B0D10', midnight: '#0F1B2D', gun: '#2B3138', graphite: '#5C6670',
  steel: '#C9CED4', bone: '#F2F0EB', brass: '#C9A45C', cognac: '#8A4B24',
};

/* ─────────────────────────────────────────── type helpers */
function spaced(ctx, text, x, y, font, size, color, sp = 6, align = 'left') {
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * (widths.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  [...text].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += widths[i] + sp; });
  return total;
}

function wrap(ctx, text, font, maxW) {
  ctx.font = font;
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const t = `${line} ${words[i]}`;
      if (ctx.measureText(t).width > maxW) { out.push(line); line = words[i]; } else line = t;
    }
    out.push(line);
  }
  return out;
}

/* ─────────────────────────────────────────── stage: obsidian + strip light */
function stage({ key = 0.5, warmth = 0.0, poolY = 0.42 } = {}) {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * 0.35, H);
  lg.addColorStop(0, '#11151A');
  lg.addColorStop(0.45, C.obs);
  lg.addColorStop(1, '#07090B');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);

  // key pool behind the product
  const rg = g.createRadialGradient(W * 0.5, H * poolY, 0, W * 0.5, H * poolY, W * 1.0);
  rg.addColorStop(0, `rgba(25,33,41,${0.85 * key})`);
  rg.addColorStop(0.5, `rgba(15,20,26,${0.5 * key})`);
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);

  if (warmth > 0) {
    const wg = g.createRadialGradient(W * 0.14, H * 0.86, 0, W * 0.14, H * 0.86, W * 0.75);
    wg.addColorStop(0, `rgba(201,164,92,${0.10 * warmth})`);
    wg.addColorStop(1, 'rgba(201,164,92,0)');
    g.fillStyle = wg; g.fillRect(0, 0, W, H);
  }

  // vertical strip light on the left edge (brushed-steel edge cut)
  const sl = g.createLinearGradient(0, 0, S(210), 0);
  sl.addColorStop(0, 'rgba(201,206,212,0.055)');
  sl.addColorStop(1, 'rgba(201,206,212,0)');
  g.fillStyle = sl; g.fillRect(0, 0, S(210), H);

  // technical hairline grid, very faint
  g.strokeStyle = 'rgba(201,206,212,0.035)'; g.lineWidth = Math.max(1, S(1));
  for (let x = 0; x < W; x += S(72)) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  return c;
}

/**
 * "photograph on the dark table" panel.
 * The client stills are shot on a light stage; grading them dark turns them into
 * grey slabs, and cutting them out is not allowed. So each still keeps its own
 * light (that is the product's real colour) and is presented as a *deliberate*
 * object: rounded corners, a hairline brass frame, a deep drop shadow and a
 * mid-grey mat — a print laid on obsidian, not a pasted rectangle.
 */
async function product(g, file, { x, y, w, h, src = null, r = 22, frame = true, shadow = 1 }) {
  const im = await loadImage(`${IMG}/${file}`);
  const [sx, sy, sw, sh] = src || [0, 0, im.width, im.height];
  const k = Math.max(w / sw, h / sh);
  const cw = Math.round(sw * k), chh = Math.round(sh * k);

  const pc = createCanvas(w, h), p = pc.getContext('2d');
  p.imageSmoothingQuality = 'high';
  p.save();
  p.beginPath();
  if (p.roundRect) p.roundRect(0, 0, w, h, r); else p.rect(0, 0, w, h);
  p.clip();
  p.drawImage(im, sx, sy, sw, sh, (w - cw) / 2, (h - chh) / 2, cw, chh);
  // subtle inner vignette so the print sits in the dark
  const vg = p.createLinearGradient(0, 0, 0, h);
  vg.addColorStop(0, 'rgba(11,13,16,.22)');
  vg.addColorStop(0.18, 'rgba(11,13,16,0)');
  vg.addColorStop(0.84, 'rgba(11,13,16,0)');
  vg.addColorStop(1, 'rgba(11,13,16,.30)');
  p.fillStyle = vg; p.fillRect(0, 0, w, h);
  p.restore();

  g.save();
  if (shadow > 0) {
    g.shadowColor = `rgba(0,0,0,${0.72 * shadow})`;
    g.shadowBlur = S(70) * shadow;
    g.shadowOffsetY = S(26) * shadow;
  }
  g.drawImage(pc, x, y);
  g.restore();

  if (frame) {
    g.strokeStyle = 'rgba(201,164,92,.34)';
    g.lineWidth = Math.max(1.5, S(1.6));
    g.beginPath();
    if (g.roundRect) g.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, r); else g.rect(x, y, w, h);
    g.stroke();
  }
}

function hairline(g, y, x0 = M, x1 = W - M, alpha = 0.18) {
  g.fillStyle = `rgba(201,206,212,${alpha})`;
  g.fillRect(x0, y, x1 - x0, Math.max(1, S(1)));
}

function brassRule(g, y, w = S(46)) {
  g.fillStyle = C.brass; g.fillRect(M, y, w, Math.max(2, S(2)));
}

function label(g, txt, y, color = 'rgba(201,206,212,.55)') {
  spaced(g, txt, M, y, 'MontSB', S(24), color, S(5));
}

function bigBangla(g, lines, y, { size = 96, color = C.bone, lh = 1.12, font = 'AnekXB' } = {}) {
  g.font = `${S(size)}px ${font}`; g.fillStyle = color;
  const step = S(size * lh);
  lines.forEach((l, i) => g.fillText(l, M, y + i * step));
  return y + (lines.length - 1) * step;
}

/* ─────────────────────────────────────────── scene cards */
const cards = {};

/* S1 · HOOK — macro dial, 3 words, price anchor (PLAYBOOK §3 visual-first) */
async function hook() {
  const c = stage({ key: 0.6, poolY: 0.40 }), g = c.getContext('2d');
  await product(g, 'set-g-02-twotone-navy_3_dial.jpg', {
    x: S(-10), y: S(150), w: W + S(20), h: S(1000), src: [170, 130, 1260, 1160], r: S(26), shadow: 1.1,
  });
  brassRule(g, S(218));
  label(g, 'MIQA · STEEL NIGHT', S(300));
  bigBangla(g, ['সময় যার হাতে'], S(1300), { size: 100 });
  bigBangla(g, ['আত্মবিশ্বাস তার চোখে'], S(1410), { size: 100, color: C.steel });
  g.fillStyle = 'rgba(201,206,212,.5)'; g.font = `${S(30)}px HindR`;
  g.fillText('ছেলেদের হাতঘড়ি · পাঁচটি ফিনিশ', M, S(1510));
  hairline(g, S(1600));
  g.fillStyle = C.brass; g.font = `${S(64)}px AnekXB`;
  g.fillText('৳৮৫০', M, S(1710));
  g.fillStyle = 'rgba(201,206,212,.55)'; g.font = `${S(26)}px HindSB`;
  g.fillText('ক্যাশ অন ডেলিভারি', M + S(220), S(1700));
  spaced(g, 'FOR MEN · 01', W - M, S(1710), 'MontSB', S(22), 'rgba(201,206,212,.4)', S(5), 'right');
  return c;
}

/* S2 · REVEAL — collection line, full row, MIQA once */
async function reveal() {
  const c = stage({ key: 0.55, poolY: 0.36 }), g = c.getContext('2d');
  await product(g, 'set-g_shared_group.jpg', {
    x: S(20), y: S(230), w: W - S(40), h: S(660), src: [20, 420, 1560, 1080], r: S(24), shadow: 1,
  });
  brassRule(g, S(232));
  spaced(g, 'MIQA', M, S(300), 'CinzelM', S(46), C.bone, S(14));
  spaced(g, 'STEEL NIGHT', W - M, S(296), 'MontSB', S(22), 'rgba(201,206,212,.5)', S(6), 'right');

  hairline(g, S(1040), M, W - M, 0.14);
  bigBangla(g, ['মিকা নিয়ে এলো ছেলেদের', 'স্পেশাল ঘড়ির কালেকশন'], S(1180), { size: 88, lh: 1.2 });
  g.fillStyle = 'rgba(201,206,212,.62)'; g.font = `${S(32)}px HindR`;
  g.fillText('একই কেস · পাঁচটি ফিনিশ · একই দাম', M, S(1420));
  hairline(g, S(1520), M, W - M, 0.14);
  const feats = ['বাটারফ্লাই লক', 'ওয়াটার রেজিস্ট্যান্ট', 'কোয়ালিটি: Good'];
  feats.forEach((f, i) => {
    g.fillStyle = C.steel; g.font = `${S(28)}px AnekSB`;
    g.fillText(f, M, S(1610) + i * S(58));
  });
  g.fillStyle = C.brass; g.font = `${S(56)}px AnekXB`;
  g.fillText('৳৮৫০', W - M - S(170), S(1620));
  return c;
}

/* S3 · FEATURE 1 — butterfly lock (hero feature: longest, most cinematic) */
async function lock() {
  const c = stage({ key: 0.75, poolY: 0.38, warmth: 0.7 }), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-04-gold-navy_4_bracelet.jpg`);
  // circular lens = macro probe look
  const R = S(400), cx = W / 2, cy = S(760);
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  g.drawImage(im, S(150), S(60), S(1240), S(900), cx - R, cy - R, R * 2, R * 2);
  g.restore();
  g.strokeStyle = 'rgba(201,206,212,.30)'; g.lineWidth = Math.max(2, S(2));
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(201,164,92,.35)'; g.lineWidth = Math.max(1, S(1.5));
  g.beginPath(); g.arc(cx, cy, R + S(16), 0, Math.PI * 2); g.stroke();
  // measurement ticks (technical layer, mens guide)
  g.strokeStyle = 'rgba(201,206,212,.28)';
  for (let a = 0; a < 8; a++) {
    const th = (a / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(th) * (R + S(26)), cy + Math.sin(th) * (R + S(26)));
    g.lineTo(cx + Math.cos(th) * (R + S(44)), cy + Math.sin(th) * (R + S(44)));
    g.stroke();
  }
  brassRule(g, S(1300));
  label(g, 'FEATURE 01 · BUTTERFLY LOCK', S(1380));
  bigBangla(g, ['বাটারফ্লাই লক'], S(1510), { size: 108 });
  g.fillStyle = 'rgba(201,206,212,.66)'; g.font = `${S(34)}px HindR`;
  wrap(g, 'দুই পাশ থেকে ভাঁজ হয়ে বন্ধ হয় — পাঁচ-লিংক জুবিলি ব্রেসলেটে।', `${S(34)}px HindR`, WID)
    .forEach((l, i) => g.fillText(l, M, S(1580) + i * S(48)));
  hairline(g, S(1720));
  spaced(g, '5-LINK JUBILEE · STEEL NIGHT', M, S(1782), 'MontSB', S(22), 'rgba(201,206,212,.42)', S(5));
  return c;
}

/* S4 · FEATURE 2 — fluted bezel + dial details */
async function bezel() {
  const c = stage({ key: 0.5, poolY: 0.34 }), g = c.getContext('2d');
  await product(g, 'set-g-05-gold-champagne_3_dial.jpg', {
    x: S(40), y: S(210), w: W - S(80), h: S(900), src: [140, 90, 1330, 1290], r: S(24), shadow: 1,
  });
  brassRule(g, S(1268));
  label(g, 'FEATURE 02 · DIAL', S(1348));
  bigBangla(g, ['ফ্লুটেড রেজেল', 'আর ডায়ালের ডিটেইল'], S(1470), { size: 88, lh: 1.16 });
  g.fillStyle = 'rgba(201,206,212,.66)'; g.font = `${S(32)}px HindR`;
  g.fillText('XII ও VI · পাথর বসানো মার্কার · ম্যাগনিফায়ার সহ তারিখ', M, S(1650));
  hairline(g, S(1730));
  spaced(g, 'SUPERLATIVE FINISH · FOR MEN', M, S(1792), 'MontSB', S(22), 'rgba(201,206,212,.42)', S(5));
  return c;
}

/* S5 · FEATURE 3 — water resistant (split, wrist) */
async function water() {
  const c = stage({ key: 0.45, poolY: 0.45 }), g = c.getContext('2d');
  const im = await loadImage(`${IMG}/set-g-03-twotone-slate_5_wrist.jpg`);
  const pw = W - S(520), ph = H;
  const pc = createCanvas(pw, ph), p = pc.getContext('2d');
  const k = Math.max(pw / 1600, ph / 1600);
  p.drawImage(im, (pw - 1600 * k) / 2, (ph - 1600 * k) / 2, 1600 * k, 1600 * k);
  const gx = p.createLinearGradient(0, 0, pw * 0.36, 0);
  gx.addColorStop(0, 'rgba(11,13,16,1)'); gx.addColorStop(1, 'rgba(11,13,16,0)');
  p.fillStyle = gx; p.fillRect(0, 0, pw * 0.36, ph);
  const gd = p.createLinearGradient(0, 0, 0, ph);
  gd.addColorStop(0, 'rgba(11,13,16,.85)'); gd.addColorStop(0.2, 'rgba(11,13,16,0)');
  gd.addColorStop(0.86, 'rgba(11,13,16,0)'); gd.addColorStop(1, 'rgba(11,13,16,.95)');
  p.fillStyle = gd; p.fillRect(0, 0, pw, ph);
  g.drawImage(pc, S(520), 0);
  g.fillStyle = 'rgba(201,164,92,.45)'; g.fillRect(S(520), 0, Math.max(2, S(2)), H);

  brassRule(g, S(300));
  label(g, 'FEATURE 03 · WATER', S(380));
  bigBangla(g, ['ওয়াটার', 'রেজিস্ট্যান্ট'], S(510), { size: 92 });
  g.fillStyle = 'rgba(201,206,212,.66)'; g.font = `${S(30)}px HindR`;
  ['হাত ধোয়া, বৃষ্টি, ঘাম —', 'সাধারণ ব্যবহারে নিরাপদ।'].forEach((l, i) => g.fillText(l, M, S(760) + i * S(44)));
  ['ঘামে সমস্যা নেই', 'বৃষ্টিতে পরা যায়', 'হাত ধুলেও ঠিক'].forEach((t, i) => {
    g.fillStyle = C.steel; g.fillRect(M, S(900) + i * S(78), S(18), Math.max(2, S(2)));
    g.fillStyle = 'rgba(242,240,235,.82)'; g.font = `${S(28)}px AnekSB`;
    g.fillText(t, M + S(34), S(912) + i * S(78));
  });
  g.fillStyle = 'rgba(201,206,212,.45)'; g.font = `${S(24)}px HindR`;
  g.fillText('পানিতে ডুবিয়ে ব্যবহারের জন্য নয়', M, S(1180));
  hairline(g, S(1730), M, S(520), 0.16);
  spaced(g, 'STEEL NIGHT', M, S(1792), 'MontSB', S(22), 'rgba(201,206,212,.42)', S(5));
  return c;
}

/* S6 · FEATURE 4 — quality + warranty */
async function promise() {
  const c = stage({ key: 0.5, poolY: 0.30, warmth: 0.5 }), g = c.getContext('2d');
  await product(g, 'set-g-01-black_2_angle.jpg', {
    x: S(120), y: S(190), w: W - S(240), h: S(820), src: [190, 60, 1260, 1300], r: S(24), shadow: 1,
  });
  brassRule(g, S(1080));
  label(g, 'FEATURE 04 · ASSURANCE', S(1160));
  bigBangla(g, ['কোয়ালিটি: Good'], S(1290), { size: 96 });
  const rows = [['১ বছর', 'ওয়ারেন্টি'], ['কালার', 'গ্যারেন্টি'], ['৭ দিন', 'রিপ্লেসমেন্ট']];
  rows.forEach(([a, b], i) => {
    const y = S(1400) + i * S(110);
    hairline(g, y - S(34), M, W - M, 0.12);
    g.fillStyle = C.bone; g.font = `${S(44)}px AnekXB`; g.fillText(a, M, y + S(26));
    g.fillStyle = 'rgba(201,206,212,.7)'; g.font = `${S(32)}px AnekSB`; g.fillText(b, M + S(250), y + S(26));
  });
  hairline(g, S(1400) + 3 * S(110) - S(34), M, W - M, 0.12);
  spaced(g, 'QUALITY GOOD · ৳৮৫০', M, S(1792), 'MontSB', S(22), 'rgba(201,206,212,.42)', S(5));
  return c;
}

/* S7 · COLLECTION — five finishes, each its own frame, hard cut on the pad */
async function collection() {
  const c = stage({ key: 0.4, poolY: 0.42 }), g = c.getContext('2d');
  brassRule(g, S(230));
  label(g, 'COLLECTION · FIVE FINISHES', S(310));
  const tiles = [
    'set-g-01-black', 'set-g-02-twotone-navy', 'set-g-03-twotone-slate',
    'set-g-04-gold-navy', 'set-g-05-gold-champagne',
  ];
  const tw = (W - M * 2 - S(18) * 2) / 3, th = S(430);
  const ys = [S(400), S(400), S(400), S(860), S(860)];
  for (let i = 0; i < 5; i++) {
    const x = i < 3 ? M + i * (tw + S(18)) : M + (i - 3) * ((WID - tw) / 1) / 1;
    const xx = i < 3 ? M + i * (tw + S(18)) : M + (i - 3) * (tw + S(18));
    const im = await loadImage(`${IMG}/${tiles[i]}_1_main.jpg`);
    const pc = createCanvas(tw, th), p = pc.getContext('2d');
    const k = Math.max(tw / 1300, th / 1150);
    p.save();
    p.beginPath();
    if (p.roundRect) p.roundRect(0, 0, tw, th, S(14)); else p.rect(0, 0, tw, th);
    p.clip();
    p.drawImage(im, 150, 20, 1300, 1150, (tw - 1300 * k) / 2, (th - 1150 * k) / 2, 1300 * k, 1150 * k);
    p.restore();
    g.drawImage(pc, xx, ys[i]);
    g.strokeStyle = 'rgba(201,164,92,.28)'; g.lineWidth = Math.max(1, S(1.2));
    g.beginPath();
    if (g.roundRect) g.roundRect(xx, ys[i], tw, th, S(14)); else g.rect(xx, ys[i], tw, th);
    g.stroke();
  }
  bigBangla(g, ['কালো, টু-টোন, সোনালি'], S(1420), { size: 74 });
  g.fillStyle = 'rgba(201,206,212,.62)'; g.font = `${S(30)}px HindR`;
  g.fillText('একই কেস · একই ব্রেসলেট · একই দাম ৳৮৫০', M, S(1520));
  hairline(g, S(1600));
  spaced(g, 'FIVE FINISHES · ONE PRICE', M, S(1660), 'MontSB', S(22), 'rgba(201,206,212,.42)', S(5));
  return c;
}

/* S8 · PRICE — ৳850 + COD badge (PLAYBOOK §5) */
async function price() {
  const c = stage({ key: 0.62, poolY: 0.36, warmth: 0.9 }), g = c.getContext('2d');
  await product(g, 'set-g-04-gold-navy_1_main.jpg', {
    x: S(250), y: S(180), w: W - S(500), h: S(880), src: [230, 40, 1150, 1100], r: S(24), shadow: 1.1,
  });
  brassRule(g, S(1160));
  label(g, 'PRICE', S(1240));
  g.fillStyle = C.brass; g.font = `${S(200)}px AnekXB`;
  g.fillText('৳৮৫০', M, S(1430));
  g.fillStyle = C.bone; g.font = `${S(38)}px HindSB`;
  g.fillText('সব ফিনিশে একই দাম', M, S(1500));
  // COD badge
  g.beginPath();
  if (g.roundRect) g.roundRect(M, S(1560), S(430), S(96), S(48)); else g.fillRect(M, S(1560), S(430), S(96));
  g.fillStyle = 'rgba(201,164,92,.16)'; g.fill();
  g.strokeStyle = 'rgba(201,164,92,.55)'; g.lineWidth = Math.max(2, S(2)); g.stroke();
  g.fillStyle = C.brass; g.font = `${S(30)}px AnekSB`;
  g.fillText('ক্যাশ অন ডেলিভারি', M + S(34), S(1622));
  spaced(g, '1 YEAR WARRANTY · 7-DAY REPLACEMENT', M, S(1792), 'MontSB', S(22), 'rgba(201,206,212,.42)', S(4));
  return c;
}

/* S9 · 5% — the mandatory, verbatim, calm seal (BRAND-BIBLE §3) */
async function fivePercent() {
  const c = stage({ key: 0.3, poolY: 0.5 }), g = c.getContext('2d');
  const cx = W / 2, cy = S(760), R = S(250);
  g.strokeStyle = 'rgba(201,164,92,.55)'; g.lineWidth = Math.max(2, S(2));
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(201,164,92,.22)'; g.lineWidth = Math.max(1, S(1));
  g.beginPath(); g.arc(cx, cy, R - S(22), 0, Math.PI * 2); g.stroke();
  g.textAlign = 'center';
  g.fillStyle = C.brass; g.font = `${S(120)}px AnekXB`;
  g.fillText('৫%', cx, cy + S(20));
  g.fillStyle = 'rgba(242,240,235,.72)'; g.font = `${S(24)}px HindSB`;
  g.fillText('মুনাফা', cx, cy + S(80));
  g.textAlign = 'left';

  g.fillStyle = C.bone; g.font = `${S(40)}px HindSB`;
  const line = 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।';
  const w = g.measureText(line).width;
  g.fillText(line, (W - w) / 2, S(1180));
  hairline(g, S(1240), S(200), W - S(200), 0.14);
  g.fillStyle = 'rgba(201,206,212,.5)'; g.font = `${S(26)}px HindR`;
  const sub = 'প্রতিটি অর্ডার থেকে, নীরবে';
  const w2 = g.measureText(sub).width;
  g.fillText(sub, (W - w2) / 2, S(1300));
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', W / 2, S(1760), 'MontSB', S(22), 'rgba(201,206,212,.38)', S(6), 'center');
  return c;
}

/* S10 · CTA — verbatim lines + chevron + tagline (BRAND-BIBLE §3) */
async function cta() {
  const c = stage({ key: 0.55, poolY: 0.32, warmth: 0.6 }), g = c.getContext('2d');
  await product(g, 'set-g-05-gold-champagne_2_angle.jpg', {
    x: S(170), y: S(160), w: W - S(340), h: S(720), src: [180, 40, 1250, 1280], r: S(24), shadow: 1,
  });
  g.fillStyle = C.brass; g.font = `${S(150)}px AnekXB`;
  g.fillText('৳৮৫০', M, S(1030));
  g.fillStyle = C.bone; g.font = `${S(34)}px HindSB`;
  g.fillText('ছেলেদের স্পেশাল ঘড়ির কালেকশন', M, S(1100));
  brassRule(g, S(1160));
  g.fillStyle = C.brass; g.font = `${S(40)}px AnekSB`;
  g.fillText('ক্যাশ অন ডেলিভারি', M, S(1250));
  g.fillStyle = 'rgba(242,240,235,.88)'; g.font = `${S(34)}px HindSB`;
  wrap(g, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন।', `${S(34)}px HindSB`, WID)
    .forEach((l, i) => g.fillText(l, M, S(1320) + i * S(50)));
  // chevron
  g.strokeStyle = C.brass; g.lineWidth = Math.max(3, S(3)); g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const y = S(1500) + i * S(38);
    g.beginPath(); g.moveTo(W / 2 - S(26), y); g.lineTo(W / 2, y + S(26)); g.lineTo(W / 2 + S(26), y); g.stroke();
  }
  hairline(g, S(1720), M, W - M, 0.14);
  spaced(g, 'MIQA', M, S(1790), 'CinzelM', S(32), 'rgba(242,240,235,.7)', S(12));
  spaced(g, 'BEYOND TIME, BEYOND STYLE.', W - M, S(1786), 'MontSB', S(20), 'rgba(201,206,212,.42)', S(4), 'right');
  return c;
}

/* ─────────────────────────────────────────── timeline + mix */
const probe = (f) => Number(execFileSync(FP, [
  '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f,
]).toString().trim());

const VO_LINES = [
  ['01_reveal', 'reveal'], ['02_lock', 'lock'], ['03_dial', 'bezel'],
  ['04_water', 'water'], ['05_promise', 'promise'], ['06_colours', 'collection'],
  ['07_price', 'price'], ['08_five', 'five'], ['09_cta', 'cta'],
];

const SCENE_ART = {
  hook, reveal, lock, bezel, water, promise, collection, price, five: fivePercent, cta,
};

async function main() {
  fs.mkdirSync(`${WORK}/cards`, { recursive: true });
  fs.mkdirSync(`${WORK}/video_g3`, { recursive: true });

  // ---- render every card once
  const order = ['hook', 'reveal', 'lock', 'bezel', 'water', 'promise', 'collection', 'price', 'five', 'cta'];
  for (const k of order) {
    const cnv = await SCENE_ART[k]();
    fs.writeFileSync(`${WORK}/cards/${k}.png`, cnv.toBuffer('image/png'));
    console.log('card', k, `${W}x${H}`);
  }

  // ---- timeline from measured VO durations (RUNBOOK §6: VO locks the timeline)
  const dur = VO_LINES.map(([file]) => probe(`${VO}/${file}.mp3`));
  const HOOK = 3.2;
  const SCENE_PAD = 0.7;
  const scenes = [{ card: 'hook', dur: HOOK, push: 0.06, sweep: 0.7 }];
  VO_LINES.forEach(([file, card], i) => {
    const isCta = card === 'cta';
    const d = dur[i] + (isCta ? 1.4 : SCENE_PAD);
    scenes.push({ card, dur: d, push: isCta ? 0.03 : 0.05, sweep: card === 'five' ? 0 : 0.5 });
  });
  const total = scenes.reduce((a, s) => a + s.dur, 0);
  fs.writeFileSync(`${WORK}/video_g3/timeline.json`, JSON.stringify({ scenes, total }, null, 1));
  console.log('timeline', scenes.map((s) => `${s.card}:${s.dur.toFixed(2)}`).join(' '), '=>', total.toFixed(2));

  // ---- music + sfx (original, synthesised) and the mix
  const py = '/tmp/venv/bin/python';
  if (fs.existsSync(py)) {
    execFileSync(py, [`${BASE}/audio_g.py`, `${WORK}/video_g3/timeline.json`, `${VO}`, `${WORK}/video_g3`], { stdio: 'inherit' });
  } else {
    console.log('no /tmp/venv — skipping music');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
