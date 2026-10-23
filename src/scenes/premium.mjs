/**
 * Premium stage system — shared art direction for the whole film.
 *
 * Two tones, one brand language:
 *   dark  — cinematic hook / chapters: deep navy, aurora light, glass, gold hairlines
 *   light — product demo: warm paper, soft cards, AURUM storefront, real UI
 *
 * Everything here is deterministic (no Math.random) so frames can be rendered
 * in any order and in any process.
 */
import {
  C, W, H, alpha, mix, clamp, lerp, easeOut, easeIn, easeInOut, easeOutQuint, easeOutBack,
  beat, stag, lin, text, paragraph, wrapLines, rr, fillRR, strokeRR, circle, shadow, noShadow,
  icon, fontStr, fontStr as fs, isBengali, glowOrb, lightSweep, brandMark, grain, vignette,
  phoneFrame, browserFrame,
} from '../render/kit.mjs';

/* ------------------------------------------------------------------ palette */
export const P = {
  dark: {
    base0: '#04060C',
    base1: '#0A1220',
    ink: '#F6F8FF',
    ink2: '#B9C6DC',
    muted: '#7E90AC',
    gold: '#E3B87C',
    goldDeep: '#B08A57',
    cyan: '#4FD8FF',
    blue: '#3B6BFF',
    violet: '#7C5CFF',
    glass: 'rgba(255,255,255,0.055)',
    glassLine: 'rgba(255,255,255,0.12)',
    panel: 'rgba(12,20,36,0.72)',
    hairline: 'rgba(255,255,255,0.10)',
    grid: 'rgba(140,180,255,0.045)',
  },
  light: {
    base0: '#FDFBF6',
    base1: '#F1ECE1',
    ink: '#14171D',
    ink2: '#4C525C',
    muted: '#8B8577',
    gold: '#B08A57',
    goldDeep: '#8A6A3D',
    cyan: '#0E8FA8',
    blue: '#2F6FED',
    violet: '#6B4FE8',
    card: '#FFFFFF',
    cardLine: '#EAE3D5',
    panel: 'rgba(255,255,255,0.82)',
    hairline: 'rgba(20,23,29,0.075)',
    grid: 'rgba(120,100,70,0.05)',
    shadow: 'rgba(74,56,28,0.14)',
  },
};

export const AURUM = {
  cream: '#F8F4EC',
  gold: '#C2A167',
  ink: '#15181E',
};

/* ------------------------------------------------------------------ layout */
export const LAY = {
  x: 72,
  right: 1008,
  w: 936,
  kickerY: 232,
  titleY: 396,
  ctaY: 1806,
};

/* ------------------------------------------------------------------ helpers */
export const SEED = (n) => {
  // deterministic pseudo random 0..1
  let x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function roundRectPath(ctx, x, y, w, h, r) {
  rr(ctx, x, y, w, h, r);
}

/** Dotted/dashed hairline */
export function dashLine(ctx, x0, y0, x1, y1, color, lw = 1.4, dash = [6, 8], p = 1) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(lerp(x0, x1, clamp(p)), lerp(y0, y1, clamp(p)));
  ctx.stroke();
  ctx.restore();
}

