/**
 * Cinematic stage helpers: layout grid, animated Bengali headlines,
 * camera push-ins, phone/browser viewports and scene transitions.
 */
import {
  C, W, H, SAFE, alpha, clamp, lerp, easeOut, easeIn, easeInOut, easeOutBack, easeOutQuint,
  beat, stag, lin, text, wrapLines, paragraph, eyebrow, rr, fillRR, strokeRR, circle, shadow, noShadow,
  icon, fontStr, grain, vignette, glowOrb, cinematicBG, lightSweep, brandMark, chip, line, mix,
} from '../render/kit.mjs';
import { phoneFrame, browserFrame } from '../render/kit.mjs';

/** Typographic content grid (Reels-safe). */
export const L = {
  x: 76,
  right: 1004,
  w: 928,
  top: 232,
  kickerY: 268,
  titleY: 352,
  bodyTop: 500,
  bottom: 1452,
};

/** Animated headline: two or three lines, mask-revealed from the baseline. */
export function headline(ctx, lines, t, {
  x = L.x, y = L.titleY, size = 92, weight = 700, color = C.white, delay = 0.06,
  stagger = 0.11, dur = 0.62, align = 'left', maxWidth = L.w, lineGap = 1.14, shadowOn = true,
} = {}) {
  const arr = Array.isArray(lines) ? lines : String(lines).split('\n');
  let cy = y;
  arr.forEach((ln, i) => {
    const p = beat(t, delay + i * stagger, dur, easeOutQuint);
    if (p <= 0) { cy += size * lineGap; return; }
    const clipH = size * 1.24;
    ctx.save();
    // mask reveal
    ctx.beginPath();
    ctx.rect(x - 8, cy - size * 0.98, maxWidth + 16, clipH * p);
    ctx.clip();
    ctx.globalAlpha *= clamp(p * 1.5);
    if (shadowOn) shadow(ctx, 'rgba(0,0,0,0.38)', 26, 8);
    text(ctx, ln, x + (1 - p) * 26, cy, { size, weight, color, align, maxWidth });
    noShadow(ctx);
    ctx.restore();
    cy += size * lineGap;
  });
  return cy;
}

export function kicker(ctx, str, t, { x = L.x, y = L.kickerY, color = C.cyan, delay = 0, align = 'left' } = {}) {
  if (!str) return;
  const p = beat(t, delay, 0.5, easeOut);
  ctx.save();
  ctx.globalAlpha *= p;
  const tw = eyebrow(ctx, str, x + (align === 'center' ? L.w / 2 : 0), y + (1 - p) * 12, { color, align });
  ctx.restore();
  return tw;
}

/** Thin accent rule that grows in. */
export function accentRule(ctx, x, y, w, t, { color = C.cyan, delay = 0.1, thickness = 3 } = {}) {
  const p = beat(t, delay, 0.55, easeOutQuint);
  fillRR(ctx, x, y, w * p, thickness, thickness, alpha(color, 0.9));
}

export function glassPanel(ctx, x, y, w, h, { r = 30, fill = 'rgba(16,26,53,0.72)', stroke = 'rgba(120,160,255,0.24)', glow = null } = {}) {
  ctx.save();
  shadow(ctx, 'rgba(0,0,0,0.45)', 50, 22);
  fillRR(ctx, x, y, w, h, r, fill);
  noShadow(ctx);
  strokeRR(ctx, x, y, w, h, r, stroke, 1.4);
  if (glow) {
    const g = lin(ctx, x, y, x + w, y + h, [[0, alpha(glow, 0.5)], [1, alpha(glow, 0)]]);
    strokeRR(ctx, x, y, w, h, r, g, 1.6);
  }
  ctx.restore();
}

/** Clip a box, then map a virtual canvas of size (vw, vh) into it. */
export function viewport(ctx, box, draw, { zoom = 1, focusX = 0.5, focusY = 0.5, radius = 0, vw, vh } = {}) {
  const vWidth = vw ?? box.w / zoom;
  const vHeight = vh ?? box.h / zoom;
  ctx.save();
  if (radius) { rr(ctx, box.x, box.y, box.w, box.h, radius); ctx.clip(); }
  else { ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip(); }
  ctx.translate(box.x, box.y);
  ctx.scale(box.w / vWidth, box.h / vHeight);
  ctx.translate(-(vWidth - box.w / (box.w / vWidth)) * 0, 0);
  // focus offset (in virtual units)
  const offX = (vWidth - box.w / (box.w / vWidth)) * 0;
  draw(ctx, vWidth, vHeight);
  ctx.restore();
}

/** Device viewport: draws a logical phone screen scaled into a screen box. */
export function phoneStage(ctx, t, {
  x, y, w = 390, h = 844, scale = 1.7, draw, glow = C.blue, enter = 0, float = true,
  tilt = 0, dim = 1, shadowStrength = 0.7,
} = {}) {
  const pw = w * scale, ph = h * scale;
  const px = x ?? (W - pw) / 2;
  const py = y ?? 640;
  const e = easeOutBack(clamp(enter));
  const fy = float ? Math.sin(t * 0.9) * 6 : 0;
  ctx.save();
  ctx.globalAlpha *= dim;
  ctx.translate(px + pw / 2, py + ph / 2 + (1 - e) * 90 + fy);
  ctx.rotate(tilt);
  ctx.scale(0.92 + 0.08 * e, 0.92 + 0.08 * e);
  ctx.translate(-pw / 2, -ph / 2);
  // ambient glow behind device
  if (glow) glowOrb(ctx, pw / 2, ph * 0.42, pw * 0.95, glow, 0.22);
  ctx.save();
  ctx.scale(scale, scale);
  phoneFrame(ctx, 0, 0, w, h, (sw, sh) => draw(sw, sh), { radius: 46, bezel: 10 });
  ctx.restore();
  ctx.restore();
  return { x: px, y: py, w: pw, h: ph };
}

