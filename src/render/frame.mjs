/** Scene registry + frame compositor + schedule math. */
import { createCanvas, PLATFORM_READY } from './platform.mjs';
export { PLATFORM_READY };
import {
  W, H, C, clamp, lerp, easeIn, easeOut, easeInOut, easeOutQuint, alpha, cinematicBG,
  grain, vignette, glowOrb, text, lin, fillRR, circle,
} from './kit.mjs';
import { SCENES, BRAND } from '../scenes/timeline.mjs';
import { ambientLayer, storyRail, chapterOf } from './motion.mjs';
import { voiceSmooth } from './voice.mjs';
import { kicker, headline, L } from '../scenes/stage.mjs';
import { openScenes } from '../scenes/open.mjs';
import { featureScenes } from '../scenes/features.mjs';
import { orderScenes } from '../scenes/orders.mjs';
import { operationsScenes } from '../scenes/operations.mjs';
import { closingScenes } from '../scenes/closing.mjs';

export const FPS = 30;
const easeOutQuintSafe = (x) => 1 - Math.pow(1 - clamp(x), 5);
export const REGISTRY = { ...openScenes, ...featureScenes, ...orderScenes, ...operationsScenes, ...closingScenes };

/* ------------------------------------------------------------------ schedule */
/**
 * Build the render schedule from the *measured* audio duration.
 * Boundaries come from the reference plan scaled proportionally; when silence
 * data is available each boundary snaps to the nearest natural pause.
 */
export function buildSchedule(duration, { snapPoints = [], snapWindow = 0.9, minScene = 1.0 } = {}) {
  const scale = duration / 492.356;
  let boundaries = SCENES.map((s, i) => ({
    ...s,
    start: i === 0 ? 0 : s.outStart * scale,
    end: s.outEnd * scale,
  }));
  // smooth proportional boundaries to remove rounding gaps
  for (let i = 0; i < boundaries.length; i++) {
    boundaries[i].start = i === 0 ? 0 : boundaries[i - 1].end;
    if (i === boundaries.length - 1) boundaries[i].end = duration;
  }
  // snap internal boundaries to measured pauses
  if (snapPoints.length) {
    for (let i = 1; i < boundaries.length; i++) {
      const b = boundaries[i].start;
      let best = null;
      for (const p of snapPoints) {
        if (Math.abs(p - b) <= snapWindow && (best === null || Math.abs(p - b) < Math.abs(best - b))) best = p;
      }
      if (best !== null) {
        const minLen = minScene;
        const lower = boundaries[i - 1].start + minLen;
        const upper = boundaries[i].end - minLen;
        boundaries[i].start = Math.min(upper, Math.max(lower, best));
        boundaries[i - 1].end = boundaries[i].start;
      }
    }
  }
  // frames: absolute rounding per boundary (no cumulative drift)
  const totalFrames = Math.max(1, Math.ceil(duration * FPS));
  boundaries.forEach((b) => {
    b.f0 = Math.round(b.start * FPS);
    b.f1 = Math.round(b.end * FPS);
    b.dur = (b.f1 - b.f0) / FPS;
  });
  boundaries[0].f0 = 0;
  boundaries[boundaries.length - 1].f1 = totalFrames;
  // ensure every boundary advances at least 1 frame
  for (let i = 1; i < boundaries.length; i++) {
    if (boundaries[i].f0 <= boundaries[i - 1].f0) boundaries[i].f0 = boundaries[i - 1].f0 + 1;
    if (boundaries[i].f1 <= boundaries[i].f0) boundaries[i].f1 = boundaries[i].f0 + 1;
  }
  boundaries[boundaries.length - 1].f1 = totalFrames;
  return { scenes: boundaries, totalFrames, duration, fps: FPS };
}

