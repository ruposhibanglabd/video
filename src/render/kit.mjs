/**
 * CodePixel Web — cinematic drawing kit.
 * Deterministic canvas primitives: typography, gradients, film grain,
 * device frames and vector iconography. No network, no randomness.
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FONTS = path.join(ROOT, 'assets', 'fonts');

for (const [file, family] of [
  ['NotoSansBengali-Regular.ttf', 'BN'],
  ['NotoSansBengali-SemiBold.ttf', 'BN'],
  ['NotoSansBengali-Bold.ttf', 'BN'],
  ['NotoSansBengali-ExtraBold.ttf', 'BN'],
  ['Inter-Regular.ttf', 'Inter'],
  ['Inter-SemiBold.ttf', 'Inter'],
  ['Inter-Bold.ttf', 'Inter'],
  ['Inter-ExtraBold.ttf', 'Inter'],
]) {
  GlobalFonts.registerFromPath(path.join(FONTS, file), family);
}

/* ------------------------------------------------------------------ palette */
export const C = {
  navy: '#070B18',
  navy2: '#0B1224',
  panel: '#101A35',
  blue: '#287BFF',
  cyan: '#36D7FF',
  violet: '#7957FF',
  white: '#F7F9FF',
  muted: '#93A5C4',
  dim: '#5B6B8C',
  gold: '#C9A46A',
  cream: '#F7F4EE',
  ink: '#101319',
  green: '#35D3A0',
  red: '#FF6B81',
  amber: '#FFC466',
};

export const W = 1080;
export const H = 1920;
/** Facebook Reels safe area (keeps copy clear of platform UI). */
export const SAFE = { x: 64, y: 210, w: 952, h: 1290, right: 1016, bottom: 1500 };

