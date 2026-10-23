// Graphics, Typography, Device Mockups & 3D Perspective Projection Engine
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import path from 'node:path';

let fontsRegistered = false;
export function registerProductionFonts(rootDir = process.cwd()) {
  if (fontsRegistered) return;
  const fontDir = path.join(rootDir, 'assets/fonts');
  GlobalFonts.registerFromPath(path.join(fontDir, 'NotoSansBengali-Regular.ttf'), 'NotoBn');
  GlobalFonts.registerFromPath(path.join(fontDir, 'NotoSansBengali-SemiBold.ttf'), 'NotoBn');
  GlobalFonts.registerFromPath(path.join(fontDir, 'NotoSansBengali-Bold.ttf'), 'NotoBn');
  GlobalFonts.registerFromPath(path.join(fontDir, 'NotoSansBengali-ExtraBold.ttf'), 'NotoBn');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-Regular.ttf'), 'InterUI');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-SemiBold.ttf'), 'InterUI');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-Bold.ttf'), 'InterUI');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-ExtraBold.ttf'), 'InterUI');
  fontsRegistered = true;
}

export function fontSpec(weight = 700, size = 36) {
  return `${weight} ${Math.round(size)}px "InterUI", "NotoBn", sans-serif`;
}

// Math & Easing Helpers
export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, t0, dur) => clamp01((t - t0) / dur);