/** Browser window on a dark desktop stage, drawn at logical size then scaled. */
export function browserStage(ctx, t, {
  x = 56, y = 560, w = 1280, h = 800, scale = 0.78, draw, enter = 0, url, glow = C.blue, dim = 1,
} = {}) {
  const bw = w * scale, bh = h * scale;
  const bx = x + (L.w - bw) / 2;
  const e = easeOutQuint(clamp(enter));
  ctx.save();
  ctx.globalAlpha *= dim;
  ctx.translate(bx + bw / 2, y + bh / 2 + (1 - e) * 60);
  ctx.scale(0.94 + 0.06 * e, 0.94 + 0.06 * e);
  ctx.translate(-bw / 2, -bh / 2);
  glowOrb(ctx, bw / 2, bh * 0.5, bw * 0.8, glow, 0.16);
  ctx.save();
  ctx.scale(scale, scale);
  browserFrame(ctx, 0, 0, w, h, (sw, sh) => draw(sw, sh), { radius: 22, url });
  ctx.restore();
  ctx.restore();
  return { x: bx, y, w: bw, h: bh };
}

/** Small persistent brand watermark (kept inside the safe area). */
export function brandWatermark(ctx, t, opacity = 0.5) {
  if (opacity <= 0) return;
  ctx.save();
  ctx.globalAlpha *= opacity * 0.9;
  brandMark(ctx, L.right - 168, 236, 24, { withWordmark: false });
  text(ctx, 'CODEPIXEL', L.right - 136, 254, { size: 19, weight: 600, color: 'rgba(226,238,255,0.82)', letterSpacing: 3.4 });
  ctx.restore();
}

export function sceneFade(ctx, local, dur, { inDur = 0.34, outDur = 0.32 } = {}) {
  let a = 0;
  if (local < inDur) a = 1 - local / inDur;
  if (local > dur - outDur) a = Math.max(a, (local - (dur - outDur)) / outDur);
  if (a > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(4,7,15,${clamp(a) * 0.92})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

export function wipeTransition(ctx, local, dur, color = C.navy) {
  // diagonal wipe out over the last 0.45s
  const d = 0.45;
  if (local > dur - d) {
    const p = easeInOut((local - (dur - d)) / d);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H * p);
    ctx.lineTo(0, H * Math.max(0, p - 0.18));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if (local < 0.4) {
    const p = 1 - easeOut(local / 0.4);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H * p);
    ctx.lineTo(0, H * Math.max(0, p - 0.18));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** Chapter title card (used before big sections). */
export function chapterCard(ctx, t, { index, title, sub, accent = C.cyan, p = 1 }) {
  const e = easeOut(clamp(p));
  ctx.save();
  glowOrb(ctx, W * 0.5, H * 0.46, 620, accent, 0.22);
  const n = String(index).padStart(2, '0');
  text(ctx, n, W / 2, 690 + (1 - e) * 20, { size: 220, weight: 800, color: alpha(accent, 0.16), align: 'center' });
  const lines = String(title).split('\n');
  const size = lines.length > 1 ? 82 : 92;
  const lineGap = size * 1.18;
  const firstY = 860 - (lines.length - 1) * lineGap;
  let w = 0;
  lines.forEach((ln, i) => {
    w = Math.max(w, text(ctx, ln, W / 2, firstY + i * lineGap, {
      size, weight: 700, color: C.white, align: 'center', maxWidth: 900, opacity: e,
    }));
  });
  const lastY = firstY + (lines.length - 1) * lineGap;
  fillRR(ctx, W / 2 - (w * e) / 2, lastY + 46, w * e, 4, 2, alpha(accent, 0.85));
  if (sub) text(ctx, sub, W / 2, lastY + 112, { size: 36, weight: 500, color: 'rgba(200,215,240,0.82)', align: 'center', opacity: e, maxWidth: 880 });
  ctx.restore();
}

export { C, W, H, SAFE };

/**
 * Sequenced screen player: switches phone screens at given local times with a
 * contained slide+fade (the phone frame clips it, so it stays inside the device).
 */
export function seq(local, items) {
  let idx = 0;
  for (let i = 0; i < items.length; i++) if (local >= items[i].at) idx = i;
  const it = items[idx];
  const prev = items[Math.max(0, idx - 1)];
  const p = clamp((local - it.at) / 0.42);
  return {
    index: idx,
    at: it.at,
    draw(ctx, w, h, extra = {}) {
      const e = easeOutQuint(p);
      if (p < 1 && prev !== it) {
        ctx.save();
        ctx.globalAlpha *= 1 - e;
        ctx.translate(-w * e * 0.22, 0);
        prev.fn(ctx, w, h, { p, ...extra });
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha *= clamp(0.4 + 0.6 * e);
      ctx.translate(w * (1 - e) * 0.35, 0);
      it.fn(ctx, w, h, { p, ...extra });
      ctx.restore();
    },
  };
}
