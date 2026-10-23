import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { FILM, PALETTE, BRAND_FACTS } from '../timeline/cues.mjs';

let fontsRegistered = false;

export function ensureFonts(rootDir = process.cwd()) {
  if (fontsRegistered) return;
  const fontDir = path.join(rootDir, 'assets/fonts');
  const pairs = [
    ['NotoSansBengali-Regular.ttf', 'NotoSansBengali'],
    ['NotoSansBengali-SemiBold.ttf', 'NotoSansBengali'],
    ['NotoSansBengali-Bold.ttf', 'NotoSansBengali'],
    ['NotoSansBengali-ExtraBold.ttf', 'NotoSansBengali'],
    ['Inter-Regular.ttf', 'Inter'],
    ['Inter-SemiBold.ttf', 'Inter'],
    ['Inter-Bold.ttf', 'Inter'],
    ['Inter-ExtraBold.ttf', 'Inter'],
  ];
  for (const [file, family] of pairs) {
    const p = path.join(fontDir, file);
    if (fs.existsSync(p)) {
      GlobalFonts.registerFromPath(p, family);
    }
  }
  fontsRegistered = true;
}

export function fontSpec(weight = 600, sizePx = 36) {
  return `${weight} ${Math.round(sizePx)}px Inter, NotoSansBengali`;
}

// Math & Motion Curves
export const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (b === a ? 0 : clamp((v - a) / (b - a), 0, 1));
export const prog = (t, start, dur) => (dur <= 0 ? 1 : clamp((t - start) / dur, 0, 1));

export const easeOutCubic = (x) => {
  const u = clamp(x);
  return 1 - Math.pow(1 - u, 3);
};

export const easeOutQuart = (x) => {
  const u = clamp(x);
  return 1 - Math.pow(1 - u, 4);
};

export const easeOutQuint = (x) => {
  const u = clamp(x);
  return 1 - Math.pow(1 - u, 5);
};

export const easeInOutCubic = (x) => {
  const u = clamp(x);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
};

export const easeInOutQuart = (x) => {
  const u = clamp(x);
  return u < 0.5 ? 8 * u * u * u * u : 1 - Math.pow(-2 * u + 2, 4) / 2;
};

export const easeOutBackSoft = (x) => {
  const u = clamp(x);
  const c1 = 0.85;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};

// Load all 16 generated studio photos + pre-blurred atmospheric plates
export async function loadStudioAssets(rootDir = process.cwd()) {
  ensureFonts(rootDir);
  const photoDir = path.join(rootDir, 'brand_film/assets/photos');
  const keys = [
    's01_boutique_env',
    's01_hero_craft',
    's02_entrepreneur',
    's04_fashion_hero',
    's04_fashion_item2',
    's04_watch_hero',
    's04_watch_item2',
    's04_shoe_hero',
    's04_shoe_item2',
    's04_cosmetics_hero',
    's04_cosmetics_item2',
    's04_furniture_hero',
    's04_furniture_item2',
    's04_restaurant_hero',
    's04_restaurant_item2',
    's07_packaging_parcel',
  ];

  const photos = {};
  const blurred = {};

  for (const key of keys) {
    const p = path.join(photoDir, `${key}.jpg`);
    const img = await loadImage(p);
    photos[key] = img;

    // Pre-compute soft-focus atmospheric backdrop (downscale + multi-pass smooth)
    const bw = 270;
    const bh = 480;
    const bc = createCanvas(bw, bh);
    const bctx = bc.getContext('2d');
    bctx.filter = 'blur(14px)';
    drawImageCoverRaw(bctx, img, -24, -24, bw + 48, bh + 48);
    bctx.filter = 'none';
    blurred[key] = bc;
  }

  return { photos, blurred };
}

