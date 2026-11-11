/**
 * Motion design v2 — the "furniture" that makes 77 beats feel like one film.
 *
 *  • CHAPTERS      information architecture (6 chapters over the 77 scenes)
 *  • storyRail     story-style segmented progress at the top of the frame
 *  • ambientLayer  slow, voice-reactive background life that differs per chapter
 *  • bengali()     Bengali numerals for on-screen counters
 *
 * Everything here is a pure function of (time, scene) → deterministic frames.
 */
import {
  C, W, alpha, clamp, lerp, easeOut, easeInOut, easeOutQuint, lin, fillRR, glowOrb, text, circle,
} from './kit.mjs';
import { voiceSmooth, voiceOnset } from './voice.mjs';

/* --------------------------------------------------------------- chapters */
export const CHAPTERS = [
  { i: 1, name: 'পরিচিতি', from: 1, to: 13, accent: C.cyan },
  { i: 2, name: 'ওয়েবসাইট', from: 14, to: 26, accent: C.blue },
  { i: 3, name: 'অর্ডার', from: 27, to: 38, accent: C.violet },
  { i: 4, name: 'মার্কেটিং', from: 39, to: 43, accent: '#3FB9FF' },
  { i: 5, name: 'কুরিয়ার', from: 44, to: 48, accent: '#4FD1C5' },
  { i: 6, name: 'নিরাপত্তা', from: 49, to: 51, accent: '#FF8FA3' },
  { i: 7, name: 'পেমেন্ট', from: 52, to: 62, accent: C.green },
  { i: 8, name: 'অফার', from: 63, to: 77, accent: C.gold },
];

export function chapterOf(sceneN) {
  for (const ch of CHAPTERS) if (sceneN >= ch.from && sceneN <= ch.to) return ch;
  return CHAPTERS[CHAPTERS.length - 1];
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const bengali = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);

/* ------------------------------------------------------------- story rail */
const RAIL = { x0: 76, x1: 1004, y: 150, h: 4, gap: 9 };

function chapterSpans(schedule) {
  const total = schedule.duration || 1;
  const spans = CHAPTERS.map((ch) => {
    let a = Infinity, b = -Infinity;
    for (const s of schedule.scenes) {
      if (s.n >= ch.from && s.n <= ch.to) {
        a = Math.min(a, s.f0);
        b = Math.max(b, s.f1);
      }
    }
    if (!isFinite(a)) { a = 0; b = 0; }
    return { ...ch, t0: a / 30, t1: b / 30 };
  });
  // guard against empty chapters
  let cursor = 0;
  spans.forEach((s) => {
    if (s.t1 <= s.t0) { s.t0 = cursor; s.t1 = cursor + total * 0.02; }
    cursor = s.t1;
  });
  return spans;
}

const spanCache = new WeakMap();
function spansFor(schedule) {
  let v = spanCache.get(schedule);
  if (!v) { v = chapterSpans(schedule); spanCache.set(schedule, v); }
  return v;
}

/**
 * Story-style segmented progress. Native to Reels/Stories: the viewer instantly
 * understands "we are partway through chapter 3 of 6".
 */
