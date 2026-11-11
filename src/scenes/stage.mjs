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
import { bengali, CHAPTERS } from '../render/motion.mjs';

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

/**
 * Animated headline — word-level kinetic typography.
 *
 * Each word of each line rises into place from inside a line mask, so the copy
 * builds at the rhythm of the narration instead of appearing as a block. Long
 * lines that would need auto-shrinking fall back to the single-run rendering so
 * measuring never drifts from drawing.
 */
export function headline(ctx, lines, t, {
  x = L.x, y = L.titleY, size = 92, weight = 700, color = C.white, delay = 0.06,
  stagger = 0.11, dur = 0.62, align = 'left', maxWidth = L.w, lineGap = 1.14, shadowOn = true,
  wordStagger = 0.048, underline = false, underlineColor = null,
} = {}) {
  const arr = Array.isArray(lines) ? lines : String(lines).split('\n');
  const grad = lin(ctx, x, y - size * 1.05, x, y + size * 0.15, [
    [0, '#FFFFFF'], [0.62, '#FFFFFF'], [1, '#CFE2FF'],
  ]);
  let cy = y;
  let lastLineW = 0;

  arr.forEach((ln, i) => {
    const p = beat(t, delay + i * stagger, dur, easeOutQuint);
    if (p <= 0) { cy += size * lineGap; return; }
    const clipH = size * 1.24;
    ctx.save();
    // line mask: words rise into this band
    ctx.beginPath();
    ctx.rect(x - 14, cy - size * 1.02, maxWidth + 28, clipH);
    ctx.clip();
    ctx.globalAlpha *= clamp(p * 1.6);
    if (shadowOn) shadow(ctx, 'rgba(0,0,0,0.42)', 30, 10);

    ctx.save();
    ctx.font = fontStr(size, weight, ln);
    const words = ln.split(' ').filter((w) => w.length);
    const spaceW = ctx.measureText(' ').width;
    const widths = words.map((w) => ctx.measureText(w).width);
    const total = widths.reduce((a, b) => a + b, 0) + spaceW * Math.max(0, words.length - 1);
    ctx.restore();

    if (words.length > 1 && total <= maxWidth * 1.005) {
      // per-word kinetic reveal
      let wx = align === 'center' ? x + (maxWidth - total) / 2 : align === 'right' ? x + maxWidth - total : x;
      const startX = wx;
      words.forEach((w, wi) => {
        const wp = beat(t, delay + i * stagger + wi * wordStagger, dur * 0.86, easeOutQuint);
        if (wp > 0) {
          const dy = (1 - wp) * size * 0.62;
          text(ctx, w, wx, cy + dy, {
            size, weight, color: color === C.white ? grad : color, align: 'left',
            opacity: clamp(wp * 1.5),
          });
        }
        wx += widths[wi] + spaceW;
      });
      lastLineW = total;
      void startX;
    } else {
      // fallback: one measured run (auto-shrink still works)
      const dy = (1 - p) * size * 0.5;
      text(ctx, ln, x + (1 - p) * 18, cy + dy, { size, weight, color, align, maxWidth });
      lastLineW = Math.min(total, maxWidth);
    }
    noShadow(ctx);
    ctx.restore();

    if (underline && i === arr.length - 1) {
      const up = beat(t, delay + i * stagger + 0.34, 0.6, easeOutQuint);
      if (up > 0) {
        const w = Math.min(lastLineW, maxWidth) * up;
        const ux = align === 'center' ? x + (maxWidth - w) / 2 : x;
        fillRR(ctx, ux, cy + size * 0.30, w, 5, 3, alpha(underlineColor || C.cyan, 0.9));
      }
    }
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

/**
 * Chapter title card — an editorial chapter opener.
 *
 * Number in Bengali words, kinetic title, growing rule, one-line promise, an
 * orbiting accent, and a six-part chapter rail so the viewer always knows how
 * much of the film is left.
 */
export function chapterCard(ctx, t, { index, title, sub, items = null, accent = C.cyan, p = 1 }) {
  const e = easeOutQuint(clamp(p));
  const num = bengali(String(index).padStart(2, '0'));

  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.15);

  // accent aura
  glowOrb(ctx, W * 0.5, 860, 760, accent, 0.15);
  glowOrb(ctx, W * 0.95, 470, 420, C.violet, 0.10);

  // rotating orbit + ghost numeral
  ctx.save();
  ctx.translate(818, 836);
  ctx.rotate(-0.08);
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate(t * (0.14 + i * 0.06) * (i % 2 ? -1 : 1) + i * 0.9);
    ctx.strokeStyle = alpha(accent, 0.15 - i * 0.032);
    ctx.lineWidth = 1.4;
    ctx.setLineDash(i === 1 ? [6, 22] : []);
    ctx.beginPath();
    ctx.arc(0, 0, 210 + i * 84, 0, 4.5);
    ctx.stroke();
    ctx.restore();
  }
  const oa = t * 0.7;
  circle(ctx, Math.cos(oa) * 378, Math.sin(oa) * 378, 5, alpha(accent, 0.8));
  ctx.restore();

  text(ctx, num, 1012, 1010, {
    size: 400, weight: 800, color: alpha(accent, 0.075), align: 'right',
  });

  // eyebrow
  const ep = beat(t, 0.05, 0.5, easeOut);
  ctx.save();
  ctx.globalAlpha *= ep;
  circle(ctx, 86, 700, 6, accent);
  text(ctx, `অধ্যায় ${num}`, 106, 708, {
    size: 25, weight: 600, color: alpha(accent, 0.95), letterSpacing: 5,
  });
  ctx.restore();

  // kinetic title
  const lines = String(title).split('\n');
  const endY = headline(ctx, lines, t, {
    x: 76, y: 828, size: lines.length > 1 ? 78 : 86, maxWidth: 720,
    wordStagger: 0.055, stagger: 0.12, delay: 0.1,
  });

  // growing rule
  const rp = beat(t, 0.4, 0.7, easeOutQuint);
  fillRR(ctx, 76, endY - 58, 140 * rp, 5, 3, alpha(accent, 0.95));

  // one-line promise
  if (sub) {
    const sp = beat(t, 0.5, 0.6, easeOut);
    ctx.save();
    ctx.globalAlpha *= sp;
    text(ctx, sub, 76, endY + 16, {
      size: 33, weight: 500, color: 'rgba(205,221,245,0.9)', maxWidth: 700,
    });
    ctx.restore();
  }

  // what this chapter contains (three short promises)
  if (items && items.length) {
    const y0 = Math.max(968, endY + 92);
    if (y0 < 1180) {
      items.forEach((label, i) => {
        const ip = beat(t, 0.58 + i * 0.14, 0.55, easeOutQuint);
        if (ip <= 0) return;
        const y = y0 + i * 74;
        ctx.save();
        ctx.globalAlpha *= ip;
        ctx.translate((1 - ip) * -22, 0);
        const dotX = 84;
        circle(ctx, dotX, y - 9, 4.5, alpha(accent, 0.95));
        text(ctx, label, 106, y, {
          size: 29, weight: 600, color: 'rgba(226,236,252,0.94)', maxWidth: 700,
        });
        line(ctx, 106, y + 26, 106 + (700 * ip), y + 26, 'rgba(255,255,255,0.055)', 1);
        ctx.restore();
      });
    }
  }

  // chapter rail — where are we in the film
  const rp2 = beat(t, 0.5, 0.8, easeOut);
  if (rp2 > 0) {
    ctx.save();
    ctx.globalAlpha *= rp2;
    const cur = CHAPTERS.findIndex((c) => c.i === index);
    text(ctx, 'পুরো ভিডিওতে', 76, 1318, {
      size: 19, weight: 600, color: 'rgba(170,190,220,0.72)', letterSpacing: 3.4,
    });
    const colW = 928 / CHAPTERS.length;
    CHAPTERS.forEach((ch, i) => {
      const active = ch.i === index;
      const bx = 76 + i * colW;
      const barW = colW - 12;
      const fillP = active ? clamp(t / 1.4) : i < cur ? 1 : 0;
      fillRR(ctx, bx, 1352, barW, 3.5, 2, 'rgba(255,255,255,0.13)');
      if (fillP > 0) fillRR(ctx, bx, 1352, barW * fillP, 3.5, 2, active ? accent : 'rgba(255,255,255,0.4)');
      text(ctx, bengali(ch.i), bx + barW, 1392, {
        size: 17, weight: active ? 700 : 500,
        color: active ? C.white : 'rgba(168,188,218,0.5)',
        align: 'right',
      });
    });
    if (cur >= 0) {
      const bx = 76 + cur * colW;
      text(ctx, CHAPTERS[cur].name, bx, 1440, {
        size: 24, weight: 700, color: alpha(accent, 0.95), maxWidth: 300,
      });
    }
    ctx.restore();
  }

  ctx.restore();
  void e;
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
