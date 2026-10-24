/**
 * CodePixel Web — Master 11-Scene Compositor & Voiceover-Synchronized Scheduler
 *
 * Runs identically in Node (@napi-rs/canvas → FFmpeg H.264/AAC) and in Browser
 * (<canvas> → WebCodecs + mp4-muxer).
 */
import { createCanvas, PLATFORM_READY } from './platform.mjs';
export { PLATFORM_READY };
import {
  W, H, clamp, easeOut, easeInOut, easeOutQuint, grain, vignette,
} from './kit.mjs';
import { AD_SYNC } from '../scenes/syncData.mjs';
import { AD_SCENES } from '../ad/scenes.mjs';

export const FPS = 30;
export const REGISTRY = AD_SCENES;

export const BRAND = {
  name: 'CodePixel Web',
  price: '৩০০০ টাকা',
  advance: 'কোনো অগ্রিম পেমেন্ট নেই',
  payAfter: 'ডেলিভারির পর পেমেন্ট',
  support: '৩০ দিনের ফ্রি সাপোর্ট',
  site: 'https://codepixelweb.vercel.app/',
  whatsapp: 'https://wa.me/8801876892958',
  phone: '01876892958',
};

/**
 * Build the frame schedule from the measured audio duration.
 * - When rendering the master CodePixel Web voiceover (`~133.87s`), locks every
 *   scene boundary directly to the exact `1 ms` measured timestamps in `AD_SYNC`.
 * - When rendering any custom uploaded voiceover in the browser app, scales all
 *   11 scenes proportionally and snaps internal cuts to detected breath pauses.
 */
export function buildSchedule(duration, { snapPoints = [], snapWindow = 0.7, minScene = 1.8 } = {}) {
  const refDur = AD_SYNC.totalDuration;
  const isExactMaster = Math.abs(duration - refDur) <= 0.4;
  const scale = duration / refDur;

  const boundaries = AD_SYNC.scenes.map((s, i) => ({
    ...s,
    n: i + 1,
    kind: s.id,
    start: i === 0 ? 0 : s.start * scale,
    end: i === AD_SYNC.scenes.length - 1 ? duration : s.end * scale,
  }));

  for (let i = 0; i < boundaries.length; i++) {
    boundaries[i].start = i === 0 ? 0 : boundaries[i - 1].end;
    if (i === boundaries.length - 1) boundaries[i].end = duration;
  }

  if (!isExactMaster && snapPoints.length) {
    for (let i = 1; i < boundaries.length; i++) {
      const b = boundaries[i].start;
      let best = null;
      for (const p of snapPoints) {
        if (Math.abs(p - b) <= snapWindow && (best === null || Math.abs(p - b) < Math.abs(best - b))) {
          best = p;
        }
      }
      if (best !== null) {
        const lower = boundaries[i - 1].start + minScene;
        const upper = boundaries[i].end - minScene;
        if (upper > lower) {
          boundaries[i].start = Math.min(upper, Math.max(lower, best));
          boundaries[i - 1].end = boundaries[i].start;
        }
      }
    }
  }

  const totalFrames = Math.max(1, Math.ceil(duration * FPS));
  boundaries.forEach((b) => {
    b.f0 = Math.round(b.start * FPS);
    b.f1 = Math.round(b.end * FPS);
    b.dur = (b.f1 - b.f0) / FPS;
  });
  boundaries[0].f0 = 0;
  boundaries[boundaries.length - 1].f1 = totalFrames;
  for (let i = 1; i < boundaries.length; i++) {
    if (boundaries[i].f0 <= boundaries[i - 1].f0) boundaries[i].f0 = boundaries[i - 1].f0 + 1;
    if (boundaries[i].f1 <= boundaries[i].f0) boundaries[i].f1 = boundaries[i].f0 + 1;
  }
  boundaries[boundaries.length - 1].f1 = totalFrames;
  boundaries.forEach((b) => { b.dur = (b.f1 - b.f0) / FPS; });

  return { scenes: boundaries, totalFrames, duration, fps: FPS };
}