/** Radial spotlight pool of light on a wall. */
function aurora(ctx, x, y, r, color, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, alpha(color, a));
  g.addColorStop(0.42, alpha(color, a * 0.42));
  g.addColorStop(1, alpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/* ------------------------------------------------------------------ backdrop */
/**
 * Full-frame background. `t` is absolute video time so the light keeps moving
 * continuously across scene cuts (no visible reset).
 */
export function backdrop(ctx, tone, t, { accent = null, focusY = 0.42, strength = 1 } = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, d.base0);
  g.addColorStop(1, d.base1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (tone === 'light') {
    const dx = Math.sin(t * 0.21) * 60;
    const dy = Math.cos(t * 0.17) * 40;
    aurora(ctx, W * 0.12 + dx, H * 0.1 + dy, 620, '#FBE9CF', 0.75 * strength);
    aurora(ctx, W * 0.94 - dx * 0.7, H * 0.26, 560, '#DCEAFB', 0.7 * strength);
    aurora(ctx, W * 0.5, H * 0.92, 780, '#F0E6D2', 0.85 * strength);
    // paper weave
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = d.grid;
    ctx.lineWidth = 1;
    const gs = 74;
    for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
    // gentle edge shading
    const vg = ctx.createRadialGradient(W / 2, H * focusY, W * 0.32, W / 2, H * 0.5, W * 1.02);
    vg.addColorStop(0, 'rgba(255,255,255,0)');
    vg.addColorStop(1, 'rgba(120,98,64,0.16)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    grain(ctx, 0.028, W, H);
  } else {
    const dx = Math.sin(t * 0.19 + 1.2) * 80;
    const dy = Math.cos(t * 0.15) * 55;
    aurora(ctx, W * 0.16 + dx, H * 0.16 + dy, 780, accent || '#2A5CFF', 0.5 * strength);
    aurora(ctx, W * 0.97 - dx * 0.6, H * 0.48 - dy * 0.5, 700, '#6A48FF', 0.34 * strength);
    aurora(ctx, W * 0.35, H * 1.0, 760, '#0E8AA8', 0.24 * strength);
    if (accent) aurora(ctx, W * 0.78, H * 0.12, 520, accent, 0.16 * strength);
    // slow light sweep from the top (wall of light)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sw = Math.sin(t * 0.13) * 240;
    const lg = ctx.createLinearGradient(W * 0.5 + sw - 320, -200, W * 0.5 + sw + 320, H * 0.75);
    lg.addColorStop(0, 'rgba(120,170,255,0)');
    lg.addColorStop(0.42, 'rgba(130,180,255,0.055)');
    lg.addColorStop(1, 'rgba(120,170,255,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // technical grid, slower than the light
    ctx.save();
    ctx.strokeStyle = d.grid;
    ctx.lineWidth = 1;
    const gs = 76;
    const off = (t * 5) % gs;
    for (let x = -gs + off; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
    // top + bottom falloff
    const tg = ctx.createLinearGradient(0, 0, 0, 340);
    tg.addColorStop(0, 'rgba(2,5,10,0.55)');
    tg.addColorStop(1, 'rgba(2,5,10,0)');
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, W, 340);
    const bg = ctx.createLinearGradient(0, H - 480, 0, H);
    bg.addColorStop(0, 'rgba(2,5,10,0)');
    bg.addColorStop(1, 'rgba(2,5,10,0.62)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, H - 480, W, 480);
    vignette(ctx, W, H, 0.5);
    grain(ctx, 0.04, W, H);
  }
}

/** Soft floor shadow so devices feel grounded. */
export function groundShadow(ctx, cx, cy, rx, { tone = 'dark', a = 0.5, ry = 34 } = {}) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  if (tone === 'light') {
    g.addColorStop(0, `rgba(96,74,42,${a * 0.42})`);
    g.addColorStop(0.6, `rgba(96,74,42,${a * 0.16})`);
    g.addColorStop(1, 'rgba(96,74,42,0)');
  } else {
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(0.6, `rgba(0,0,0,${a * 0.4})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
  }
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ type */
/** Parse *accent* markers inside a line. Returns segments. */
function parseAccents(line) {
  const out = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ s: line.slice(last, m.index), accent: false });
    out.push({ s: m[1], accent: true });
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push({ s: line.slice(last), accent: false });
  return out;
}

/** Measure a line (sum of segments). */
function measureSeg(ctx, segs, size, weight) {
  let w = 0;
  for (const seg of segs) {
    ctx.save();
    ctx.font = fontStr(size, weight, seg.s);
    w += ctx.measureText(seg.s).width;
    ctx.restore();
  }
  return w;
}

/**
 * Large headline with per-line clip reveal and optional gradient accent words.
 * `lines` may be a string with \n. Use *word* for the accent gradient.
 */
export function headlineBlock(ctx, lines, t, {
  tone = 'dark', x = LAY.x, y = LAY.titleY, size = 92, weight = 700, delay = 0.08,
  stagger = 0.1, dur = 0.62, align = 'left', maxWidth = LAY.w, lineGap = 1.16,
  color = null, accentTo = null, mask = true, enter = 0, letterSpacing = 0,
} = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  const base = color || d.ink;
  const arr = Array.isArray(lines) ? lines : String(lines).split('\n');
  let cy = y + enter;
  arr.forEach((ln, i) => {
    const p = mask ? beat(t, delay + i * stagger, dur, easeOutQuint) : 1;
    const lineH = size * lineGap;
    // auto-shrink line to max width
    let s = size;
    let segs = parseAccents(ln);
    let tw = measureSeg(ctx, segs, s, weight);
    if (tw > maxWidth && tw > 0) {
      s = Math.max(size * (maxWidth / tw), size * 0.62);
      tw = measureSeg(ctx, segs, s, weight);
    }
    if (p <= 0) { cy += lineH; return; }
    ctx.save();
    if (mask) {
      ctx.beginPath();
      ctx.rect(x - 12, cy - s * 1.02, maxWidth + 24, s * 1.32 * p);
      ctx.clip();
    }
    ctx.globalAlpha *= clamp(p * 1.6);
    let cx = align === 'center' ? x + (maxWidth - tw) / 2 : align === 'right' ? x + maxWidth - tw : x;
    const drift = (1 - p) * 30;
    for (const seg of segs) {
      let col = base;
      if (seg.accent) {
        const g = accentTo
          ? lin(ctx, cx, cy - s, cx + 220, cy, [[0, accentTo[0]], [1, accentTo[1]]])
          : lin(ctx, cx, cy - s, cx + 260, cy, [[0, d.cyan], [1, d.gold]]);
        col = g;
      }
      const wseg = text(ctx, seg.s, cx + drift, cy, {
        size: s, weight, color: col, align: 'left', letterSpacing,
      });
      cx += wseg;
    }
    ctx.restore();
    cy += lineH;
  });
  return cy;
}

/** Small letterspaced eyebrow with a leading gold rule. */
export function kickerLine(ctx, str, t, {
  tone = 'dark', x = LAY.x, y = LAY.kickerY, delay = 0, color = null,
  rule = true, align = 'left', size = 25, p: forceP = null,
} = {}) {
  if (!str) return 0;
  const d = tone === 'light' ? P.light : P.dark;
  const p = forceP === null ? beat(t, delay, 0.55, easeOut) : forceP;
  if (p <= 0) return 0;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  const col = color || (tone === 'light' ? d.goldDeep : d.gold);
  let tx = x;
  if (rule) {
    const rw = 34 * p;
    fillRR(ctx, x, y - size * 0.34, rw, 3, 1.5, alpha(col, 0.9));
    tx = x + 48;
  }
  if (align === 'center') {
    ctx.font = fontStr(size, 600, str);
    const tw = ctx.measureText(str).width;
    tx = x - tw / 2 + (rule ? 26 : 0);
    if (rule) fillRR(ctx, tx - tw / 2 - 48, y - size * 0.34, 34, 3, 1.5, alpha(col, 0.9));
  }
  text(ctx, str, tx + (1 - p) * 14, y, {
    size, weight: 600, color: tone === 'light' ? alpha(d.goldDeep, 0.95) : alpha(d.gold, 0.95),
    letterSpacing: 1.2,
  });
  ctx.restore();
  return p;
}

/* ------------------------------------------------------------------ surfaces */
export function glassCard(ctx, x, y, w, h, {
  r = 28, fill = 'rgba(13,21,38,0.66)', stroke = 'rgba(150,185,255,0.20)',
  glow = null, blurEdge = true, p = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  shadow(ctx, 'rgba(0,0,0,0.42)', 44, 20);
  fillRR(ctx, x, y, w, h, r, fill);
  noShadow(ctx);
  if (blurEdge) {
    const g = lin(ctx, x, y, x, y + h, [[0, 'rgba(255,255,255,0.10)'], [0.35, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0)']]);
    strokeRR(ctx, x, y, w, h, r, g, 1.3);
  }
  strokeRR(ctx, x, y, w, h, r, stroke, 1.1);
  if (glow) {
    const g2 = lin(ctx, x, y, x + w, y + h, [[0, alpha(glow, 0.45)], [1, alpha(glow, 0)]]);
    strokeRR(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r, g2, 1.4);
  }
  ctx.restore();
}

export function lightCard(ctx, x, y, w, h, { r = 26, fill = '#FFFFFF', line = P.light.cardLine, p = 1, lift = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  if (lift > 0) shadow(ctx, `rgba(74,56,28,${0.16 * lift})`, 34 + 16 * lift, 16 * lift);
  fillRR(ctx, x, y, w, h, r, fill);
  noShadow(ctx);
  strokeRR(ctx, x, y, w, h, r, line, 1.2);
  ctx.restore();
}

/* ------------------------------------------------------------------ devices */
/**
 * Full phone with a live screen. The UI draws at 390x844 logical units and is
 * scaled to the screen width, so type stays proportionate and crisp.
 */
export function phone(ctx, t, {
  x = null, y = 660, w = 560, rotate = 0, tone = 'light', enter = 0, float = true,
  draw, glow = null, dim = 1, bezelRatio = 0.036, radiusRatio = 0.135, frameTone = 'dark',
  shadowA = 0.55,
} = {}) {
  const e = easeOutBack(clamp(enter));
  const deviceH = w * (844 / 390) * 0.98 + w * 0.07;
  const px = x === null ? (W - w) / 2 : x;
  const py = y + (1 - e) * 120 + (float ? Math.sin(t * 0.8) * 5 : 0);
  ctx.save();
  ctx.globalAlpha *= dim * clamp(e * 1.4);
  ctx.translate(px + w / 2, py + deviceH / 2);
  ctx.rotate(rotate);
  ctx.scale(0.94 + 0.06 * e, 0.94 + 0.06 * e);
  ctx.translate(-w / 2, -deviceH / 2);

  if (glow) glowOrb(ctx, w / 2, deviceH * 0.42, w * 1.15, glow, 0.22);
  groundShadow(ctx, w / 2, deviceH + 22, w * 0.72, { tone, a: shadowA, ry: w * 0.075 });

  // frame
  shadow(ctx, tone === 'light' ? 'rgba(58,42,20,0.42)' : 'rgba(0,0,0,0.7)', 70, 30);
  fillRR(ctx, 0, 0, w, deviceH, w * radiusRatio, frameTone === 'light' ? '#E6E2D8' : '#0B0F18');
  noShadow(ctx);
  strokeRR(ctx, 0, 0, w, deviceH, w * radiusRatio, tone === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(155,185,255,0.28)', 1.6);
  // buttons
  fillRR(ctx, -3, deviceH * 0.2, 3, deviceH * 0.055, 2, 'rgba(170,190,225,0.4)');
  fillRR(ctx, -3, deviceH * 0.28, 3, deviceH * 0.085, 2, 'rgba(170,190,225,0.4)');
  fillRR(ctx, w, deviceH * 0.24, 3, deviceH * 0.1, 2, 'rgba(170,190,225,0.35)');

  const bez = w * bezelRatio;
  const sw = w - bez * 2;
  const sh = deviceH - bez * 2;
  const k = sw / 390;
  ctx.save();
  rr(ctx, bez, bez, sw, sh, w * radiusRatio - bez * 0.8);
  ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bez, bez, sw, sh);
  ctx.translate(bez, bez);
  ctx.scale(k, k);
  ctx.save();
  draw(390, 844);
  ctx.restore();
  ctx.restore();
  // island + home bar
  fillRR(ctx, w / 2 - sw * 0.15, bez + 4, sw * 0.3, Math.max(12, w * 0.032), 999, '#05070C');
  fillRR(ctx, w / 2 - w * 0.09, deviceH - bez - w * 0.026, w * 0.18, 4, 2, 'rgba(0,0,0,0.22)');
  // glass reflection
  ctx.save();
  rr(ctx, bez, bez, sw, sh, w * radiusRatio - bez * 0.8);
  ctx.clip();
  const rg = ctx.createLinearGradient(0, 0, sw, sh * 0.7);
  rg.addColorStop(0, 'rgba(255,255,255,0.16)');
  rg.addColorStop(0.32, 'rgba(255,255,255,0.02)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, deviceH);
  ctx.restore();
  ctx.restore();
  return { x: px, y: py, w, h: deviceH, screen: { x: px + bez, y: py + bez, w: sw, h: sh, k } };
}

/**
 * Zoomed crop of a 390x844 phone screen, drawn as a floating rounded card.
 * `cx`/`cy` are the logical focus point; `k` is the zoom (1 = whole screen).
 */
export function screenCrop(ctx, {
  x, y, w, h, k = 2.2, cx = 195, cy = 380, draw, radius = 30, tone = 'light',
  p = 1, ring = true, rotate = 0,
}) {
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  if (rotate) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rotate);
    ctx.translate(-(x + w / 2), -(y + h / 2));
  }
  shadow(ctx, tone === 'light' ? 'rgba(60,44,20,0.26)' : 'rgba(0,0,0,0.6)', 50, 22);
  fillRR(ctx, x, y, w, h, radius, '#FFFFFF');
  noShadow(ctx);
  ctx.save();
  rr(ctx, x, y, w, h, radius);
  ctx.clip();
  const ox = cx - w / (2 * k);
  const oy = cy - h / (2 * k);
  ctx.translate(x - ox * k, y - oy * k);
  ctx.scale(k, k);
  draw(390, 844);
  ctx.restore();
  if (ring) strokeRR(ctx, x, y, w, h, radius, tone === 'light' ? 'rgba(20,23,29,0.10)' : 'rgba(255,255,255,0.16)', 1.4);
  ctx.restore();
}

/**
 * Desktop browser window with live UI at logical width `vw`.
 * Height is derived from the UI's natural aspect.
 */
export function browser(ctx, t, {
  x = null, y = 600, w = 940, vw = 1180, vh = null, draw, tone = 'light', url = 'admin.aurum.shop',
  enter = 0, glow = null, dark = false, p = 1, chromeH = 34,
} = {}) {
  const e = easeOutQuint(clamp(enter));
  const innerW = w - 16;
  const k = innerW / vw;
  const contentH = (vh || vw * 0.62) * k;
  const totalH = contentH + chromeH * (w / 940) + 16;
  const px = x === null ? (W - w) / 2 : x;
  const chrome = chromeH * (w / 940);
  ctx.save();
  ctx.globalAlpha *= clamp(p) * clamp(e * 1.3);
  ctx.translate(px + w / 2, y + totalH / 2 + (1 - e) * 70);
  ctx.scale(0.96 + 0.04 * e, 0.96 + 0.04 * e);
  ctx.translate(-w / 2, -totalH / 2);
  if (glow) glowOrb(ctx, w / 2, totalH * 0.5, w * 0.8, glow, 0.16);
  groundShadow(ctx, w / 2, totalH + 20, w * 0.62, { tone, a: 0.5, ry: w * 0.05 });
  shadow(ctx, dark ? 'rgba(0,0,0,0.75)' : 'rgba(60,44,20,0.34)', 64, 26);
  fillRR(ctx, 0, 0, w, totalH, 20, dark ? '#0B1120' : '#FFFFFF');
  noShadow(ctx);
  strokeRR(ctx, 0, 0, w, totalH, 20, dark ? 'rgba(150,185,255,0.28)' : 'rgba(20,23,29,0.10)', 1.4);
  // chrome bar
  ['#FF6B6B', '#FFC466', '#35D3A0'].forEach((c, i) => circle(ctx, 20 + i * 18, chrome / 2 + 4, 5, alpha(c, 0.9)));
  const upad = 0.24;
  fillRR(ctx, w * upad, chrome * 0.26, w * (1 - upad * 2), chrome * 0.48, 6, dark ? 'rgba(255,255,255,0.08)' : 'rgba(20,23,29,0.05)');
  text(ctx, url, w / 2, chrome * 0.62, { size: Math.max(10, chrome * 0.3), weight: 600, color: dark ? 'rgba(226,236,255,0.72)' : 'rgba(20,23,29,0.55)', align: 'center' });
  // screen
  ctx.save();
  rr(ctx, 8, chrome + 8, innerW, contentH, 12);
  ctx.clip();
  ctx.translate(8, chrome + 8);
  ctx.scale(k, k);
  draw(vw, (vh || vw * 0.62));
  ctx.restore();
  ctx.restore();
  return { x: px, y, w, h: totalH, screen: { x: px + 8, y: y + chrome + 8, w: innerW, h: contentH, k } };
}

/* ------------------------------------------------------------------ atoms */
/** Floating pill label (glass) with icon dot. */
export function pill(ctx, x, y, label, {
  tone = 'dark', iconName = null, color = null, p = 1, size = 24, align = 'left', h = 56, pad = 22,
} = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.font = fontStr(size, 600, label);
  const tw = ctx.measureText(label).width;
  const iw = iconName ? size * 1.25 : 0;
  const w = tw + pad * 2 + iw + (iconName ? 10 : 0);
  let bx = x;
  if (align === 'center') bx = x - w / 2;
  else if (align === 'right') bx = x - w;
  if (tone === 'light') {
    lightCard(ctx, bx, y - h / 2, w, h, { r: h / 2, lift: 0.8 });
  } else {
    glassCard(ctx, bx, y - h / 2, w, h, { r: h / 2, fill: 'rgba(14,22,38,0.72)' });
  }
  let tx = bx + pad;
  if (iconName) {
    icon(ctx, iconName, tx, y - size * 0.5, size, color || (tone === 'light' ? d.goldDeep : d.cyan), 1.9);
    tx += iw + 10;
  }
  text(ctx, label, tx, y + size * 0.36, { size, weight: 600, color: color || (tone === 'light' ? d.ink : 'rgba(240,246,255,0.92)') });
  ctx.restore();
  return { x: bx, y: y - h / 2, w, h };
}

/** Callout: dot at (x,y) + leader line + label card. */
export function callout(ctx, x, y, label, t, {
  dx = 120, dy = -80, tone = 'dark', delay = 0, size = 22, align = 'left', sub = null,
} = {}) {
  const p = beat(t, delay, 0.6, easeOutQuint);
  if (p <= 0.01) return;
  const d = tone === 'light' ? P.light : P.dark;
  const ex = x + dx * p;
  const ey = y + dy * p;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  // leader
  ctx.strokeStyle = tone === 'light' ? alpha(d.goldDeep, 0.55) : alpha(d.cyan, 0.5);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.lineTo(ex + (align === 'left' ? 34 : -34), ey);
  ctx.stroke();
  // source dot with ring
  circle(ctx, x, y, 5, tone === 'light' ? d.goldDeep : d.cyan);
  ctx.strokeStyle = tone === 'light' ? alpha(d.goldDeep, 0.5) : alpha(d.cyan, 0.45);
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x, y, 11 + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.stroke();
  // label
  ctx.font = fontStr(size, 600, label);
  const tw = ctx.measureText(label).width;
  const subH = sub ? size * 1.5 : 0;
  const bw = tw + 34;
  const bh = size + 24 + subH;
  const bx = align === 'left' ? ex + 34 : ex - 34 - bw;
  const by = ey - bh / 2;
  if (tone === 'light') lightCard(ctx, bx, by, bw, bh, { r: 14, lift: 0.9 });
  else glassCard(ctx, bx, by, bw, bh, { r: 14, fill: 'rgba(12,20,36,0.86)' });
  text(ctx, label, bx + 17, by + size + 4, { size, weight: 600, color: tone === 'light' ? d.ink : d.ink });
  if (sub) text(ctx, sub, bx + 17, by + size + 4 + subH * 0.8, { size: size * 0.82, weight: 500, color: d.muted });
  ctx.restore();
}

/** Mouse cursor with a tap ring. p = 0..1 reveal, tap at `tapAt` seconds. */
export function cursor(ctx, x, y, p = 1, { tapP = 0, tone = 'light', scale = 1 } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (tapP > 0 && tapP < 1) {
    ctx.strokeStyle = tone === 'light' ? `rgba(47,111,237,${0.5 * (1 - tapP)})` : `rgba(79,216,255,${0.55 * (1 - tapP)})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(2, 2, 10 + 34 * tapP, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = tone === 'light' ? `rgba(47,111,237,${0.16 * (1 - tapP)})` : `rgba(79,216,255,${0.18 * (1 - tapP)})`;
    ctx.beginPath(); ctx.arc(2, 2, 10 + 34 * tapP, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#0B1220';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineTo(7, 19); ctx.lineTo(12, 30); ctx.lineTo(17, 28);
  ctx.lineTo(12, 17); ctx.lineTo(20, 16); ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(2, 3); ctx.lineTo(2, 22); ctx.lineTo(7, 16.5); ctx.lineTo(11.6, 26.4); ctx.lineTo(14.6, 25.2);
  ctx.lineTo(10, 15.4); ctx.lineTo(16.6, 14.6); ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Notification card sliding in. */
export function notifyCard(ctx, x, y, w, t, { title, body, iconName = 'bell', delay = 0, tone = 'dark', accent = null, align = 'left' } = {}) {
  const p = beat(t, delay, 0.6, easeOutQuint);
  if (p <= 0.01) return;
  const d = tone === 'light' ? P.light : P.dark;
  const h = 96;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.translate(0, (1 - p) * -26);
  if (tone === 'light') {
    shadow(ctx, 'rgba(74,56,28,0.18)', 36, 14);
    fillRR(ctx, x, y, w, h, 20, '#FFFFFF');
    noShadow(ctx);
    strokeRR(ctx, x, y, w, h, 20, 'rgba(20,23,29,0.08)', 1.2);
  } else {
    glassCard(ctx, x, y, w, h, { r: 20, fill: 'rgba(16,25,44,0.88)' });
  }
  const ac = accent || (tone === 'light' ? d.blue : d.cyan);
  fillRR(ctx, x + 18, y + h / 2 - 20, 40, 40, 12, alpha(ac, 0.16));
  icon(ctx, iconName, x + 27, y + h / 2 - 11, 22, ac, 2);
  text(ctx, title, x + 74, y + 40, { size: 24, weight: 700, color: tone === 'light' ? d.ink : d.ink });
  text(ctx, body, x + 74, y + 70, { size: 20, weight: 500, color: d.muted, maxWidth: w - 100 });
  ctx.restore();
}

/** KPI tile with counting value. */
export function kpiTile(ctx, x, y, w, h, t, { label, value, suffix = '', delta, tone = 'dark', delay = 0, iconName = 'chart', accent = null, pv = 1 } = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  const p = beat(t, delay, 0.6, easeOutQuint);
  if (p <= 0.01) return;
  const ac = accent || (tone === 'light' ? d.blue : d.cyan);
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.translate(0, (1 - p) * 18);
  if (tone === 'light') lightCard(ctx, x, y, w, h, { r: 20, lift: 0.75 });
  else glassCard(ctx, x, y, w, h, { r: 20, fill: 'rgba(13,21,38,0.62)' });
  fillRR(ctx, x + 16, y + 16, 34, 34, 10, alpha(ac, 0.15));
  icon(ctx, iconName, x + 24, y + 23, 18, ac, 2);
  text(ctx, label, x + 16, y + 78, { size: 18, weight: 500, color: d.muted, maxWidth: w - 32 });
  const shown = Math.round(value * clamp(pv));
  text(ctx, `${shown.toLocaleString('en-US')}${suffix}`, x + 16, y + h - 18, { size: 38, weight: 800, color: d.ink });
  if (delta) {
    const up = !String(delta).startsWith('-');
    text(ctx, delta, x + w - 16, y + h - 20, { size: 18, weight: 700, color: up ? (tone === 'light' ? '#1E9E74' : '#4FE0B0') : (tone === 'light' ? '#C8503F' : '#FF7A8C'), align: 'right' });
  }
  ctx.restore();
}

/** Step chain (horizontal or vertical) with a traveling pulse. */
export function chain(ctx, x, y, w, items, t, {
  tone = 'dark', delay = 0.1, gap = 0.28, dir = 'h', p = 1, accent = null, size = 21, itemH = 76,
} = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  const ac = accent || (tone === 'light' ? d.goldDeep : d.cyan);
  const n = items.length;
  const cellW = dir === 'h' ? (w - gap * (n - 1)) / n : w;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  let active = -1;
  const span = n * 0.85;
  const phase = (t % span) / span;
  if (t > 0.4) active = Math.min(n - 1, Math.floor(phase * n));
  items.forEach((item, i) => {
    const ap = beat(t, delay + i * 0.14, 0.55, easeOutQuint);
    if (ap <= 0.01) return;
    const ix = dir === 'h' ? x + i * (cellW + gap) : x;
    const iy = dir === 'h' ? y : y + i * (itemH + gap * 60);
    const isOn = i <= active;
    ctx.save();
    ctx.globalAlpha *= clamp(ap);
    ctx.translate(0, (1 - ap) * 22);
    if (tone === 'light') lightCard(ctx, ix, iy, cellW, itemH, { r: 18, lift: isOn ? 0.9 : 0.5 });
    else glassCard(ctx, ix, iy, cellW, itemH, { r: 18, fill: isOn ? 'rgba(20,38,66,0.85)' : 'rgba(13,21,38,0.55)', glow: isOn ? ac : null });
    // icon or numeral
    fillRR(ctx, ix + 14, iy + itemH / 2 - 15, 30, 30, 9, alpha(ac, isOn ? 0.22 : 0.12));
    if (item.icon) icon(ctx, item.icon, ix + 21, iy + itemH / 2 - 8, 16, ac, 2);
    else text(ctx, String(i + 1), ix + 29, iy + itemH / 2 + 7, { size: 18, weight: 800, color: ac, align: 'center' });
    text(ctx, item.label, ix + 54, iy + itemH / 2 + 8, { size, weight: 600, color: tone === 'light' ? d.ink : d.ink, maxWidth: cellW - 66 });
    ctx.restore();
  });
  // connectors
  ctx.strokeStyle = alpha(ac, 0.3);
  ctx.lineWidth = 2;
  for (let i = 0; i < n - 1; i++) {
    if (dir === 'h') {
      const cx0 = x + (i + 1) * cellW + i * gap;
      dashLine(ctx, cx0, y + itemH / 2, cx0 + gap, y + itemH / 2, alpha(ac, 0.5), 2, [3, 5], beat(t, delay + i * 0.1 + 0.2, 0.4));
    }
  }
  ctx.restore();
}

/** Big chapter numeral + title. */
export function chapterCard(ctx, t, { n, title, sub, tone = 'dark', accent = null, p = 1 }) {
  const d = tone === 'light' ? P.light : P.dark;
  const ac = accent || (tone === 'light' ? d.gold : d.cyan);
  const e = easeOutQuint(clamp(p));
  ctx.save();
  ctx.globalAlpha *= e;
  glowOrb(ctx, W / 2, H * 0.44, 640, ac, tone === 'light' ? 0.16 : 0.24);
  const num = String(n).padStart(2, '0');
  const enter = (1 - e) * 40;
  text(ctx, num, W / 2, 780 + enter, { size: 250, weight: 800, color: alpha(tone === 'light' ? d.gold : ac, 0.2), align: 'center', letterSpacing: -6 });
  const lines = String(title).split('\n');
  const size = lines.length > 1 ? 86 : 100;
  let y = 900;
  lines.forEach((ln, i) => {
    const lp = beat(t, 0.15 + i * 0.12, 0.7, easeOutQuint);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y - size, W, size * 1.35 * lp);
    ctx.clip();
    text(ctx, ln, W / 2, y + (1 - lp) * 24, { size, weight: 700, color: d.ink, align: 'center', maxWidth: 900 });
    ctx.restore();
    y += size * 1.2;
  });
  if (sub) {
    const sp = beat(t, 0.4, 0.7, easeOut);
    text(ctx, sub, W / 2, y + 16, { size: 32, weight: 500, color: d.muted, align: 'center', maxWidth: 860, opacity: sp });
  }
  fillRR(ctx, W / 2 - 42 * e, y + 52, 84 * e, 3, 1.5, alpha(ac, 0.8));
  ctx.restore();
}

/** Small live "ডেমো" ribbon so illustrative data is always labelled. */
export function demoRibbon(ctx, t, tone = 'light', p = 0.75) {
  const d = tone === 'light' ? P.light : P.dark;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.font = fontStr(19, 600, 'ডেমো');
  const w = ctx.measureText('ডেমো').width + 40;
  const x = LAY.right - w;
  const y = 176;
  if (tone === 'light') {
    fillRR(ctx, x, y, w, 34, 17, 'rgba(20,23,29,0.055)');
    text(ctx, 'ডেমো', x + 20, y + 23, { size: 19, weight: 600, color: alpha(d.ink, 0.55) });
  } else {
    fillRR(ctx, x, y, w, 34, 17, 'rgba(255,255,255,0.07)');
    text(ctx, 'ডেমো', x + 20, y + 23, { size: 19, weight: 600, color: 'rgba(255,255,255,0.6)' });
  }
  ctx.restore();
}

/** Price lockup: ৳3,000 with optional cross-through old price. */
export function priceHero(ctx, t, {
  cx = W / 2, y = 1000, size = 210, label = null, tone = 'dark', delay = 0, sub = null,
  accentA = null, accentB = null, p = 1, oldPrice = null,
} = {}) {
  const e = easeOutQuint(clamp(p));
  const d = tone === 'light' ? P.light : P.dark;
  ctx.save();
  ctx.globalAlpha *= clamp(e * 1.2);
  ctx.font = `700 ${Math.round(size * 0.5)}px 'BN', Inter`;
  const sw = ctx.measureText('৳').width;
  ctx.font = `800 ${Math.round(size)}px 'BN', Inter`;
  const dw = ctx.measureText('৩,০০০').width;
  const gap = size * 0.045;
  const total = sw + gap + dw;
  const x0 = cx - total / 2;
  const g = lin(ctx, x0, y - size, x0 + total * 0.9, y, [
    [0, accentA || (tone === 'light' ? '#1A1D24' : '#FFFFFF')],
    [0.6, accentB || (tone === 'light' ? d.goldDeep : '#DDEBFF')],
    [1, accentB || d.cyan],
  ]);
  const scale = 0.94 + 0.06 * e;
  ctx.translate(cx, y);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -y);
  text(ctx, '৳', x0, y, { size: size * 0.5, weight: 700, color: accentB || d.cyan });
  text(ctx, '৩,০০০', x0 + sw + gap, y, { size, weight: 800, color: g, letterSpacing: -2 });
  if (oldPrice) {
    ctx.font = `600 ${Math.round(size * 0.24)}px 'BN', Inter`;
    const ow = ctx.measureText(oldPrice).width;
    const ox = cx - ow / 2;
    text(ctx, oldPrice, ox, y + size * 0.42, { size: size * 0.24, weight: 600, color: alpha(d.muted, 0.7) });
    ctx.strokeStyle = alpha(d.muted, 0.7);
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ox - 4, y + size * 0.34); ctx.lineTo(ox + ow + 4, y + size * 0.34); ctx.stroke();
  }
  ctx.restore();
  if (label) pill(ctx, cx, y - size * 0.86, label, { tone, align: 'center', p: beat(t, delay, 0.6, easeOutBack), size: 24 });
  if (sub) text(ctx, sub, cx, y + size * 0.62, { size: 34, weight: 500, color: d.ink2, align: 'center', maxWidth: 900, opacity: beat(t, delay + 0.3, 0.6) });
  return { w: total, x: x0, y };
}

/** Check / cross seal. */
export function seal(ctx, x, y, r, kind, p = 1, { tone = 'dark' } = {}) {
  if (p <= 0.01) return;
  const e = easeOutBack(clamp(p));
  const ok = kind !== 'no';
  const col = ok ? (tone === 'light' ? '#1E9E74' : '#41E0A6') : (tone === 'light' ? '#C8503F' : '#FF7A8C');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(e, e);
  glowOrb(ctx, 0, 0, r * 2.4, col, 0.22);
  circle(ctx, 0, 0, r, alpha(col, 0.14));
  ctx.strokeStyle = alpha(col, 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = col;
  ctx.lineWidth = r * 0.13;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (ok) {
    ctx.moveTo(-r * 0.34, r * 0.02);
    ctx.lineTo(-r * 0.08, r * 0.28);
    ctx.lineTo(r * 0.36, -r * 0.28);
  } else {
    ctx.moveTo(-r * 0.3, -r * 0.3); ctx.lineTo(r * 0.3, r * 0.3);
    ctx.moveTo(r * 0.3, -r * 0.3); ctx.lineTo(-r * 0.3, r * 0.3);
  }
  ctx.stroke();
  ctx.restore();
}

/** Big soft numeral behind content. */
export function ghostNumeral(ctx, str, x, y, size, color, op = 0.14) {
  text(ctx, str, x, y, { size, weight: 800, color: alpha(color, op), align: 'center', letterSpacing: -6 });
}

/** Feature grid card. */
export function featureTile(ctx, x, y, w, h, t, {
  iconName, title, sub = null, tone = 'dark', delay = 0, accent = null, p = 1, hot = false,
} = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  const ap = beat(t, delay, 0.6, easeOutQuint);
  if (ap <= 0.01) return;
  const ac = accent || (tone === 'light' ? d.goldDeep : d.cyan);
  ctx.save();
  ctx.globalAlpha *= clamp(ap) * clamp(p);
  ctx.translate(0, (1 - ap) * 26);
  if (tone === 'light') {
    lightCard(ctx, x, y, w, h, { r: 24, lift: hot ? 1.15 : 0.7 });
  } else {
    glassCard(ctx, x, y, w, h, { r: 24, fill: hot ? 'rgba(24,44,76,0.8)' : 'rgba(13,21,38,0.6)', glow: hot ? ac : null });
  }
  fillRR(ctx, x + 22, y + 22, 48, 48, 14, alpha(ac, tone === 'light' ? 0.12 : 0.16));
  icon(ctx, iconName, x + 34, y + 34, 24, ac, 1.9);
  text(ctx, title, x + 22, y + h - 34, { size: 27, weight: 700, color: d.ink, maxWidth: w - 40 });
  if (sub) text(ctx, sub, x + 22, y + h - 34 + 26, { size: 19, weight: 500, color: d.muted, maxWidth: w - 40 });
  ctx.restore();
}

/** Progress rail used at the very top of every frame. */
export function progressRail(ctx, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, 0, W, 3);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#4FD8FF');
  g.addColorStop(1, '#E3B87C');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W * clamp(p), 3);
  ctx.restore();
}

/** Persistent brand mark, top right. */
export function brandTag(ctx, tone = 'dark', op = 1) {
  const col = tone === 'light' ? 'rgba(20,23,29,0.55)' : 'rgba(226,238,255,0.72)';
  ctx.save();
  ctx.globalAlpha *= op;
  brandMark(ctx, LAY.right - 150, 176, 22, { withWordmark: false, color: tone === 'light' ? 'rgba(20,23,29,0.6)' : 'rgba(200,220,255,0.85)' });
  text(ctx, 'CODEPIXEL', LAY.right - 118, 190, { size: 18, weight: 600, color: col, letterSpacing: 3.2 });
  ctx.restore();
}

/** Standard scene title (kicker + headline) from the timeline plan. */
export function stdTitle(ctx, t, scene, {
  tone = scene.tone || 'dark', y = LAY.titleY, size = null, kickerY = LAY.kickerY,
  kicker = true, delay = 0.05, align = 'left', x = LAY.x, accentTo = null, maxWidth = LAY.w,
} = {}) {
  const lines = scene.headline ? String(scene.headline).split('\n') : [];
  const n = Math.max(1, lines.length);
  const auto = n >= 3 ? 78 : n === 2 ? 88 : 96;
  if (kicker && scene.kicker) kickerLine(ctx, scene.kicker, t, { tone, y: kickerY, delay, x, align });
  if (lines.length) {
    headlineBlock(ctx, scene.headline, t, {
      tone, x, y, size: size || scene.titleSize || auto, align, maxWidth,
      delay: delay + 0.06, stagger: 0.1, accentTo,
    });
  }
  return y + n * (size || scene.titleSize || auto) * 1.16;
}

/**
 * Sequenced screen player for a phone screen. steps: [{ at, draw(ctx,w,h) }]
 * Crossfades with a small slide, clipped by the device frame.
 */
export function screenSwitch(ctx, t, w, h, steps) {
  let idx = 0;
  for (let i = 0; i < steps.length; i++) if (t >= steps[i].at) idx = i;
  const cur = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  const p = idx === 0 ? 1 : clamp((t - cur.at) / 0.45);
  const e = easeOutQuint(p);
  if (idx > 0 && p < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - e;
    ctx.translate(-w * e * 0.16, 0);
    prev.draw(ctx, w, h);
    ctx.restore();
  }
  ctx.save();
  if (idx > 0) ctx.translate(w * (1 - e) * 0.18, 0);
  ctx.globalAlpha *= idx === 0 ? 1 : e;
  cur.draw(ctx, w, h);
  ctx.restore();
}

/** Timeline stepper used by process scenes (5 steps max, horizontal). */
export function stepper(ctx, x, y, w, items, t, { tone = 'light', delay = 0.2, accent = null, current = null, size = 20 } = {}) {
  const d = tone === 'light' ? P.light : P.dark;
  const ac = accent || (tone === 'light' ? d.goldDeep : d.cyan);
  const n = items.length;
  const gap = w / (n - 1);
  const active = current === null ? Math.min(n - 1, Math.floor(clamp((t - delay) / (n * 0.75)) * n)) : current;
  ctx.save();
  // rail
  ctx.strokeStyle = tone === 'light' ? 'rgba(20,23,29,0.12)' : 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  const lit = clamp(active / Math.max(1, n - 1));
  ctx.strokeStyle = ac;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * lit, y); ctx.stroke();
  items.forEach((label, i) => {
    const p = beat(t, delay + i * 0.12, 0.5, easeOutQuint);
    if (p <= 0.01) return;
    const cx = x + i * gap;
    const on = i <= active;
    ctx.save();
    ctx.globalAlpha *= clamp(p);
    circle(ctx, cx, y, on ? 15 : 11, on ? ac : (tone === 'light' ? '#FFFFFF' : '#101A2C'));
    if (!on) {
      ctx.strokeStyle = tone === 'light' ? 'rgba(20,23,29,0.2)' : 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, y, 11, 0, Math.PI * 2); ctx.stroke();
    }
    if (on) {
      ctx.strokeStyle = ac; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 5, y + 0.5); ctx.lineTo(cx - 1.5, y + 4); ctx.lineTo(cx + 5.5, y - 3.5); ctx.stroke();
    }
    text(ctx, label, cx, y + 46, { size, weight: on ? 700 : 500, color: on ? d.ink : d.muted, align: 'center', maxWidth: gap * 0.94 });
    ctx.restore();
  });
  ctx.restore();
}