export const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeOutQuart = (x) => 1 - Math.pow(1 - clamp01(x), 4);
export const easeOutExpo = (x) => {
  const t = clamp01(x);
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};
export const easeInOutCubic = (x) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeInOutQuart = (x) => {
  const t = clamp01(x);
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
};
export const easeOutBack = (x) => {
  const t = clamp01(x);
  const c1 = 1.45;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Rounded rectangle path helper
export function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

export function fillRoundRect(ctx, x, y, w, h, r, fillStyle) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export function strokeRoundRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1.5) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// Center-cropped aspect-fill photo drawing inside rounded rect
export function drawCoverImage(ctx, img, x, y, w, h, radius = 0, zoom = 1.0, panX = 0.5, panY = 0.5) {
  if (!img) {
    fillRoundRect(ctx, x, y, w, h, radius, '#1E293B');
    return;
  }
  ctx.save();
  if (radius > 0) {
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x - (dw - w) * panX;
  const dy = y - (dh - h) * panY;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// Guaranteed non-overflowing Bengali + English word wrapper
export function wrapTextLines(ctx, text, maxWidth) {
  const paragraphs = String(text).split('\n');
  const lines = [];
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = current + ' ' + words[i];
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }
  return lines;
}

export function drawTextBlock(ctx, text, x, y, maxWidth, {
  size = 42,
  weight = 700,
  color = '#FFFFFF',
  lineHeight = 1.42,
  align = 'left',
  maxLines = 6,
  reveal = 1.0,
} = {}) {
  ctx.save();
  ctx.font = fontSpec(weight, size);
  ctx.textBaseline = 'top';
  ctx.textAlign = align;
  const lines = wrapTextLines(ctx, text, maxWidth).slice(0, maxLines);
  const stepY = size * lineHeight;

  for (let i = 0; i < lines.length; i++) {
    const lineProg = clamp01(reveal * lines.length - i * 0.55);
    const ease = easeOutCubic(lineProg);
    if (ease <= 0.01) continue;
    const ly = y + i * stepY;

    // Clean mask reveal from bottom of line box
    ctx.save();
    ctx.beginPath();
    const clipX = align === 'center' ? x - maxWidth / 2 - 20 : align === 'right' ? x - maxWidth - 20 : x - 20;
    ctx.rect(clipX, ly - size * 0.22, maxWidth + 40, stepY * 1.18);
    ctx.clip();
    ctx.globalAlpha *= ease;
    ctx.fillStyle = color;
    ctx.fillText(lines[i], x, ly + (1 - ease) * (stepY * 0.72));
    ctx.restore();
  }
  ctx.restore();
  return lines.length * stepY;
}

// Clean typographic brand wordmark (per mandatory rule: clean text-based brand treatment, no fabricated icon)
export function drawBrandWordmark(ctx, cx, cy, scale = 1.0, align = 'center', darkText = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const part1 = 'CodePixel';
  const part2 = ' Web';
  ctx.font = fontSpec(800, 44);
  const w1 = ctx.measureText(part1).width;
  ctx.font = fontSpec(700, 44);
  const w2 = ctx.measureText(part2).width;
  const totalW = w1 + w2;
  const startX = align === 'center' ? -totalW / 2 : align === 'right' ? -totalW : 0;

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = fontSpec(800, 44);
  ctx.fillStyle = darkText ? '#081426' : '#FFFFFF';
  ctx.fillText(part1, startX, 0);

  ctx.font = fontSpec(700, 44);
  ctx.fillStyle = darkText ? '#397BFF' : '#8DEBFF';
  ctx.fillText(part2, startX + w1, 0);

  // Subtle architectural underline accent
  fillRoundRect(ctx, startX, 27, 56, 3.5, 2, '#397BFF');
  ctx.restore();
}

// Premium Brand Ambient Stage Background (#081426, #102544, #397BFF, #8DEBFF)
export function createPrebakedStage(width, height, variant = 'navy') {
  const c = createCanvas(width, height);
  const ctx = c.getContext('2d');

  if (variant === 'light') {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#F4F6FA');
    g.addColorStop(0.55, '#EBF0F8');
    g.addColorStop(1, '#E2E9F5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const glowTop = ctx.createRadialGradient(width * 0.82, height * 0.14, 20, width * 0.82, height * 0.14, 620);
    glowTop.addColorStop(0, 'rgba(57, 123, 255, 0.13)');
    glowTop.addColorStop(1, 'rgba(57, 123, 255, 0)');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, width, height);
  } else {
    const g = ctx.createLinearGradient(0, 0, width * 0.35, height);
    g.addColorStop(0, '#081426');
    g.addColorStop(0.48, '#0D1E38');
    g.addColorStop(1, '#071120');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Controlled architectural radial glows (#102544 / #397BFF / #8DEBFF — never neon!)
    const g1 = ctx.createRadialGradient(width * 0.5, height * 0.24, 10, width * 0.5, height * 0.24, 680);
    g1.addColorStop(0, 'rgba(57, 123, 255, 0.20)');
    g1.addColorStop(0.55, 'rgba(16, 37, 68, 0.28)');
    g1.addColorStop(1, 'rgba(8, 20, 38, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.85, height * 0.78, 10, width * 0.85, height * 0.78, 520);
    g2.addColorStop(0, 'rgba(141, 235, 255, 0.11)');
    g2.addColorStop(1, 'rgba(8, 20, 38, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    // Subtle precision architectural grid lines
    ctx.strokeStyle = 'rgba(141, 235, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 90; x < width; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 160; y < height; y += 180) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  return c;
}

let cachedShadowCanvas = null;
function getSoftShadowStamp() {
  if (cachedShadowCanvas) return cachedShadowCanvas;
  const sc = createCanvas(256, 64);
  const sctx = sc.getContext('2d');
  const g = sctx.createRadialGradient(128, 32, 6, 128, 32, 124);
  g.addColorStop(0, 'rgba(2, 8, 20, 1)');
  g.addColorStop(0.55, 'rgba(2, 8, 20, 0.42)');
  g.addColorStop(1, 'rgba(2, 8, 20, 0)');
  sctx.save();
  sctx.translate(128, 32);
  sctx.scale(1, 0.25);
  sctx.beginPath();
  sctx.arc(0, 0, 124, 0, Math.PI * 2);
  sctx.fillStyle = g;
  sctx.fill();
  sctx.restore();
  cachedShadowCanvas = sc;
  return sc;
}

// True 3D Y-Axis Perspective Surface Renderer (fast vertical-strip projective mapping)
export function drawPerspectiveSurface(ctx, surfaceCanvas, cx, cy, targetW, targetH, {
  rotY = 0, // radians, e.g. -0.28 to +0.28
  shadowAlpha = 0.42,
  sheenPos = -1, // 0..1 specular light sweep across glass
  alpha = 1.0,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;

  const focal = 1550;
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const halfW = targetW / 2;
  const halfH = targetH / 2;

  // Pre-baked ambient drop shadow on stage beneath the 3D card/device
  if (shadowAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha *= shadowAlpha;
    const sw = targetW * 1.12;
    const sh = targetW * 0.26;
    ctx.drawImage(getSoftShadowStamp(), cx + sinY * 24 - sw / 2, cy + halfH * 0.90 - sh / 2, sw, sh);
    ctx.restore();
  }

  if (Math.abs(rotY) < 0.004) {
    ctx.drawImage(surfaceCanvas, cx - halfW, cy - halfH, targetW, targetH);
  } else {
    const STRIPS = 18;
    const srcW = surfaceCanvas.width;
    const srcH = surfaceCanvas.height;
    for (let i = 0; i < STRIPS; i++) {
      const u0 = i / STRIPS;
      const u1 = (i + 1) / STRIPS;
      const xLocal0 = -halfW + u0 * targetW;
      const xLocal1 = -halfW + u1 * targetW;

      const z0 = xLocal0 * sinY;
      const z1 = xLocal1 * sinY;
      const p0 = focal / (focal + z0);
      const p1 = focal / (focal + z1);

      const sx0 = cx + xLocal0 * cosY * p0;
      const sx1 = cx + xLocal1 * cosY * p1;
      const pm = 0.5 * (p0 + p1);
      const hProj = targetH * pm;

      const left = Math.min(sx0, sx1);
      const width = Math.abs(sx1 - sx0) + 1.25; // +1.25px overlap prevents subpixel seams
      ctx.drawImage(
        surfaceCanvas,
        u0 * srcW,
        0,
        (u1 - u0) * srcW,
        srcH,
        left,
        cy - hProj / 2,
        width,
        hProj
      );
    }
  }

  // Optional subtle diagonal specular sheen
  if (sheenPos >= 0 && sheenPos <= 1) {
    const lx = cx - halfW + sheenPos * targetW;
    const sheen = ctx.createLinearGradient(lx - 90, cy - halfH, lx + 90, cy + halfH * 0.4);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    roundRectPath(ctx, cx - halfW * Math.abs(cosY), cy - halfH, targetW * Math.abs(cosY), targetH, 22);
    ctx.clip();
    ctx.fillStyle = sheen;
    ctx.fillRect(cx - halfW, cy - halfH, targetW, targetH);
    ctx.restore();
  }

  ctx.restore();
}

// Wrap a scrollable website surface inside a realistic Desktop Browser/Laptop Mockup Canvas
export function renderDeviceFrameToCanvas(targetCanvas, pageSurface, scrollY = 0, {
  device = 'desktop', // 'desktop' | 'tablet' | 'mobile'
  url = 'https://codepixelweb.vercel.app',
} = {}) {
  const ctx = targetCanvas.getContext('2d');
  const W = targetCanvas.width;
  const H = targetCanvas.height;
  ctx.clearRect(0, 0, W, H);

  if (device === 'desktop') {
    // Sleek dark-space-aluminum MacBook display bezel + clean browser bar
    const pad = 16;
    const baseH = 26;
    const screenH = H - baseH;
    fillRoundRect(ctx, 18, 0, W - 36, screenH, 26, '#141B29');
    strokeRoundRect(ctx, 19, 1, W - 38, screenH - 2, 25, 'rgba(141,235,255,0.24)', 2);

    const vx = 18 + pad;
    const vy = pad;
    const vw = W - 36 - pad * 2;
    const chromeH = 44;
    const vh = screenH - pad * 2 - chromeH;

    // Browser top bar
    ctx.save();
    roundRectPath(ctx, vx, vy, vw, chromeH + vh, 14);
    ctx.clip();

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(vx, vy, vw, chromeH);
    // Traffic lights
    const dots = ['#EF4444', '#F59E0B', '#10B981'];
    dots.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(vx + 22 + i * 18, vy + chromeH / 2, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });
    // URL pill
    fillRoundRect(ctx, vx + vw * 0.24, vy + 8, vw * 0.52, chromeH - 16, 8, '#FFFFFF');
    ctx.font = fontSpec(600, 15);
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(url, vx + vw * 0.5, vy + chromeH / 2 + 0.5);

    // Draw scrolled website viewport
    const scale = vw / pageSurface.width;
    const srcVh = vh / scale;
    const maxScroll = Math.max(0, pageSurface.height - srcVh);
    const sy = clamp(scrollY, 0, maxScroll);
    ctx.drawImage(pageSurface, 0, sy, pageSurface.width, Math.min(srcVh, pageSurface.height - sy), vx, vy + chromeH, vw, vh);
    ctx.restore();

    // Aluminum laptop base lip
    const baseGrad = ctx.createLinearGradient(0, screenH - 2, W, screenH + baseH);
    baseGrad.addColorStop(0, '#334155');
    baseGrad.addColorStop(0.5, '#64748B');
    baseGrad.addColorStop(1, '#1E293B');
    fillRoundRect(ctx, 0, screenH - 4, W, baseH, 11, baseGrad);
    fillRoundRect(ctx, W / 2 - 58, screenH - 4, 116, 7, 3.5, '#94A3B8');
  } else if (device === 'tablet') {
    const pad = 20;
    fillRoundRect(ctx, 0, 0, W, H, 38, '#121A28');
    strokeRoundRect(ctx, 1.5, 1.5, W - 3, H - 3, 37, 'rgba(141,235,255,0.28)', 2.5);
    const vx = pad;
    const vy = pad;
    const vw = W - pad * 2;
    const vh = H - pad * 2;

    ctx.save();
    roundRectPath(ctx, vx, vy, vw, vh, 22);
    ctx.clip();
    const scale = vw / pageSurface.width;
    const srcVh = vh / scale;
    const maxScroll = Math.max(0, pageSurface.height - srcVh);
    const sy = clamp(scrollY, 0, maxScroll);
    ctx.drawImage(pageSurface, 0, sy, pageSurface.width, Math.min(srcVh, pageSurface.height - sy), vx, vy, vw, vh);
    ctx.restore();
  } else {
    // Smartphone Titanium Bezel + Dynamic Island
    const pad = 13;
    fillRoundRect(ctx, 0, 0, W, H, 52, '#0F172A');
    strokeRoundRect(ctx, 2, 2, W - 4, H - 4, 50, 'rgba(141,235,255,0.34)', 3);

    const vx = pad;
    const vy = pad;
    const vw = W - pad * 2;
    const vh = H - pad * 2;

    ctx.save();
    roundRectPath(ctx, vx, vy, vw, vh, 40);
    ctx.clip();
    const scale = vw / pageSurface.width;
    const srcVh = vh / scale;
    const maxScroll = Math.max(0, pageSurface.height - srcVh);
    const sy = clamp(scrollY, 0, maxScroll);
    ctx.drawImage(pageSurface, 0, sy, pageSurface.width, Math.min(srcVh, pageSurface.height - sy), vx, vy, vw, vh);

    // Dynamic Island pill
    fillRoundRect(ctx, W / 2 - 44, vy + 10, 88, 22, 11, '#090D16');
    // Home indicator bar
    fillRoundRect(ctx, W / 2 - 52, vy + vh - 12, 104, 5, 2.5, 'rgba(15,23,42,0.45)');
    ctx.restore();
  }
}

// Interactive Cursor + Touch Ripple
export function drawCursorAndRipple(ctx, x, y, clickProg = 0, scale = 1.0) {
  ctx.save();
  if (clickProg > 0 && clickProg < 1) {
    const r = 12 + easeOutQuart(clickProg) * 52;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(57, 123, 255, ${(1 - clickProg) * 0.85})`;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(141, 235, 255, ${(1 - clickProg) * 0.32})`;
    ctx.fill();
  }

  ctx.translate(x, y);
  const pressScale = clickProg > 0 && clickProg < 0.35 ? 0.88 : 1.0;
  ctx.scale(scale * pressScale, scale * pressScale);

  // Clean vector pointer with soft shadow
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 34);
  ctx.lineTo(9.5, 26);
  ctx.lineTo(16, 40);
  ctx.lineTo(22, 37);
  ctx.lineTo(15.5, 23);
  ctx.lineTo(27, 23);
  ctx.closePath();

  ctx.fillStyle = 'rgba(8, 20, 38, 0.38)';
  ctx.save();
  ctx.translate(3, 5);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#081426';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

// Top subtle scene indicator pill (safe zone y = 84..128)
export function drawTopSceneHeader(ctx, sceneNum, bnTitle, progress01, lightBg = false) {
  ctx.save();
  // Thin progress bar across very top inside safe margin
  fillRoundRect(ctx, 64, 62, 952, 4, 2, lightBg ? 'rgba(8,20,38,0.10)' : 'rgba(255,255,255,0.12)');
  fillRoundRect(ctx, 64, 62, Math.max(8, 952 * progress01), 4, 2, '#397BFF');

  // Brand mini-pill left + Scene pill right
  const pillBg = lightBg ? 'rgba(255,255,255,0.88)' : 'rgba(16, 37, 68, 0.78)';
  const borderCol = lightBg ? 'rgba(8,20,38,0.10)' : 'rgba(141, 235, 255, 0.22)';

  fillRoundRect(ctx, 64, 82, 232, 44, 22, pillBg);
  strokeRoundRect(ctx, 64, 82, 232, 44, 22, borderCol, 1.2);
  ctx.font = fontSpec(800, 19);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = lightBg ? '#081426' : '#FFFFFF';
  ctx.fillText('CodePixel', 86, 104);
  const wCp = ctx.measureText('CodePixel').width;
  ctx.fillStyle = lightBg ? '#397BFF' : '#8DEBFF';
  ctx.fillText(' Web', 86 + wCp, 104);

  // Right category/scene pill
  ctx.font = fontSpec(600, 18);
  const label = `${sceneNum} · ${bnTitle}`;
  const lw = ctx.measureText(label).width + 40;
  fillRoundRect(ctx, 1016 - lw, 82, lw, 44, 22, pillBg);
  strokeRoundRect(ctx, 1016 - lw, 82, lw, 44, 22, borderCol, 1.2);
  ctx.fillStyle = lightBg ? '#102544' : '#E2E8F0';
  ctx.textAlign = 'center';
  ctx.fillText(label, 1016 - lw / 2, 104);
  ctx.restore();
}

// Synchronized mobile-readable caption bar inside lower safe zone (y = 1665..1790)
export function drawCaptionBar(ctx, captionText, fadeAlpha = 1.0) {
  if (!captionText || fadeAlpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha *= fadeAlpha;
  ctx.font = fontSpec(600, 27);
  const lines = wrapTextLines(ctx, captionText, 868).slice(0, 2);
  const padY = 18;
  const lineH = 38;
  const boxH = lines.length * lineH + padY * 2;
  const boxY = 1792 - boxH;

  fillRoundRect(ctx, 68, boxY, 944, boxH, 22, 'rgba(8, 20, 38, 0.88)');
  strokeRoundRect(ctx, 68, boxY, 944, boxH, 22, 'rgba(141, 235, 255, 0.28)', 1.5);

  // Left electric blue accent bar
  fillRoundRect(ctx, 84, boxY + 14, 5, boxH - 28, 2.5, '#8DEBFF');

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  lines.forEach((line, idx) => {
    ctx.fillText(line, 540, boxY + padY + idx * lineH);
  });
  ctx.restore();
}

export async function loadAllProductionImages(rootDir = process.cwd()) {
  const dir = path.join(rootDir, 'film-production/assets/images');
  const fs = await import('node:fs');
  const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
  const map = new Map();
  for (const f of files) {
    const img = await loadImage(path.join(dir, f));
    map.set(f, img);
  }
  return map;
}