export function frameToScene(schedule, frame) {
  const { scenes } = schedule;
  let lo = 0;
  let hi = scenes.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (scenes[mid].f0 <= frame) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export class Compositor {
  constructor({ width = W, height = H, fps = FPS, preview = false } = {}) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.preview = preview;
  }

  sceneTime(schedule, frame) {
    const idx = frameToScene(schedule, frame);
    const s = schedule.scenes[idx];
    const t = (frame - s.f0) / this.fps;
    return { idx, scene: s, t: Math.max(0, t), dur: Math.max(0.001, s.dur) };
  }

  drawSceneBody(ctx, scene, t, dur) {
    const fn = REGISTRY[scene.kind];
    if (!fn) return false;
    // Controlled cinema dolly push-in (1.000 -> 1.022) keeping safe margins intact
    const cam = 1.0 + 0.022 * easeInOut(clamp(t / dur));
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam, cam);
    ctx.translate(-this.width / 2, -this.height / 2);
    fn(ctx, t, dur, scene);
    ctx.restore();
    return true;
  }

  drawFrame(schedule, frame) {
    const ctx = this.ctx;
    const { idx, scene, t, dur } = this.sceneTime(schedule, frame);
    const prev = idx > 0 ? schedule.scenes[idx - 1] : null;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const style = scene.transition || 'fade';
    const inDur = !prev || style === 'cut' ? 0 : style === 'wipe' ? 0.42 : style === 'push' ? 0.36 : 0.38;
    const blend = inDur > 0 ? clamp(t / inDur) : 1;

    if (!prev || blend >= 1) {
      this.drawSceneBody(ctx, scene, t, dur);
    } else if (style === 'wipe') {
      // Diagonal optical mask reveal between major acts
      const e = easeInOut(blend);
      this.drawSceneBody(ctx, prev, Math.max(0, prev.dur - 0.001), prev.dur);

      const cutX = -220 + (this.width + 440) * e;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cutX + 180, 0);
      ctx.lineTo(cutX - 180, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.clip();
      this.drawSceneBody(ctx, scene, t, dur);
      ctx.restore();

      // Subtle electric-cyan light edge along wipe boundary
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 217, 255, 0.85)';
      ctx.shadowColor = '#38D9FF';
      ctx.shadowBlur = 28;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cutX + 180, 0);
      ctx.lineTo(cutX - 180, this.height);
      ctx.stroke();
      ctx.restore();
    } else if (style === 'push') {
      // Smooth directional push with subtle 2-sample motion blur trail
      const e = easeOutQuint(blend);
      const prevShift = -e * this.width * 0.22;
      const nextShift = (1 - e) * this.width * 0.22;

      ctx.save();
      ctx.globalAlpha = 1 - e * 0.85;
      ctx.translate(prevShift, 0);
      this.drawSceneBody(ctx, prev, Math.max(0, prev.dur - 0.001), prev.dur);
      ctx.restore();

      // Motion-blur ghost sample during peak velocity
      if (blend > 0.08 && blend < 0.72) {
        ctx.save();
        ctx.globalAlpha = 0.24 * (1 - blend);
        ctx.translate(nextShift + 26, 0);
        this.drawSceneBody(ctx, scene, t, dur);
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = easeOut(blend);
      ctx.translate(nextShift, 0);
      this.drawSceneBody(ctx, scene, t, dur);
      ctx.restore();
    } else {
      // Velvet optical cross-dissolve
      this.drawSceneBody(ctx, prev, Math.max(0, prev.dur - 0.001), prev.dur);
      ctx.save();
      ctx.globalAlpha = easeInOut(blend);
      this.drawSceneBody(ctx, scene, t, dur);
      ctx.restore();
    }

    // Subtle film finish (keeps product photography vibrant & natural)
    grain(ctx, 0.026, this.width, this.height);
    vignette(ctx, this.width, this.height, 0.24);
    ctx.restore();
    return this.canvas;
  }
}