export function frameToScene(schedule, frame) {
  const { scenes } = schedule;
  let lo = 0, hi = scenes.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (scenes[mid].f0 <= frame) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/* ------------------------------------------------------------------ compositor */
export class Compositor {
  constructor({ width = W, height = H, fps = FPS, preview = false } = {}) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.preview = preview;
    this.warned = new Set();
  }

  sceneTime(schedule, frame) {
    const idx = frameToScene(schedule, frame);
    const s = schedule.scenes[idx];
    const t = frame / this.fps - s.f0 / this.fps;
    return { idx, scene: s, t: Math.max(0, t), dur: Math.max(0.001, (s.f1 - s.f0) / this.fps) };
  }

  drawSceneBody(ctx, scene, t, dur) {
    const fn = REGISTRY[scene.kind];
    if (!fn) {
      if (!this.warned.has(scene.kind)) {
        this.warned.add(scene.kind);
        console.warn(`[warn] missing scene renderer: ${scene.kind}`);
      }
      return false;
    }
    // subtle camera push for every scene (keeps text inside safe area)
    const cam = 1.015 + 0.028 * easeInOut(clamp(t / dur));
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam, cam);
    ctx.translate(-this.width / 2, -this.height / 2);
    if (scene.title !== false) {
      kicker(ctx, scene.kicker, t, { delay: 0.04, y: scene.kickerY || L.kickerY });
      if (scene.headline) {
        headline(ctx, scene.headline, t, {
          size: scene.titleSize || 84,
          y: scene.titleY || L.titleY,
          delay: 0.02,
          stagger: 0.10,
        });
      }
    }
    fn(ctx, t, dur, scene);
    ctx.restore();
    return true;
  }

  drawFrame(schedule, frame) {
    const ctx = this.ctx;
    const { idx, scene, t, dur } = this.sceneTime(schedule, frame);
    const prev = schedule.scenes[idx - 1];
    const tAbs = frame / this.fps;
    const chapter = chapterOf(scene.n);
    const level = voiceSmooth(tAbs, 0.4);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // base cinematic background (drifting, deterministic)
    cinematicBG(ctx, tAbs, { w: this.width, h: this.height });
    // slow, chapter-specific ambient life — reacts gently to the voice
    ambientLayer(ctx, tAbs, { chapter, seed: idx * 0.37, strength: 1 });

    const style = scene.transition || 'fade';
    const inDur = style === 'snap' ? 0.10
      : style === 'hold' ? 0
      : style === 'whip' ? 0.24
      : style === 'zoom' ? 0.34
      : style === 'wipe' ? 0.32
      : 0.30;
    const blend = inDur > 0 ? clamp(t / inDur) : 1;

    if (prev && blend < 1) {
      const prevDur = Math.max(0.001, (prev.f1 - prev.f0) / this.fps);
      ctx.save();
      if (style === 'zoom') {
        const ez = easeOut(blend);
        ctx.globalAlpha = (1 - ez) * 0.9;
        this.drawScaled(prev, prevDur, 1 + 0.18 * ez);
      } else if (style === 'whip') {
        const ew = easeOut(blend);
        ctx.globalAlpha = 1 - ew;
        ctx.translate(-this.width * 0.22 * ew, 0);
        this.drawSceneBody(ctx, prev, Math.max(0, prevDur - 0.001), prevDur);
      } else {
        ctx.globalAlpha = 1 - easeOut(blend) * 0.95;
        this.drawSceneBody(ctx, prev, Math.max(0, prevDur - 0.001), prevDur);
      }
      ctx.restore();
    }

    ctx.save();
    if (prev && style === 'push') {
      const e = easeOutQuintSafe(blend);
      ctx.globalAlpha = clamp(e * 1.25);
      ctx.translate((1 - e) * this.width * 0.11, 0);
      ctx.scale(1 + (1 - e) * 0.03, 1 + (1 - e) * 0.03);
      ctx.translate(-this.width * (1 - e) * 0.015, -this.height * (1 - e) * 0.01);
    } else if (prev && style === 'whip') {
      const e = easeOutQuintSafe(blend);
      ctx.globalAlpha = clamp(e * 1.3);
      ctx.translate((1 - e) * this.width * 0.55, 0);
    } else if (prev && style === 'zoom') {
      const e = easeOutQuintSafe(blend);
      ctx.globalAlpha = clamp(e * 1.2);
      this.drawScaled(scene, t, 1.1 - 0.1 * e);
      ctx.restore();
      this.finishFrame(ctx, schedule, scene, idx, tAbs, level, style, blend);
      return this.canvas;
    } else if (prev && style === 'snap') {
      ctx.globalAlpha = blend;
    } else if (prev) {
      ctx.globalAlpha = easeOutQuintSafe(blend);
    }
    this.drawSceneBody(ctx, scene, t, dur);
    ctx.restore();

    if (prev && style === 'wipe') {
      const e = easeInOut(blend);
      if (e < 1) {
        ctx.save();
        ctx.fillStyle = '#050912';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width, this.height * (1 - e));
        ctx.lineTo(0, this.height * (1 - e) * 0.86);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    if (prev && style === 'whip' && blend < 1) {
      // speed streaks on the fast horizontal move
      const e = easeOut(blend);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const y = ((i * 137) % this.height);
        const w = this.width * (0.25 + 0.5 * ((i * 53) % 100) / 100);
        const g = ctx.createLinearGradient(this.width * (1 - e) * 1.2 - w, 0, this.width * (1 - e) * 1.2, 0);
        g.addColorStop(0, 'rgba(120,190,255,0)');
        g.addColorStop(0.85, `rgba(150,205,255,${0.10 * (1 - e)})`);
        g.addColorStop(1, 'rgba(120,190,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(this.width * (1 - e) * 1.2 - w, y, w, 2);
      }
      ctx.restore();
    }

    this.finishFrame(ctx, schedule, scene, idx, tAbs, level, style, blend);
    return this.canvas;
  }

  /** Draw a scene body with an extra uniform scale (for the zoom transition). */
  drawScaled(scene, t, scale) {
    const ctx = this.ctx;
    const dur = Math.max(0.001, (scene.f1 - scene.f0) / this.fps);
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -this.height / 2);
    this.drawSceneBody(ctx, scene, t, dur);
    ctx.restore();
  }

  /** Persistent furniture + film finish, drawn above the scene. */
  finishFrame(ctx, schedule, scene, idx, tAbs, level, style, blend) {
    // voice-reactive light bloom along the lower third (very light)
    if (level > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(
        this.width * 0.5, this.height * 0.72, 40,
        this.width * 0.5, this.height * 0.72, 720,
      );
      g.addColorStop(0, `rgba(90,150,255,${0.045 * level})`);
      g.addColorStop(1, 'rgba(90,150,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    // chapter progress — hidden during the hook, fades in with scene 2 and
    // fades out under the final card
    if (scene.n > 1) {
      const railIn = scene.n === 2 ? clamp(tAbs / 2.2) : 1;
      const railOut = scene.n >= 76 ? clamp((schedule.totalFrames / this.fps - tAbs) / 3) : 1;
      storyRail(ctx, schedule, scene, tAbs, { opacity: 0.92 * railIn * railOut });
    }

    // film finish
    grain(ctx, 0.035, this.width, this.height);
    vignette(ctx, this.width, this.height, 0.34);
    ctx.restore();
  }
}

export { BRAND };