export function drawImageCoverRaw(ctx, img, x, y, w, h, zoom = 1.0, panX = 0, panY = 0) {
  if (!img) return;
  const iw = img.width;
  const ih = img.height;
  const baseScale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * baseScale;
  const dh = ih * baseScale;
  const dx = x + (w - dw) * 0.5 + panX * w;
  const dy = y + (h - dh) * 0.5 + panY * h;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function roundedRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function fillRoundRect(ctx, x, y, w, h, r, fillStyle) {
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export function strokeRoundRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1.5) {
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawCoverPhoto(ctx, img, x, y, w, h, { radius = 24, zoom = 1.0, panX = 0, panY = 0, overlay = null } = {}) {
  ctx.save();
  if (radius > 0) {
    roundedRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }
  drawImageCoverRaw(ctx, img, x, y, w, h, zoom, panX, panY);
  if (overlay) {
    ctx.fillStyle = overlay;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

/**
 * Clean Architectural Stages (Dark Navy Cinema & Light Neutral Editorial)
 * Strictly restrained: smooth directional studio lighting, subtle grid lines, ample whitespace.
 */
export function drawDarkStage(ctx, t, { accentX = 0.5, accentY = 0.28, subtleGrid = true } = {}) {
  const W = FILM.width;
  const H = FILM.height;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#09172C');
  bg.addColorStop(0.52, PALETTE.deepNavy);
  bg.addColorStop(1, '#050D1A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Controlled studio key-light gradient (soft midnight-blue lift, not neon)
  const driftX = Math.sin(t * 0.18) * 36;
  const driftY = Math.cos(t * 0.14) * 28;
  const cx = W * accentX + driftX;
  const cy = H * accentY + driftY;
  const key = ctx.createRadialGradient(cx, cy, 40, cx, cy, 780);
  key.addColorStop(0, 'rgba(57, 123, 255, 0.16)');
  key.addColorStop(0.48, 'rgba(16, 37, 68, 0.34)');
  key.addColorStop(1, 'rgba(8, 20, 38, 0)');
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, W, H);

  if (subtleGrid) {
    ctx.save();
    ctx.strokeStyle = 'rgba(141, 235, 255, 0.042)';
    ctx.lineWidth = 1;
    // Architectural margin verticals at x=76 and x=1004
    for (const gx of [76, 540, 1004]) {
      ctx.beginPath();
      ctx.moveTo(gx, 118);
      ctx.lineTo(gx, H - 118);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawLightStage(ctx, t, { warm = false, subtleGrid = true } = {}) {
  const W = FILM.width;
  const H = FILM.height;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  if (warm) {
    bg.addColorStop(0, '#FAFBFD');
    bg.addColorStop(1, '#EEF2F8');
  } else {
    bg.addColorStop(0, '#FFFFFF');
    bg.addColorStop(0.6, PALETTE.lightNeutral);
    bg.addColorStop(1, '#E9EEF6');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft studio skylight wash
  const cx = W * 0.5 + Math.sin(t * 0.16) * 32;
  const cy = 260;
  const wash = ctx.createRadialGradient(cx, cy, 40, cx, cy, 820);
  wash.addColorStop(0, 'rgba(57, 123, 255, 0.075)');
  wash.addColorStop(1, 'rgba(57, 123, 255, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  if (subtleGrid) {
    ctx.save();
    ctx.strokeStyle = 'rgba(8, 20, 38, 0.048)';
    ctx.lineWidth = 1;
    for (const gx of [76, 540, 1004]) {
      ctx.beginPath();
      ctx.moveTo(gx, 118);
      ctx.lineTo(gx, H - 118);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Clean Typographic Wordmark — CodePixel Web
 * Honest text-based wordmark (no fabricated emblem).
 */
export function drawWordmark(ctx, x, y, { size = 34, theme = 'dark', align = 'left', alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const part1 = 'CodePixel';
  const part2 = ' Web';

  ctx.font = fontSpec(800, size);
  const w1 = ctx.measureText(part1).width;
  ctx.font = fontSpec(600, size);
  const w2 = ctx.measureText(part2).width;
  const totalW = w1 + w2;

  let startX = x;
  if (align === 'center') startX = x - totalW * 0.5;
  else if (align === 'right') startX = x - totalW;

  ctx.font = fontSpec(800, size);
  ctx.fillStyle = theme === 'dark' ? PALETTE.white : PALETTE.deepNavy;
  ctx.fillText(part1, startX, y);

  ctx.font = fontSpec(600, size);
  ctx.fillStyle = theme === 'dark' ? PALETTE.softCyan : PALETTE.electricBlue;
  ctx.fillText(part2, startX + w1, y);
  ctx.restore();
  return totalW;
}

/**
 * Minimal Editorial Top Chrome & Subtle Progress Rail
 */
export function drawEditorialChrome(ctx, scene, t, { theme = 'dark', showHeader = true } = {}) {
  if (!showHeader) return;
  const W = FILM.width;
  const H = FILM.height;
  const isDark = theme === 'dark';

  ctx.save();
  // Wordmark on top-left
  drawWordmark(ctx, 76, 102, { size: 26, theme, alpha: 0.92 });

  // Chapter label on top-right
  ctx.font = fontSpec(600, 20);
  ctx.fillStyle = isDark ? 'rgba(244, 246, 250, 0.62)' : 'rgba(8, 20, 38, 0.56)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${scene.code} / 11  ·  ${scene.titleBn}`, W - 76, 100);

  // Hairline rule under header
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(8, 20, 38, 0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(76, 122);
  ctx.lineTo(W - 76, 122);
  ctx.stroke();

  // Subtle bottom film progress hairline
  const filmFrac = clamp(t / FILM.duration, 0, 1);
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(8, 20, 38, 0.08)';
  ctx.fillRect(76, H - 68, W - 152, 2);
  ctx.fillStyle = isDark ? PALETTE.softCyan : PALETTE.electricBlue;
  ctx.fillRect(76, H - 68, (W - 152) * filmFrac, 2);
  ctx.restore();
}

/**
 * Overflow-safe Unicode Bengali + English Text Block
 * Automatically wraps on words & explicit '\n', and steps down font size if any single token exceeds maxWidth.
 */
export function layoutTextLines(ctx, text, { weight = 700, size = 48, maxWidth = 928 } = {}) {
  let effectiveSize = size;
  const paragraphs = String(text).split('\n');

  const compute = (sz) => {
    ctx.font = fontSpec(weight, sz);
    const out = [];
    let widest = 0;
    for (const para of paragraphs) {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        out.push('');
        continue;
      }
      let line = words[0];
      for (let i = 1; i < words.length; i++) {
        const cand = `${line} ${words[i]}`;
        if (ctx.measureText(cand).width <= maxWidth) {
          line = cand;
        } else {
          out.push(line);
          widest = Math.max(widest, ctx.measureText(line).width);
          line = words[i];
        }
      }
      out.push(line);
      widest = Math.max(widest, ctx.measureText(line).width);
    }
    return { lines: out, widest };
  };

  let res = compute(effectiveSize);
  while (res.widest > maxWidth && effectiveSize > 16) {
    effectiveSize -= 2;
    res = compute(effectiveSize);
  }
  return { lines: res.lines, size: effectiveSize, widest: res.widest };
}

export function drawTextBlock(
  ctx,
  text,
  x,
  y,
  {
    weight = 700,
    size = 48,
    lineHeight = 1.34,
    maxWidth = 928,
    color = PALETTE.white,
    align = 'left',
    reveal = 1.0,
    risePx = 22,
  } = {}
) {
  const { lines, size: finalSize } = layoutTextLines(ctx, text, { weight, size, maxWidth });
  const stepY = finalSize * lineHeight;

  ctx.save();
  ctx.font = fontSpec(weight, finalSize);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    const stagger = lines.length > 1 ? i * 0.11 : 0;
    const lp = easeOutQuart(clamp((reveal - stagger) / Math.max(0.25, 1 - stagger), 0, 1));
    if (lp <= 0.001) continue;
    ctx.save();
    ctx.globalAlpha *= lp;
    const dy = (1 - lp) * risePx;
    ctx.fillText(lines[i], x, y + i * stepY + dy);
    ctx.restore();
  }
  ctx.restore();

  return {
    height: lines.length * stepY,
    linesCount: lines.length,
    finalSize,
  };
}

export function drawKickerPill(
  ctx,
  label,
  x,
  y,
  { theme = 'dark', align = 'left', accent = null, reveal = 1.0 } = {}
) {
  const p = easeOutQuart(reveal);
  if (p <= 0.01) return 0;

  ctx.save();
  ctx.globalAlpha *= p;
  ctx.font = fontSpec(600, 22);
  const tw = ctx.measureText(label).width;
  const padX = 20;
  const h = 42;
  const w = tw + padX * 2 + 16;
  let bx = x;
  if (align === 'center') bx = x - w * 0.5;
  else if (align === 'right') bx = x - w;

  const dy = (1 - p) * 12;
  const isDark = theme === 'dark';
  fillRoundRect(
    ctx,
    bx,
    y + dy,
    w,
    h,
    21,
    isDark ? 'rgba(57, 123, 255, 0.15)' : 'rgba(57, 123, 255, 0.10)'
  );
  strokeRoundRect(
    ctx,
    bx,
    y + dy,
    w,
    h,
    21,
    isDark ? 'rgba(141, 235, 255, 0.30)' : 'rgba(57, 123, 255, 0.26)',
    1.2
  );

  // Small crisp dot indicator
  const dotColor = accent || (isDark ? PALETTE.softCyan : PALETTE.electricBlue);
  ctx.fillStyle = dotColor;
  ctx.beginPath();
  ctx.arc(bx + padX + 3, y + dy + h * 0.5, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isDark ? PALETTE.softCyan : PALETTE.electricBlue;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + padX + 15, y + dy + h * 0.5 + 1);
  ctx.restore();

  return h;
}

/**
 * 2.5D / 3D Horizontal Perspective Strip Projection
 * Projects a flat high-res source canvas with true Y-axis rotation (`yaw` radians),
 * foreshortening, and perspective depth scaling!
 */
export function drawSurface3DYaw(ctx, srcCanvas, cx, cy, drawW, drawH, yawRad = 0, { slices = 36 } = {}) {
  if (Math.abs(yawRad) < 0.004) {
    ctx.drawImage(srcCanvas, cx - drawW * 0.5, cy - drawH * 0.5, drawW, drawH);
    return;
  }
  const focal = 1550;
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const sw = srcCanvas.width;
  const sh = srcCanvas.height;

  for (let i = 0; i < slices; i++) {
    const u0 = i / slices;
    const u1 = (i + 1) / slices;
    const xLocal0 = (u0 - 0.5) * drawW;
    const xLocal1 = (u1 - 0.5) * drawW;

    const z0 = xLocal0 * sinY;
    const z1 = xLocal1 * sinY;
    const s0 = focal / (focal + z0);
    const s1 = focal / (focal + z1);

    const sx0 = cx + xLocal0 * cosY * s0;
    const sx1 = cx + xLocal1 * cosY * s1;
    const sliceW = sx1 - sx0;
    if (sliceW <= 0.05) continue;

    const hMid = drawH * ((s0 + s1) * 0.5);
    const sy = cy - hMid * 0.5;

    const srcX = Math.floor(u0 * sw);
    const srcW = Math.max(1, Math.ceil((u1 - u0) * sw));

    // Add 0.65px overlap to prevent subpixel seam lines
    ctx.drawImage(srcCanvas, srcX, 0, srcW, sh, sx0 - 0.35, sy, sliceW + 0.7, hMid);
  }
}

/**
 * Realistic 3D Smartphone Mockup with Titanium Chassis, Dynamic Island, Shadow & Glass Reflection
 */
export function drawPhoneMockup3D(
  ctx,
  screenCanvas,
  cx,
  cy,
  {
    width = 450,
    height = 920,
    yaw = 0,
    scale = 1,
    scrollY = 0,
    shadowAlpha = 0.42,
  } = {}
) {
  const w = width * scale;
  const h = height * scale;
  const bezel = Math.round(14 * scale);
  const radius = Math.round(52 * scale);

  // Compose single phone unit onto temporary canvas for unified 3D yaw projection
  const pad = 28;
  const unitW = Math.ceil(w + pad * 2);
  const unitH = Math.ceil(h + pad * 2);
  const unit = createCanvas(unitW, unitH);
  const uctx = unit.getContext('2d');
  const ox = pad;
  const oy = pad;

  // 3D metallic side thickness extrusion when yaw != 0
  if (Math.abs(yaw) > 0.015) {
    const extrudeX = -Math.sin(yaw) * 18 * scale;
    const sideGrad = uctx.createLinearGradient(ox, oy, ox + w, oy + h);
    sideGrad.addColorStop(0, '#33445E');
    sideGrad.addColorStop(0.5, '#1B283C');
    sideGrad.addColorStop(1, '#0F1826');
    fillRoundRect(uctx, ox + extrudeX, oy + 3, w, h, radius, sideGrad);
    strokeRoundRect(uctx, ox + extrudeX, oy + 3, w, h, radius, 'rgba(141, 235, 255, 0.25)', 1.5);
  }

  // Outer titanium frame
  const frameGrad = uctx.createLinearGradient(ox, oy, ox + w, oy + h);
  frameGrad.addColorStop(0, '#2B3B54');
  frameGrad.addColorStop(0.45, '#131D2E');
  frameGrad.addColorStop(1, '#1E2C42');
  fillRoundRect(uctx, ox, oy, w, h, radius, frameGrad);
  strokeRoundRect(uctx, ox, oy, w, h, radius, 'rgba(255, 255, 255, 0.26)', 2);

  // Inner black glass bezel
  fillRoundRect(uctx, ox + 4, oy + 4, w - 8, h - 8, radius - 4, '#060A12');

  // Screen viewport clip
  const sx = ox + bezel;
  const sy = oy + bezel;
  const sw = w - bezel * 2;
  const sh = h - bezel * 2;
  const sRadius = Math.max(12, radius - bezel);

  uctx.save();
  roundedRectPath(uctx, sx, sy, sw, sh, sRadius);
  uctx.clip();
  uctx.fillStyle = '#FFFFFF';
  uctx.fillRect(sx, sy, sw, sh);

  if (screenCanvas) {
    const scaleFactor = sw / screenCanvas.width;
    const drawnH = screenCanvas.height * scaleFactor;
    const maxScroll = Math.max(0, drawnH - sh);
    const clampedScroll = clamp(scrollY, 0, maxScroll);
    uctx.drawImage(screenCanvas, sx, sy - clampedScroll, sw, drawnH);
  }

  // Subtle diagonal studio glass reflection
  const glass = uctx.createLinearGradient(sx, sy, sx + sw, sy + sh * 0.65);
  glass.addColorStop(0, 'rgba(255, 255, 255, 0.11)');
  glass.addColorStop(0.32, 'rgba(255, 255, 255, 0.02)');
  glass.addColorStop(0.36, 'rgba(255, 255, 255, 0)');
  glass.addColorStop(1, 'rgba(255, 255, 255, 0)');
  uctx.fillStyle = glass;
  uctx.fillRect(sx, sy, sw, sh);
  uctx.restore();

  // Dynamic Island pill
  const pillW = Math.round(w * 0.25);
  const pillH = Math.round(22 * scale);
  fillRoundRect(uctx, ox + (w - pillW) * 0.5, sy + Math.round(10 * scale), pillW, pillH, pillH * 0.5, '#05080F');

  // Bottom home indicator bar
  const barW = Math.round(w * 0.34);
  fillRoundRect(uctx, ox + (w - barW) * 0.5, sy + sh - Math.round(12 * scale), barW, Math.max(4, Math.round(5 * scale)), 3, 'rgba(120,130,150,0.55)');

  // Drop shadow on destination ctx
  ctx.save();
  const shGrad = ctx.createRadialGradient(cx, cy + h * 0.47, w * 0.08, cx, cy + h * 0.47, w * 0.78);
  shGrad.addColorStop(0, `rgba(4, 10, 22, ${shadowAlpha})`);
  shGrad.addColorStop(1, 'rgba(4, 10, 22, 0)');
  ctx.fillStyle = shGrad;
  ctx.fillRect(cx - w * 0.85, cy - h * 0.1, w * 1.7, h * 1.15);

  drawSurface3DYaw(ctx, unit, cx, cy, unitW, unitH, yaw, { slices: 38 });
  ctx.restore();
}

/**
 * Realistic Desktop / Studio Browser Mockup with macOS Window Bar & 3D Yaw
 */
export function drawDesktopMockup3D(
  ctx,
  screenCanvas,
  cx,
  cy,
  {
    width = 916,
    height = 610,
    yaw = 0,
    scale = 1,
    scrollY = 0,
    urlText = 'codepixelweb.vercel.app',
    shadowAlpha = 0.36,
    stand = true,
  } = {}
) {
  const w = width * scale;
  const h = height * scale;
  const standH = stand ? Math.round(58 * scale) : 0;
  const pad = 24;
  const unitW = Math.ceil(w + pad * 2);
  const unitH = Math.ceil(h + standH + pad * 2);
  const unit = createCanvas(unitW, unitH);
  const uctx = unit.getContext('2d');
  const ox = pad;
  const oy = pad;
  const radius = Math.round(22 * scale);
  const bezel = Math.round(12 * scale);
  const chromeH = Math.round(42 * scale);

  // Optional sleek aluminum Studio Display stand
  if (stand) {
    const neckW = Math.round(w * 0.16);
    const baseW = Math.round(w * 0.30);
    const neckGrad = uctx.createLinearGradient(ox, oy + h, ox, oy + h + standH);
    neckGrad.addColorStop(0, '#6F7F96');
    neckGrad.addColorStop(0.7, '#B8C4D4');
    neckGrad.addColorStop(1, '#8292A8');
    uctx.fillStyle = neckGrad;
    uctx.fillRect(ox + (w - neckW) * 0.5, oy + h - 4, neckW, standH - 8);
    fillRoundRect(uctx, ox + (w - baseW) * 0.5, oy + h + standH - 12, baseW, 12, 6, '#C7D2E0');
  }

  // 3D side thickness when tilted
  if (Math.abs(yaw) > 0.015) {
    const ex = -Math.sin(yaw) * 14 * scale;
    fillRoundRect(uctx, ox + ex, oy + 2, w, h, radius, '#27364D');
  }

  // Display enclosure
  const bodyGrad = uctx.createLinearGradient(ox, oy, ox + w, oy + h);
  bodyGrad.addColorStop(0, '#233146');
  bodyGrad.addColorStop(1, '#0F1826');
  fillRoundRect(uctx, ox, oy, w, h, radius, bodyGrad);
  strokeRoundRect(uctx, ox, oy, w, h, radius, 'rgba(255, 255, 255, 0.24)', 1.8);

  const sx = ox + bezel;
  const sy = oy + bezel;
  const sw = w - bezel * 2;
  const sh = h - bezel * 2;

  uctx.save();
  roundedRectPath(uctx, sx, sy, sw, sh, Math.max(10, radius - bezel));
  uctx.clip();

  // Browser top chrome
  uctx.fillStyle = '#F3F5F9';
  uctx.fillRect(sx, sy, sw, chromeH);
  uctx.fillStyle = '#E2E7F0';
  uctx.fillRect(sx, sy + chromeH - 1, sw, 1);

  // Traffic lights
  const dotY = sy + chromeH * 0.5;
  const dotR = Math.max(4, 5.5 * scale);
  const colors = ['#FF5F57', '#FEBC2E', '#28C840'];
  colors.forEach((col, idx) => {
    uctx.fillStyle = col;
    uctx.beginPath();
    uctx.arc(sx + 20 * scale + idx * 17 * scale, dotY, dotR, 0, Math.PI * 2);
    uctx.fill();
  });

  // URL pill
  const urlW = sw * 0.52;
  const urlH = Math.max(20, chromeH * 0.64);
  const urlX = sx + (sw - urlW) * 0.5;
  const urlY = sy + (chromeH - urlH) * 0.5;
  fillRoundRect(uctx, urlX, urlY, urlW, urlH, urlH * 0.5, '#FFFFFF');
  strokeRoundRect(uctx, urlX, urlY, urlW, urlH, urlH * 0.5, '#DCE2EC', 1);
  uctx.fillStyle = '#334155';
  uctx.font = fontSpec(600, Math.max(11, Math.round(13.5 * scale)));
  uctx.textAlign = 'center';
  uctx.textBaseline = 'middle';
  uctx.fillText(urlText, sx + sw * 0.5, sy + chromeH * 0.5 + 0.5);

  // Content viewport
  const vy = sy + chromeH;
  const vh = sh - chromeH;
  uctx.fillStyle = '#FFFFFF';
  uctx.fillRect(sx, vy, sw, vh);

  if (screenCanvas) {
    uctx.save();
    uctx.beginPath();
    uctx.rect(sx, vy, sw, vh);
    uctx.clip();
    const sf = sw / screenCanvas.width;
    const dh = screenCanvas.height * sf;
    const maxS = Math.max(0, dh - vh);
    uctx.drawImage(screenCanvas, sx, vy - clamp(scrollY, 0, maxS), sw, dh);
    uctx.restore();
  }

  // Subtle screen sheen
  const sheen = uctx.createLinearGradient(sx, sy, sx + sw * 0.85, sy + sh);
  sheen.addColorStop(0, 'rgba(255,255,255,0.07)');
  sheen.addColorStop(0.4, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  uctx.fillStyle = sheen;
  uctx.fillRect(sx, sy, sw, sh);
  uctx.restore();

  // Floor contact shadow
  ctx.save();
  const shY = cy + (h + standH) * 0.46;
  const shGrad = ctx.createRadialGradient(cx, shY, w * 0.08, cx, shY, w * 0.62);
  shGrad.addColorStop(0, `rgba(4, 10, 22, ${shadowAlpha})`);
  shGrad.addColorStop(1, 'rgba(4, 10, 22, 0)');
  ctx.fillStyle = shGrad;
  ctx.fillRect(cx - w * 0.7, cy, w * 1.4, (h + standH) * 0.85);

  drawSurface3DYaw(ctx, unit, cx, cy, unitW, unitH, yaw, { slices: 40 });
  ctx.restore();
}

/**
 * Realistic Tablet Mockup (for Scene 08 Responsive Trio)
 */
export function drawTabletMockup3D(
  ctx,
  screenCanvas,
  cx,
  cy,
  { width = 600, height = 800, yaw = 0, scale = 1, scrollY = 0, shadowAlpha = 0.34 } = {}
) {
  const w = width * scale;
  const h = height * scale;
  const bezel = Math.round(18 * scale);
  const radius = Math.round(34 * scale);
  const pad = 24;
  const unitW = Math.ceil(w + pad * 2);
  const unitH = Math.ceil(h + pad * 2);
  const unit = createCanvas(unitW, unitH);
  const uctx = unit.getContext('2d');
  const ox = pad;
  const oy = pad;

  fillRoundRect(uctx, ox, oy, w, h, radius, '#1B273A');
  strokeRoundRect(uctx, ox, oy, w, h, radius, 'rgba(255,255,255,0.24)', 1.8);

  const sx = ox + bezel;
  const sy = oy + bezel;
  const sw = w - bezel * 2;
  const sh = h - bezel * 2;
  uctx.save();
  roundedRectPath(uctx, sx, sy, sw, sh, Math.max(10, radius - bezel));
  uctx.clip();
  uctx.fillStyle = '#FFFFFF';
  uctx.fillRect(sx, sy, sw, sh);
  if (screenCanvas) {
    const sf = sw / screenCanvas.width;
    const dh = screenCanvas.height * sf;
    const maxS = Math.max(0, dh - sh);
    uctx.drawImage(screenCanvas, sx, sy - clamp(scrollY, 0, maxS), sw, dh);
  }
  uctx.restore();

  ctx.save();
  const shGrad = ctx.createRadialGradient(cx, cy + h * 0.48, w * 0.08, cx, cy + h * 0.48, w * 0.68);
  shGrad.addColorStop(0, `rgba(4, 10, 22, ${shadowAlpha})`);
  shGrad.addColorStop(1, 'rgba(4, 10, 22, 0)');
  ctx.fillStyle = shGrad;
  ctx.fillRect(cx - w * 0.75, cy, w * 1.5, h * 0.9);
  drawSurface3DYaw(ctx, unit, cx, cy, unitW, unitH, yaw, { slices: 34 });
  ctx.restore();
}

/**
 * Clean Interactive Touch / Cursor Indicator
 */
export function drawTouchRipple(ctx, x, y, clickP = 0, { color = PALETTE.electricBlue } = {}) {
  ctx.save();
  if (clickP > 0 && clickP < 1) {
    const r = 18 + 42 * easeOutQuart(clickP);
    ctx.strokeStyle = color;
    ctx.globalAlpha = (1 - clickP) * 0.75;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.94;
  ctx.shadowColor = 'rgba(8, 20, 38, 0.35)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Crisp Vector Icons (WhatsApp, Check, Search, Bag, Shield, Truck, Spark)
 */
export function drawWhatsappIcon(ctx, cx, cy, r, color = '#FFFFFF') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, r * 0.14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0.72 * Math.PI, 2.38 * Math.PI);
  ctx.lineTo(cx - r * 0.78, cy + r * 0.82);
  ctx.closePath();
  ctx.stroke();

  // Handset arc inside
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.04, r * 0.34, 0.2 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

export function drawCheckCircle(ctx, cx, cy, r, bg = PALETTE.emeraldTrust, fg = '#FFFFFF') {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = fg;
  ctx.lineWidth = Math.max(2.2, r * 0.19);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.38, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.32);
  ctx.lineTo(cx + r * 0.42, cy - r * 0.28);
  ctx.stroke();
  ctx.restore();
}
