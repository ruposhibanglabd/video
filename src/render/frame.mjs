/** Scene registry + frame compositor + schedule math. */
import { createCanvas, PLATFORM_READY } from './platform.mjs';
export { PLATFORM_READY };
import {
  W, H, C, clamp, lerp, easeIn, easeOut, easeInOut, easeOutQuint, alpha, cinematicBG,
  grain, vignette, glowOrb, text, lin, fillRR, circle,
} from './kit.mjs';
import { SCENES, BRAND } from '../scenes/timeline.mjs';
import { kicker, headline, L } from '../scenes/stage.mjs';
import { openScenes } from '../scenes/open.mjs';
import { featureScenes } from '../scenes/features.mjs';
import { orderScenes } from '../scenes/orders.mjs';
import { operationsScenes } from '../scenes/operations.mjs';
import { closingScenes } from '../scenes/closing.mjs';
import { premiumScenes } from '../scenes/premium.mjs';

export const FPS = 30;
export const REGISTRY = { ...openScenes, ...featureScenes, ...orderScenes, ...operationsScenes, ...closingScenes, ...premiumScenes };

/* ------------------------------------------------------------------ schedule */
/** Approximate spoken-time weight from the exact narration stored per scene. */
export function narrationWeight(value = '') {
  const narration = String(value);
  const bengaliLetters = (narration.match(/[\u0985-\u09B9\u09DC-\u09DF\u09F0-\u09FF]/g) || []).length;
  const vowelMarks = (narration.match(/[\u09BE-\u09CC\u09D7]/g) || []).length;
  const latinWords = narration.match(/[A-Za-z0-9]+/g) || [];
  const latinWeight = latinWords.reduce((sum, word) => sum + Math.max(1, Math.round(word.length * 0.55)), 0);
  return Math.max(1, bengaliLetters + vowelMarks + latinWeight);
}

function alignBoundaries(expected, snapPoints, { snapWindow, minScene }) {
  let states = [{ time: 0, cost: 0, path: [] }];
  for (const target of expected) {
    const options = [{ time: target, cost: 1.8 }];
    for (const point of snapPoints) {
      if (Math.abs(point - target) <= snapWindow) {
        options.push({ time: point, cost: ((point - target) / 1.8) ** 2 });
      }
    }
    // Duplicate timestamps can arise from the no-snap option and a pause.
    const unique = new Map();
    for (const option of options) {
      const key = option.time.toFixed(4);
      const prev = unique.get(key);
      if (!prev || option.cost < prev.cost) unique.set(key, option);
    }
    const next = [];
    for (const option of unique.values()) {
      let best = null;
      for (const state of states) {
        if (option.time - state.time < minScene) continue;
        const cost = state.cost + option.cost;
        if (!best || cost < best.cost) best = { time: option.time, cost, path: [...state.path, option.time] };
      }
      if (best) next.push(best);
    }
    states = next;
    if (!states.length) break;
  }
  if (states.length) return states.reduce((a, b) => a.cost <= b.cost ? a : b).path;
  return expected;
}

/**
 * Align scene cuts to the supplied voice: each cut is first estimated from the
 * narration's spoken-text weight, then globally matched to a nearby detected
 * pause. This avoids the large drift caused by stretching hand-timed scene
 * estimates uniformly over an eight-minute file.
 */
export function buildSchedule(duration, { snapPoints = [], snapWindow = 2.3, minScene = 0.75 } = {}) {
  const weights = SCENES.map((scene) => narrationWeight(scene.narration));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const pauseAllowance = Math.min(0.16 * (SCENES.length - 1), duration * 0.025);
  const spokenDuration = Math.max(0, duration - pauseAllowance);
  let elapsedWeight = 0;
  const expected = [];
  for (let i = 0; i < SCENES.length - 1; i++) {
    elapsedWeight += weights[i];
    expected.push(spokenDuration * elapsedWeight / totalWeight + pauseAllowance * (i + 1) / (SCENES.length - 1));
  }
  const aligned = alignBoundaries(expected, snapPoints, { snapWindow, minScene });
  const boundaries = SCENES.map((scene, i) => ({
    ...scene,
    start: i === 0 ? 0 : aligned[i - 1],
    end: i === SCENES.length - 1 ? duration : aligned[i],
    timingWeight: weights[i],
  }));

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
  return { scenes: boundaries, totalFrames, duration, fps: FPS, alignment: 'narration-weighted + detected pauses' };
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
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // base cinematic background (drifting, deterministic)
    cinematicBG(ctx, frame / this.fps, { w: this.width, h: this.height });

    const style = scene.transition || 'fade';
    const inDur = style === 'snap' ? 0.10 : style === 'hold' ? 0 : style === 'wipe' ? 0.32 : 0.30;
    const blend = inDur > 0 ? clamp(t / inDur) : 1;

    if (prev && blend < 1) {
      const prevDur = Math.max(0.001, (prev.f1 - prev.f0) / this.fps);
      ctx.save();
      ctx.globalAlpha = 1 - easeOut(blend) * 0.95;
      this.drawSceneBody(ctx, prev, Math.max(0, prevDur - 0.001), prevDur);
      ctx.restore();
    }

    ctx.save();
    if (prev && style === 'push') {
      const e = easeOut(blend);
      ctx.globalAlpha = e;
      ctx.translate((1 - e) * this.width * 0.06, 0);
    } else if (prev && style === 'snap') {
      ctx.globalAlpha = blend;
    } else if (prev) {
      ctx.globalAlpha = easeOutQuint(blend);
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

    // film finish
    grain(ctx, 0.035, this.width, this.height);
    vignette(ctx, this.width, this.height, 0.34);
    ctx.restore();
    return this.canvas;
  }
}

export { BRAND };