/* ------------------------------------------------------------------ math */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOutQuint = (t) => 1 - Math.pow(1 - clamp(t), 5);
export const easeOutBack = (t) => {
  t = clamp(t);
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
/** Beat helper: 0..1 progress of an animation that starts at t0, lasts d. */
export const beat = (t, t0, d = 0.55, ease = easeOut) => ease((t - t0) / d);
/** Stagger delay helper. */
export const stag = (t, i, t0 = 0, gap = 0.12, d = 0.5) => beat(t, t0 + i * gap, d);

/* ------------------------------------------------------------------ color */
export function alpha(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function mix(hexA, hexB, t) {
  const pa = parseInt(hexA.replace('#', ''), 16);
  const pb = parseInt(hexB.replace('#', ''), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const b = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${g},${b})`;
}

/* ------------------------------------------------------------------ fonts + text */
const BN_RE = /[\u0980-\u09FF]/;
export const isBengali = (s) => BN_RE.test(s);
export function fontStr(size, weight = 700, text = '') {
  const fam = isBengali(text) ? 'BN, Inter' : 'Inter, BN';
  return `${weight} ${Math.round(size)}px ${fam}`;
}

/**
 * Draw text. Returns the measured width.
 * opts: { size, weight, color, align, maxWidth, letterSpacing, alpha, y baseline }
 */
export function text(ctx, str, x, y, opts = {}) {
  const {
    size = 40, weight = 700, color = C.white, align = 'left',
    maxWidth = Infinity, letterSpacing = 0, opacity = 1, baseline = 'alphabetic',
  } = opts;
  ctx.save();
  ctx.globalAlpha *= opacity;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  let s = size;
  ctx.font = fontStr(s, weight, str);
  if (letterSpacing) ctx.letterSpacing = `${letterSpacing}px`;
  let w = ctx.measureText(str).width;
  if (w > maxWidth) {
    const ratio = maxWidth / w;
    s = Math.max(size * ratio, size * 0.62);
    ctx.font = fontStr(s, weight, str);
    w = ctx.measureText(str).width;
    // if still over (rounding), squeeze via horizontal scale
    if (w > maxWidth) {
      ctx.translate(align === 'center' ? x : align === 'right' ? x : x, 0);
      ctx.scale(Math.min(1, maxWidth / w), 1);
      ctx.translate(align === 'center' ? -x : align === 'right' ? -x : -x, 0);
      w = maxWidth;
    }
  }
  ctx.fillText(str, x, y);
  ctx.restore();
  return w;
}

export function wrapLines(ctx, str, maxWidth, size, weight, maxLines = 6) {
  ctx.save();
  ctx.font = fontStr(size, weight, str);
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else line = test;
  }
  if (line && lines.length < maxLines) lines.push(line);
  ctx.restore();
  return lines;
}

/** Auto-fitting multi-line block. Returns total height used. */
export function paragraph(ctx, str, x, y, { maxWidth, size = 44, weight = 600, color = C.muted, lineHeight = 1.55, align = 'left', maxLines = 6, opacity = 1 }) {
  let s = size;
  let lines = wrapLines(ctx, str, maxWidth, s, weight, maxLines);
  // shrink if the wrap needs too many lines
  while (lines.length > maxLines && s > size * 0.7) {
    s *= 0.94;
    lines = wrapLines(ctx, str, maxWidth, s, weight, maxLines);
  }
  lines.forEach((ln, i) => {
    text(ctx, ln, align === 'center' ? x + maxWidth / 2 : x, y + i * s * lineHeight, {
      size: s, weight, color, align, opacity,
    });
  });
  return lines.length * s * lineHeight;
}

export function eyebrow(ctx, str, x, y, { color = C.cyan, opacity = 1, size = 24, align = 'left' } = {}) {
  const w = text(ctx, str.toUpperCase(), x, y, { size, weight: 600, color, opacity, letterSpacing: 3.4, align });
  return w;
}

/* ------------------------------------------------------------------ shapes */
export function rr(ctx, x, y, w, h, r = 24) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function fillRR(ctx, x, y, w, h, r, fill) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function strokeRR(ctx, x, y, w, h, r, stroke, lw = 1.5) {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

export function shadow(ctx, color = 'rgba(0,0,0,0.55)', blur = 40, oy = 24, ox = 0) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = ox;
  ctx.shadowOffsetY = oy;
}
export function noShadow(ctx) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

export function lin(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

export function glowOrb(ctx, x, y, r, color, a = 0.35) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, alpha(color, a));
  g.addColorStop(0.55, alpha(color, a * 0.35));
  g.addColorStop(1, alpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

export function line(ctx, x0, y0, x1, y1, color, lw = 1.5, dash = null) {
  ctx.save();
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ textures */
let grainCanvas = null;
export function grain(ctx, opacity = 0.05, w = W, h = H) {
  if (!grainCanvas) {
    grainCanvas = createCanvas(320, 568);
    const g = grainCanvas.getContext('2d');
    const img = g.createImageData(320, 568);
    let seed = 1337;
    for (let i = 0; i < img.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const v = 120 + (seed % 96);
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'overlay';
  for (let y = 0; y < h; y += 568) for (let x = 0; x < w; x += 320) ctx.drawImage(grainCanvas, x, y);
  ctx.restore();
}

export function vignette(ctx, w = W, h = H, strength = 0.5) {
  const g = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.2, w / 2, h * 0.5, w * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Cinematic base background: deep navy, dual aurora glows, vignette, grain. */
export function cinematicBG(ctx, t = 0, opts = {}) {
  const { w = W, h = H, drift = 1, violetSide = 'right' } = opts;
  ctx.fillStyle = opts.base || C.navy;
  ctx.fillRect(0, 0, w, h);
  const dx = Math.sin(t * 0.22) * 70 * drift;
  const dy = Math.cos(t * 0.17) * 50 * drift;
  glowOrb(ctx, w * 0.18 + dx, h * 0.22 + dy, w * 0.85, '#1E5BFF', 0.42);
  glowOrb(ctx, violetSide === 'right' ? w * 0.92 - dx * 0.6 : w * 0.4, h * 0.62 - dy, w * 0.8, '#6A48FF', 0.3);
  glowOrb(ctx, w * 0.5, h * 1.02, w * 0.9, '#0E7FA8', 0.18);
  vignette(ctx, w, h, 0.55);
  // subtle technical grid
  ctx.save();
  ctx.strokeStyle = 'rgba(130,175,255,0.045)';
  ctx.lineWidth = 1;
  const gs = 72;
  for (let x = ((t * 8) % gs) - gs; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
  grain(ctx, 0.045, w, h);
}

/** Diagonal light sweep across a region. p in 0..1 */
export function lightSweep(ctx, x, y, w, h, p, color = 'rgba(120,190,255,0.16)', width = 160) {
  if (p <= 0 || p >= 1.4) return;
  ctx.save();
  rr(ctx, x, y, w, h, 0);
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  const cx = x - width + (w + width * 2) * p;
  const g = ctx.createLinearGradient(cx - width, y, cx + width, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.45, color);
  g.addColorStop(0.55, color);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - width, y + h);
  ctx.lineTo(cx + width * 0.2, y - h * 0.1);
  ctx.lineTo(cx + width * 1.5, y - h * 0.1);
  ctx.lineTo(cx + width * 0.4, y + h * 1.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ icons */
export function icon(ctx, name, x, y, size = 32, color = C.white, lw = 2) {
  const s = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw / s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (name) {
    case 'search':
      ctx.beginPath(); ctx.arc(10.5, 10.5, 6.2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(15.4, 15.4); ctx.lineTo(21, 21); ctx.stroke();
      break;
    case 'cart':
      ctx.beginPath(); ctx.moveTo(2.5, 3); ctx.lineTo(5.4, 3); ctx.lineTo(7.6, 15.2); ctx.lineTo(18.8, 15.2); ctx.lineTo(21, 7); ctx.lineTo(6.2, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(9, 20, 1.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(18, 20, 1.5, 0, 7); ctx.fill();
      break;
    case 'bell':
      ctx.beginPath(); ctx.moveTo(18, 8.5); ctx.bezierCurveTo(18, 4.6, 15.3, 2, 12, 2); ctx.bezierCurveTo(8.7, 2, 6, 4.6, 6, 8.5); ctx.lineTo(6, 13); ctx.lineTo(4, 17); ctx.lineTo(20, 17); ctx.lineTo(18, 13); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, 20.5); ctx.quadraticCurveTo(12, 22.5, 14, 20.5); ctx.stroke();
      break;
    case 'check':
      ctx.beginPath(); ctx.moveTo(5, 12.5); ctx.lineTo(10, 17.5); ctx.lineTo(19.5, 6.5); ctx.stroke();
      break;
    case 'arrow':
      ctx.beginPath(); ctx.moveTo(4, 12); ctx.lineTo(20, 12); ctx.moveTo(14, 6); ctx.lineTo(20, 12); ctx.lineTo(14, 18); ctx.stroke();
      break;
    case 'arrowUpRight':
      ctx.beginPath(); ctx.moveTo(6, 18); ctx.lineTo(18, 6); ctx.moveTo(8, 6); ctx.lineTo(18, 6); ctx.lineTo(18, 16); ctx.stroke();
      break;
    case 'plus':
      ctx.beginPath(); ctx.moveTo(12, 5); ctx.lineTo(12, 19); ctx.moveTo(5, 12); ctx.lineTo(19, 12); ctx.stroke();
      break;
    case 'minus':
      ctx.beginPath(); ctx.moveTo(5, 12); ctx.lineTo(19, 12); ctx.stroke();
      break;
    case 'edit':
      ctx.beginPath(); ctx.moveTo(4, 20); ctx.lineTo(5.5, 15.5); ctx.lineTo(16, 5); ctx.lineTo(19, 8); ctx.lineTo(8.5, 18.5); ctx.closePath(); ctx.stroke();
      break;
    case 'trash':
      ctx.beginPath(); ctx.moveTo(4, 6.5); ctx.lineTo(20, 6.5); ctx.moveTo(9, 6.5); ctx.lineTo(9, 4); ctx.lineTo(15, 4); ctx.lineTo(15, 6.5);
      ctx.moveTo(6, 6.5); ctx.lineTo(7, 20); ctx.lineTo(17, 20); ctx.lineTo(18, 6.5); ctx.stroke();
      break;
    case 'truck':
      ctx.beginPath(); ctx.moveTo(2, 6); ctx.lineTo(14, 6); ctx.lineTo(14, 17); ctx.lineTo(2, 17); ctx.closePath();
      ctx.moveTo(14, 9); ctx.lineTo(18.5, 9); ctx.lineTo(22, 13); ctx.lineTo(22, 17); ctx.lineTo(14, 17); ctx.stroke();
      ctx.beginPath(); ctx.arc(7, 18.4, 2, 0, 7); ctx.arc(18, 18.4, 2, 0, 7); ctx.stroke();
      break;
    case 'box':
      ctx.beginPath(); ctx.moveTo(3, 7.5); ctx.lineTo(12, 3); ctx.lineTo(21, 7.5); ctx.lineTo(21, 16.5); ctx.lineTo(12, 21); ctx.lineTo(3, 16.5); ctx.closePath();
      ctx.moveTo(3, 7.5); ctx.lineTo(12, 12); ctx.lineTo(21, 7.5); ctx.moveTo(12, 12); ctx.lineTo(12, 21); ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath(); ctx.moveTo(12, 2.5); ctx.lineTo(20, 6); ctx.lineTo(20, 12); ctx.bezierCurveTo(20, 17, 16.5, 20.5, 12, 22); ctx.bezierCurveTo(7.5, 20.5, 4, 17, 4, 12); ctx.lineTo(4, 6); ctx.closePath(); ctx.stroke();
      break;
    case 'card':
      ctx.beginPath(); ctx.rect(2.5, 5, 19, 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2.5, 9.5); ctx.lineTo(21.5, 9.5); ctx.moveTo(6, 15.5); ctx.lineTo(10, 15.5); ctx.stroke();
      break;
    case 'cash':
      ctx.beginPath(); ctx.rect(2.5, 6, 19, 12); ctx.stroke();
      ctx.beginPath(); ctx.arc(12, 12, 3, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, 9); ctx.lineTo(6, 9); ctx.moveTo(18, 15); ctx.lineTo(18, 15); ctx.stroke();
      break;
    case 'chart':
      ctx.beginPath(); ctx.moveTo(4, 20); ctx.lineTo(4, 4); ctx.moveTo(4, 20); ctx.lineTo(21, 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, 16); ctx.lineTo(11, 11); ctx.lineTo(14.5, 14); ctx.lineTo(20, 6); ctx.stroke();
      break;
    case 'users':
      ctx.beginPath(); ctx.arc(9, 8, 3.4, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, 20); ctx.bezierCurveTo(3, 15.5, 6, 13.5, 9, 13.5); ctx.bezierCurveTo(12, 13.5, 15, 15.5, 15, 20); ctx.stroke();
      ctx.beginPath(); ctx.arc(17, 9, 2.6, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(17.5, 13.6); ctx.bezierCurveTo(20, 14, 21, 16, 21, 19); ctx.stroke();
      break;
    case 'grid':
      ctx.beginPath(); ctx.rect(3.5, 3.5, 7, 7); ctx.rect(13.5, 3.5, 7, 7); ctx.rect(3.5, 13.5, 7, 7); ctx.rect(13.5, 13.5, 7, 7); ctx.stroke();
      break;
    case 'list':
      ctx.beginPath(); ctx.moveTo(8, 6); ctx.lineTo(21, 6); ctx.moveTo(8, 12); ctx.lineTo(21, 12); ctx.moveTo(8, 18); ctx.lineTo(21, 18); ctx.stroke();
      ctx.beginPath(); ctx.arc(4, 6, 1.2, 0, 7); ctx.arc(4, 12, 1.2, 0, 7); ctx.arc(4, 18, 1.2, 0, 7); ctx.fill();
      break;
    case 'tag':
      ctx.beginPath(); ctx.moveTo(3, 12); ctx.lineTo(12, 3); ctx.lineTo(21, 3); ctx.lineTo(21, 12); ctx.lineTo(12, 21); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(16.5, 7.5, 1.4, 0, 7); ctx.fill();
      break;
    case 'wallet':
      ctx.beginPath(); ctx.moveTo(3, 7); ctx.lineTo(3, 19); ctx.lineTo(21, 19); ctx.lineTo(21, 7); ctx.lineTo(6, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, 7); ctx.lineTo(5, 3.5); ctx.lineTo(17, 3.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(16.5, 13, 1.6, 0, 7); ctx.fill();
      break;
    case 'globe':
      ctx.beginPath(); ctx.arc(12, 12, 9, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, 12); ctx.lineTo(21, 12); ctx.moveTo(12, 3); ctx.bezierCurveTo(16, 7, 16, 17, 12, 21); ctx.moveTo(12, 3); ctx.bezierCurveTo(8, 7, 8, 17, 12, 21); ctx.stroke();
      break;
    case 'phone':
      ctx.beginPath(); ctx.rect(6.5, 2.5, 11, 19); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, 5.5); ctx.lineTo(14, 5.5); ctx.stroke();
      break;
    case 'mail':
      ctx.beginPath(); ctx.rect(2.5, 5, 19, 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, 6); ctx.lineTo(12, 13); ctx.lineTo(21, 6); ctx.stroke();
      break;
    case 'chat':
      ctx.beginPath(); ctx.moveTo(3, 5); ctx.lineTo(21, 5); ctx.lineTo(21, 17); ctx.lineTo(12, 17); ctx.lineTo(7, 21); ctx.lineTo(7, 17); ctx.lineTo(3, 17); ctx.closePath(); ctx.stroke();
      break;
    case 'star':
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const a2 = a + Math.PI / 5;
        const r1 = 9, r2 = 3.9;
        if (i === 0) ctx.moveTo(12 + Math.cos(a) * r1, 12 + Math.sin(a) * r1);
        else ctx.lineTo(12 + Math.cos(a) * r1, 12 + Math.sin(a) * r1);
        ctx.lineTo(12 + Math.cos(a2) * r2, 12 + Math.sin(a2) * r2);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case 'play':
      ctx.beginPath(); ctx.moveTo(8, 5); ctx.lineTo(19, 12); ctx.lineTo(8, 19); ctx.closePath(); ctx.fill();
      break;
    case 'download':
      ctx.beginPath(); ctx.moveTo(12, 3); ctx.lineTo(12, 15); ctx.moveTo(6.5, 10); ctx.lineTo(12, 15.5); ctx.lineTo(17.5, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(4, 19.5); ctx.lineTo(20, 19.5); ctx.stroke();
      break;
    case 'upload':
      ctx.beginPath(); ctx.moveTo(12, 16); ctx.lineTo(12, 4); ctx.moveTo(6.5, 9); ctx.lineTo(12, 3.5); ctx.lineTo(17.5, 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(4, 19.5); ctx.lineTo(20, 19.5); ctx.stroke();
      break;
    case 'clock':
      ctx.beginPath(); ctx.arc(12, 12, 9, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, 7); ctx.lineTo(12, 12); ctx.lineTo(16, 14); ctx.stroke();
      break;
    case 'sparkle':
      ctx.beginPath();
      ctx.moveTo(12, 2.5); ctx.lineTo(14.2, 9.6); ctx.lineTo(21.5, 12); ctx.lineTo(14.2, 14.4);
      ctx.lineTo(12, 21.5); ctx.lineTo(9.8, 14.4); ctx.lineTo(2.5, 12); ctx.lineTo(9.8, 9.6); ctx.closePath();
      ctx.fill();
      break;
    case 'checkCircle':
      ctx.beginPath(); ctx.arc(12, 12, 9.3, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7.5, 12.4); ctx.lineTo(10.7, 15.6); ctx.lineTo(16.6, 8.6); ctx.stroke();
      break;
    case 'filter':
      ctx.beginPath(); ctx.moveTo(3, 5); ctx.lineTo(21, 5); ctx.lineTo(14, 13); ctx.lineTo(14, 20); ctx.lineTo(10, 18); ctx.lineTo(10, 13); ctx.closePath(); ctx.stroke();
      break;
    case 'bag':
      ctx.beginPath(); ctx.moveTo(4.5, 7.5); ctx.lineTo(19.5, 7.5); ctx.lineTo(20.5, 21); ctx.lineTo(3.5, 21); ctx.closePath();
      ctx.beginPath(); ctx.moveTo(8.5, 7.5); ctx.bezierCurveTo(8.5, 2.8, 15.5, 2.8, 15.5, 7.5); ctx.stroke();
      break;
    case 'pin':
      ctx.beginPath(); ctx.moveTo(12, 22); ctx.bezierCurveTo(12, 22, 19, 14.4, 19, 9.4); ctx.arc(12, 9.4, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(12, 9.4, 2.4, 0, 7); ctx.stroke();
      break;
    case 'qr':
      ctx.strokeRect(3.5, 3.5, 6, 6); ctx.strokeRect(14.5, 3.5, 6, 6); ctx.strokeRect(3.5, 14.5, 6, 6);
      ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(14, 17); ctx.lineTo(17, 17); ctx.lineTo(17, 20.5); ctx.lineTo(20.5, 20.5); ctx.moveTo(20.5, 14); ctx.lineTo(17, 14); ctx.lineTo(17, 16); ctx.stroke();
      break;
    default: break;
  }
  ctx.restore();
}

export function whatsappGlyph(ctx, x, y, size, color = '#FFFFFF') {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(12, 11.4, 7.7, Math.PI * 0.32, Math.PI * 2.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5.2, 17.6); ctx.lineTo(4, 21.5); ctx.lineTo(8.1, 20.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(9.2, 8.4);
  ctx.bezierCurveTo(8.4, 8.4, 8.2, 9.1, 8.2, 9.7);
  ctx.bezierCurveTo(8.2, 13.2, 11.6, 15.6, 14.2, 15.6);
  ctx.bezierCurveTo(15, 15.6, 15.7, 15.2, 15.7, 14.4);
  ctx.bezierCurveTo(15.7, 13.9, 15.2, 13.7, 14.7, 13.4);
  ctx.bezierCurveTo(14.2, 13.1, 13.9, 13.7, 13.6, 13.9);
  ctx.bezierCurveTo(13.3, 14.2, 13, 14.1, 12.6, 13.9);
  ctx.bezierCurveTo(11.3, 13.2, 10.6, 12.3, 10.2, 11.4);
  ctx.bezierCurveTo(10, 11, 10.3, 10.7, 10.5, 10.4);
  ctx.bezierCurveTo(10.7, 10.1, 10.7, 9.8, 10.5, 9.4);
  ctx.bezierCurveTo(10.3, 9, 10, 8.4, 9.2, 8.4);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ components */
export function brandMark(ctx, x, y, size = 56, { withWordmark = false, color = C.white } = {}) {
  ctx.save();
  const r = size * 0.28;
  const g = lin(ctx, x, y, x + size, y + size, [[0, C.blue], [0.6, '#5B8CFF'], [1, C.cyan]]);
  shadow(ctx, 'rgba(45,120,255,0.55)', 26, 8);
  fillRR(ctx, x, y, size, size, r, g);
  noShadow(ctx);
  // pixel / code glyph
  ctx.save();
  ctx.translate(x + size * 0.5, y + size * 0.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = size * 0.075;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.3;
  ctx.beginPath();
  ctx.moveTo(-s * 0.15, -s); ctx.lineTo(-s * 1.05, 0); ctx.lineTo(-s * 0.15, s);
  ctx.moveTo(s * 0.15, -s); ctx.lineTo(s * 1.05, 0); ctx.lineTo(s * 0.15, s);
  ctx.stroke();
  ctx.restore();
  if (withWordmark) {
    text(ctx, 'CODEPIXEL', x + size + 18, y + size * 0.52, { size: size * 0.5, weight: 800, color, letterSpacing: 3 });
    text(ctx, 'WEB', x + size + 18, y + size * 0.52 + size * 0.42, { size: size * 0.3, weight: 600, color: C.cyan, letterSpacing: 6.5 });
  }
  ctx.restore();
}

export function chip(ctx, label, x, y, { color = C.cyan, bg = null, size = 24, px = 22, h = 46, weight = 600, border = true, align = 'left' } = {}) {
  ctx.save();
  ctx.font = fontStr(size, weight, label);
  const w = ctx.measureText(label).width + px * 2;
  const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  fillRR(ctx, bx, y, w, h, h / 2, bg || alpha(color, 0.12));
  if (border) strokeRR(ctx, bx, y, w, h, h / 2, alpha(color, 0.34), 1.4);
  text(ctx, label, bx + w / 2, y + h / 2 + size * 0.36, { size, weight, color, align: 'center' });
  ctx.restore();
  return w;
}

export function btn(ctx, label, x, y, w, h, { bg = C.white, color = '#0A0F1C', size = 30, weight = 700, radius = 999, iconName = null } = {}) {
  fillRR(ctx, x, y, w, h, radius, bg);
  let cx = x + w / 2;
  if (iconName) {
    ctx.save();
    ctx.font = fontStr(size, weight, label);
    const tw = ctx.measureText(label).width;
    const total = tw + size * 0.75 + 14;
    cx = x + (w - total) / 2;
    icon(ctx, iconName, cx, y + h / 2 - size * 0.5, size, color, size * 0.08);
    text(ctx, label, cx + size * 0.75 + 14, y + h / 2 + size * 0.35, { size, weight, color });
    ctx.restore();
  } else {
    text(ctx, label, cx, y + h / 2 + size * 0.35, { size, weight, color, align: 'center', maxWidth: w - 40 });
  }
}

/** Clip to a rounded rect and draw translated content. */
export function withClip(ctx, x, y, w, h, r, draw) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.translate(x, y);
  draw(ctx, w, h);
  ctx.restore();
}

/* device frames ---------------------------------------------------------- */
export function browserFrame(ctx, x, y, w, h, draw, { radius = 26, chrome = '#151C2E', accent = true, url = 'codepixelweb.vercel.app' } = {}) {
  ctx.save();
  shadow(ctx, 'rgba(0,0,0,0.6)', 70, 30);
  fillRR(ctx, x, y, w, h, radius, chrome);
  noShadow(ctx);
  strokeRR(ctx, x, y, w, h, radius, 'rgba(140,175,255,0.22)', 1.6);
  const bar = Math.max(34, h * 0.055);
  // traffic lights
  const cy = y + bar / 2;
  ['#FF6B6B', '#FFC466', '#35D3A0'].forEach((c, i) => circle(ctx, x + 26 + i * 22, cy, 5.5, accent ? c : alpha(c, 0.35)));
  // url pill
  const upad = 96;
  const uw = Math.min(w - upad * 2, w * 0.5);
  fillRR(ctx, x + (w - uw) / 2, y + bar * 0.24, uw, bar * 0.52, 8, 'rgba(255,255,255,0.08)');
  text(ctx, url, x + w / 2, y + bar * 0.52 + Math.min(9, bar * 0.16), { size: Math.max(11, bar * 0.24), weight: 500, color: 'rgba(226,236,255,0.72)', align: 'center' });
  // screen
  ctx.save();
  rr(ctx, x, y + bar, w, h - bar, 0);
  ctx.clip();
  ctx.translate(x, y + bar);
  draw(w, h - bar);
  ctx.restore();
  ctx.restore();
}

export function phoneFrame(ctx, x, y, w, h, draw, { radius = 54, bezel = 12, screenBg = '#FFFFFF', dark = true } = {}) {
  ctx.save();
  shadow(ctx, 'rgba(0,0,0,0.65)', 80, 34);
  fillRR(ctx, x, y, w, h, radius, dark ? '#0D1220' : '#E9EDF5');
  noShadow(ctx);
  strokeRR(ctx, x, y, w, h, radius, 'rgba(160,190,255,0.35)', 2);
  // side buttons
  fillRR(ctx, x - 3, y + h * 0.18, 3, h * 0.06, 2, 'rgba(180,200,235,0.4)');
  fillRR(ctx, x - 3, y + h * 0.26, 3, h * 0.09, 2, 'rgba(180,200,235,0.4)');
  const sx = x + bezel, sy = y + bezel, sw = w - bezel * 2, sh = h - bezel * 2;
  ctx.save();
  rr(ctx, sx, sy, sw, sh, radius - bezel);
  ctx.clip();
  ctx.fillStyle = screenBg;
  ctx.fillRect(sx, sy, sw, sh);
  ctx.translate(sx, sy);
  draw(sw, sh);
  // home indicator + notch
  ctx.restore();
  const notchW = sw * 0.3;
  fillRR(ctx, x + w / 2 - notchW / 2, y + bezel + 2, notchW, Math.max(14, h * 0.022), 999, '#0A0E18');
  fillRR(ctx, x + w / 2 - 60, y + h - bezel - 14, 120, 5, 3, 'rgba(255,255,255,0.28)');
  ctx.restore();
}

/* product illustration --------------------------------------------------- */
/** Stylised premium watch drawn as a product render. */
export function drawWatch(ctx, cx, cy, r, { face = '#F3EEE6', bezel = '#C9A46A', strap = '#1D2230', hands = '#22262E', accent = '#C9A46A', angle = 0 } = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  // strap
  const sw = r * 0.52;
  const sg = lin(ctx, -r, 0, r, 0, [[0, mix(strap, '#000000', 0.35)], [0.5, strap], [1, mix(strap, '#000000', 0.35)]]);
  fillRR(ctx, -sw / 2, -r * 2.5, sw, r * 4.3, r * 0.16, sg);
  for (const dy of [-r * 2.2, -r * 1.6, -r * 1.0, r * 1.0, r * 1.6, r * 2.2]) {
    fillRR(ctx, -sw / 2 + 3, dy, sw - 6, r * 0.1, 3, 'rgba(255,255,255,0.06)');
  }
  // case
  shadow(ctx, 'rgba(0,0,0,0.45)', r * 0.5, r * 0.16);
  circle(ctx, 0, 0, r, bezel);
  noShadow(ctx);
  const casing = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  casing.addColorStop(0, mix(bezel, '#FFFFFF', 0.55));
  casing.addColorStop(0.55, bezel);
  casing.addColorStop(1, mix(bezel, '#000000', 0.35));
  ctx.fillStyle = casing;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.97, 0, 7); ctx.fill();
  // crystal
  circle(ctx, 0, 0, r * 0.8, face);
  const gl = ctx.createLinearGradient(-r, -r, r, r);
  gl.addColorStop(0, 'rgba(255,255,255,0.5)');
  gl.addColorStop(0.45, 'rgba(255,255,255,0.02)');
  gl.addColorStop(1, 'rgba(255,255,255,0.22)');
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 7); ctx.fill();
  // indices
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const long = i % 3 === 0;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = hands;
    ctx.globalAlpha = long ? 0.95 : 0.55;
    fillRR(ctx, -2, -r * 0.7, 4, long ? r * 0.16 : r * 0.09, 2, hands);
    ctx.restore();
  }
  ctx.restore();
  // subdial
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = Math.max(1, r * 0.012);
  ctx.beginPath(); ctx.arc(0, r * 0.26, r * 0.26, 0, 7); ctx.stroke();
  // hands
  ctx.save();
  ctx.rotate(-Math.PI / 3.2);
  fillRR(ctx, -r * 0.028, -r * 0.62, r * 0.056, r * 0.68, r * 0.03, hands);
  ctx.restore();
  ctx.save();
  ctx.rotate(Math.PI / 1.55);
  fillRR(ctx, -r * 0.02, -r * 0.46, r * 0.04, r * 0.5, r * 0.02, hands);
  ctx.restore();
  ctx.save();
  ctx.rotate(Math.PI * 0.83);
  fillRR(ctx, -r * 0.012, -r * 0.5, r * 0.024, r * 0.52, r * 0.012, accent);
  ctx.restore();
  circle(ctx, 0, 0, r * 0.045, accent);
  circle(ctx, 0, 0, r * 0.02, '#FFFFFF');
  // crown
  fillRR(ctx, r * 0.94, -r * 0.1, r * 0.12, r * 0.2, r * 0.03, mix(bezel, '#000000', 0.2));
  // specular highlight
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const spec = ctx.createLinearGradient(-r, -r, r * 0.4, r * 0.4);
  spec.addColorStop(0, 'rgba(255,255,255,0.34)');
  spec.addColorStop(0.35, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.96, 0, 7); ctx.fill();
  ctx.restore();
  ctx.restore();
}

export function drawShoe(ctx, cx, cy, s, tint = '#E9E1D4', accent = '#C9A46A') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.moveTo(-s, s * 0.1);
  ctx.bezierCurveTo(-s, -s * 0.35, -s * 0.45, -s * 0.4, -s * 0.1, -s * 0.2);
  ctx.bezierCurveTo(s * 0.2, -s * 0.05, s * 0.5, -s * 0.12, s * 0.78, s * 0.05);
  ctx.bezierCurveTo(s * 0.98, s * 0.18, s * 0.9, s * 0.42, s * 0.62, s * 0.44);
  ctx.lineTo(-s * 0.6, s * 0.44);
  ctx.bezierCurveTo(-s * 0.86, s * 0.42, -s, s * 0.3, -s, s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = accent;
  fillRR(ctx, -s * 0.86, s * 0.42, s * 1.62, s * 0.12, 4, accent);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = s * 0.02;
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, -s * 0.16); ctx.lineTo(s * 0.2, s * 0.1);
  ctx.moveTo(-s * 0.02, -s * 0.24); ctx.lineTo(s * 0.38, s * 0.02);
  ctx.stroke();
  ctx.restore();
}

export function drawBottle(ctx, cx, cy, s, hue = '#E7C8D2', cap = '#C9A46A') {
  ctx.save();
  ctx.translate(cx, cy);
  shadow(ctx, 'rgba(0,0,0,0.3)', s * 0.5, s * 0.15);
  fillRR(ctx, -s * 0.42, -s * 0.5, s * 0.84, s * 1.3, s * 0.22, hue);
  noShadow(ctx);
  fillRR(ctx, -s * 0.22, -s * 0.74, s * 0.44, s * 0.3, s * 0.08, mix(hue, '#000000', 0.15));
  fillRR(ctx, -s * 0.24, -s * 0.88, s * 0.48, s * 0.18, s * 0.06, cap);
  fillRR(ctx, -s * 0.28, -s * 0.08, s * 0.56, s * 0.36, s * 0.06, 'rgba(255,255,255,0.5)');
  text(ctx, 'AURUM', 0, s * 0.04, { size: s * 0.12, weight: 700, color: 'rgba(40,30,30,0.75)', align: 'center', letterSpacing: 1.5 });
  ctx.restore();
}

export function drawHeadphone(ctx, cx, cy, s, tint = '#2A3346', accent = '#36D7FF') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = tint;
  ctx.lineWidth = s * 0.16;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.62, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  fillRR(ctx, -s * 0.86, -s * 0.06, s * 0.3, s * 0.62, s * 0.14, tint);
  fillRR(ctx, s * 0.56, -s * 0.06, s * 0.3, s * 0.62, s * 0.14, tint);
  fillRR(ctx, -s * 0.82, 0, s * 0.22, s * 0.5, s * 0.1, accent);
  fillRR(ctx, s * 0.6, 0, s * 0.22, s * 0.5, s * 0.1, accent);
  ctx.restore();
}

export function drawBag(ctx, cx, cy, s, tint = '#E4D9C2', accent = '#8A6A3D') {
  ctx.save();
  ctx.translate(cx, cy);
  shadow(ctx, 'rgba(0,0,0,0.25)', s * 0.4, s * 0.12);
  fillRR(ctx, -s * 0.55, -s * 0.35, s * 1.1, s * 1.05, s * 0.1, tint);
  noShadow(ctx);
  ctx.strokeStyle = accent;
  ctx.lineWidth = s * 0.055;
  ctx.beginPath();
  ctx.arc(0, -s * 0.35, s * 0.3, Math.PI, Math.PI * 2);
  ctx.stroke();
  fillRR(ctx, -s * 0.17, -s * 0.1, s * 0.34, s * 0.34, s * 0.04, 'rgba(255,255,255,0.45)');
  ctx.restore();
}

export function drawPlate(ctx, cx, cy, s, accent = '#D3A15E') {
  ctx.save();
  ctx.translate(cx, cy);
  circle(ctx, 0, 0, s * 0.8, '#F7F3EA');
  circle(ctx, 0, 0, s * 0.62, '#FFFFFF');
  circle(ctx, -s * 0.1, -s * 0.02, s * 0.26, accent);
  circle(ctx, s * 0.16, s * 0.14, s * 0.18, '#7FAE6B');
  circle(ctx, s * 0.02, -s * 0.3, s * 0.12, '#E0785E');
  ctx.restore();
}

export function avatar(ctx, x, y, r, label = 'র', { bg = C.blue, color = '#fff' } = {}) {
  const g = lin(ctx, x - r, y - r, x + r, y + r, [[0, bg], [1, mix(bg, '#000000', 0.3)]]);
  circle(ctx, x, y, r, g);
  text(ctx, label, x, y + r * 0.36, { size: r * 0.95, weight: 700, color, align: 'center' });
}

export function statusChip(ctx, label, x, y, tone = 'green', { size = 22, h = 38 } = {}) {
  const map = {
    green: { c: '#18B887', bg: 'rgba(24,184,135,0.14)' },
    amber: { c: '#D9902E', bg: 'rgba(217,144,46,0.16)' },
    blue: { c: '#2F7BE0', bg: 'rgba(47,123,224,0.14)' },
    red: { c: '#E15A6B', bg: 'rgba(225,90,107,0.14)' },
    violet: { c: '#7357D6', bg: 'rgba(115,87,214,0.14)' },
    grey: { c: '#6B7A93', bg: 'rgba(107,122,147,0.13)' },
  };
  const t = map[tone] || map.green;
  ctx.save();
  ctx.font = fontStr(size, 600, label);
  const w = ctx.measureText(label).width + 30;
  fillRR(ctx, x, y, w, h, h / 2, t.bg);
  circle(ctx, x + 16, y + h / 2, 4, t.c);
  text(ctx, label, x + 26, y + h / 2 + size * 0.35, { size, weight: 600, color: t.c });
  ctx.restore();
  return w;
}

export function progressBar(ctx, x, y, w, h, p, { track = 'rgba(255,255,255,0.12)', fill = C.cyan, radius = 999 } = {}) {
  fillRR(ctx, x, y, w, h, radius, track);
  if (p > 0) fillRR(ctx, x, y, Math.max(h, w * clamp(p)), h, radius, fill);
}