export function storyRail(ctx, schedule, scene, tAbs, { opacity = 1 } = {}) {
  if (opacity <= 0.01) return;
  const spans = spansFor(schedule);
  const gaps = (spans.length - 1) * RAIL.gap;
  const usable = RAIL.x1 - RAIL.x0 - gaps;
  const total = spans.reduce((s, c) => s + (c.t1 - c.t0), 0) || 1;
  const active = chapterOf(scene.n);
  const level = voiceSmooth(tAbs, 0.28);

  ctx.save();
  ctx.globalAlpha *= opacity;

  // chapter name + counter
  const chIdx = spans.findIndex((s) => s.i === active.i);
  text(ctx, active.name, RAIL.x0, RAIL.y - 22, {
    size: 20, weight: 600, color: 'rgba(206,222,247,0.78)', letterSpacing: 2.2,
  });
  text(ctx, `${bengali(active.i)} / ${bengali(spans.length)}`, RAIL.x1, RAIL.y - 22, {
    size: 18, weight: 600, color: alpha(active.accent, 0.85), letterSpacing: 2.6, align: 'right',
  });

  let x = RAIL.x0;
  spans.forEach((ch, i) => {
    const w = ((ch.t1 - ch.t0) / total) * usable;
    const isActive = ch.i === active.i;
    const done = i < chIdx;
    const localP = isActive ? clamp((tAbs - ch.t0) / Math.max(0.001, ch.t1 - ch.t0)) : done ? 1 : 0;
    const h = isActive ? RAIL.h + 2.5 : RAIL.h;
    const y = RAIL.y - (h - RAIL.h) / 2;

    // track
    fillRR(ctx, x, y, w, h, h / 2, 'rgba(255,255,255,0.13)');
    // fill
    if (localP > 0.001) {
      const g = lin(ctx, x, 0, x + w, 0, [
        [0, alpha(ch.accent, 0.55)],
        [1, ch.accent],
      ]);
      if (isActive) {
        ctx.save();
        glowOrb(ctx, x + w * localP, y + h / 2, 42, ch.accent, 0.16 + 0.16 * level);
        ctx.restore();
      }
      fillRR(ctx, x, y, Math.max(h, w * localP), h, h / 2, g);
    }
    // leading dot for the active chapter
    if (isActive && localP > 0.02 && localP < 0.995) {
      circle(ctx, x + w * localP, y + h / 2, h * 0.95 + 1.4, alpha('#FFFFFF', 0.88));
    }
    x += w + RAIL.gap;
  });
  ctx.restore();
}

/* ----------------------------------------------------------- ambient life */
const CHAPTER_MOOD = {
  1: { side: -1, tilt: -0.18, rings: 3 },
  2: { side: 1, tilt: 0.14, rings: 2 },
  3: { side: -1, tilt: 0.10, rings: 4 },
  4: { side: 1, tilt: -0.12, rings: 3 },
  5: { side: -1, tilt: 0.20, rings: 2 },
  6: { side: 1, tilt: -0.22, rings: 4 },
  7: { side: -1, tilt: 0.06, rings: 3 },
  8: { side: 1, tilt: 0.02, rings: 5 },
};

/**
 * Slow background life: a drifting aurora lobe, faint concentric arcs and
 * hair-thin diagonal beams. Different bias per chapter so consecutive scenes
 * never feel like the same plate.
 */
export function ambientLayer(ctx, t, { chapter = CHAPTERS[0], seed = 0, strength = 1 } = {}) {
  const mood = CHAPTER_MOOD[chapter.i] || CHAPTER_MOOD[1];
  const level = voiceSmooth(t, 0.4);
  const gx = W * (mood.side < 0 ? 0.16 : 0.84) + Math.sin(t * 0.17 + seed) * 46;
  const gy = 620 + Math.cos(t * 0.13 + seed * 0.7) * 90;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  glowOrb(ctx, gx, gy, 560 + 60 * level, chapter.accent, (0.07 + 0.05 * level) * strength);
  glowOrb(ctx, W - gx, 1450 - gy * 0.3, 460, C.blue, 0.05 * strength);
  ctx.restore();

  // concentric arcs, slowly rotating
  ctx.save();
  ctx.translate(W * 0.5, 1080);
  ctx.rotate(mood.tilt + Math.sin(t * 0.08 + seed) * 0.02);
  ctx.strokeStyle = alpha('#9CC8FF', 0.055 * strength);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < mood.rings; i++) {
    const r = 300 + i * 118 + Math.sin(t * 0.25 + i) * 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, -0.9 + i * 0.2, 0.95 + i * 0.12);
    ctx.stroke();
  }
  ctx.restore();

  // hair-thin travelling beams (very subtle parallax)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const p = ((t * (0.05 + i * 0.012) + i * 0.33) % 1);
    const x = lerp(-200, W + 200, p);
    const g = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
    g.addColorStop(0, 'rgba(120,180,255,0)');
    g.addColorStop(0.5, `rgba(130,190,255,${0.035 * strength})`);
    g.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 90, 0, 180, 1920);
  }
  ctx.restore();
}

/** A single, very light pulse on a stressed syllable (used on key beats). */
export function voicePulse(ctx, t, { cx = W / 2, cy = 1050, color = C.cyan, size = 320 } = {}) {
  const onset = voiceOnset(t);
  if (onset <= 0.02) return 0;
  glowOrb(ctx, cx, cy, size, color, 0.05 + 0.1 * onset);
  return onset;
}

/** Fade wrapper used by the compositor for transitions. */
export function easeOutCubic(t) { return easeOut(t); }
export { easeInOut, easeOutQuint };
