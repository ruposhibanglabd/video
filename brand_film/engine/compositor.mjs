import { createCanvas } from '@napi-rs/canvas';
import { FILM, PALETTE, SCENES } from '../timeline/cues.mjs';
import { clamp, easeInOutQuart, easeInOutCubic } from './canvas-core.mjs';
import {
  renderScene01,
  renderScene02,
  renderScene03,
  renderScene04,
  renderScene05,
} from '../scenes/scenes-01-to-05.mjs';
import {
  renderScene06,
  renderScene07,
  renderScene08,
  renderScene09,
  renderScene10,
  renderScene11,
} from '../scenes/scenes-06-to-11.mjs';

const TRANS_DUR = 0.76; // smooth 23-frame editorial scene transition

export function createFilmCompositor(assets, stores, admin) {
  const bufA = createCanvas(FILM.width, FILM.height);
  const ctxA = bufA.getContext('2d');
  const bufB = createCanvas(FILM.width, FILM.height);
  const ctxB = bufB.getContext('2d');

  function renderSingleScene(ctx, scene, t) {
    const clampedT = clamp(t, scene.start, scene.end - 0.001);
    switch (scene.id) {
      case 1:
        return renderScene01(ctx, clampedT, scene, assets, stores);
      case 2:
        return renderScene02(ctx, clampedT, scene, assets, stores);
      case 3:
        return renderScene03(ctx, clampedT, scene, assets, stores);
      case 4:
        return renderScene04(ctx, clampedT, scene, assets, stores);
      case 5:
        return renderScene05(ctx, clampedT, scene, assets, stores);
      case 6:
        return renderScene06(ctx, clampedT, scene, assets, stores, admin);
      case 7:
        return renderScene07(ctx, clampedT, scene, assets);
      case 8:
        return renderScene08(ctx, clampedT, scene, assets, stores);
      case 9:
        return renderScene09(ctx, clampedT, scene);
      case 10:
        return renderScene10(ctx, clampedT, scene);
      case 11:
      default:
        return renderScene11(ctx, clampedT, scene, assets, stores);
    }
  }

  function renderFrameAtTime(outCtx, t) {
    const safeT = clamp(t, 0, FILM.duration - 0.001);

    // Subtle 0.6s opening cinema reveal from deep navy (NOT pure black!) on frame 0..18
    let activeIdx = SCENES.findIndex((s) => safeT >= s.start && safeT < s.end);
    if (activeIdx < 0) activeIdx = SCENES.length - 1;
    const curScene = SCENES[activeIdx];

    // Check if we are inside an incoming transition window from previous scene
    const elapsedInScene = safeT - curScene.start;
    if (activeIdx > 0 && elapsedInScene < TRANS_DUR) {
      const prevScene = SCENES[activeIdx - 1];
      const u = clamp(elapsedInScene / TRANS_DUR, 0, 1);

      renderSingleScene(ctxA, prevScene, prevScene.end - 0.002);
      renderSingleScene(ctxB, curScene, safeT);

      const W = FILM.width;
      const H = FILM.height;
      const kind = curScene.transitionIn;

      if (kind === 'curtainLight' || kind === 'curtainDark') {
        const p = easeInOutQuart(u);
        // Outgoing subtly recedes vertically with gentle dimming
        outCtx.drawImage(bufA, 0, -Math.round(p * 110));
        outCtx.fillStyle = `rgba(6, 14, 28, ${(p * 0.28).toFixed(3)})`;
        outCtx.fillRect(0, 0, W, H);

        // Incoming glides up cleanly as an architectural sheet with soft shadow
        const inY = Math.round((1 - p) * H);
        outCtx.save();
        outCtx.shadowColor = 'rgba(4, 10, 22, 0.45)';
        outCtx.shadowBlur = 42;
        outCtx.drawImage(bufB, 0, inY);
        outCtx.restore();

        // Crisp 3px accent leading edge
        outCtx.fillStyle = kind === 'curtainLight' ? PALETTE.electricBlue : PALETTE.softCyan;
        outCtx.fillRect(0, inY, W, 3);
      } else if (kind === 'shutter') {
        const p = easeInOutQuart(u);
        outCtx.drawImage(bufA, -Math.round(p * 90), 0);

        const revealX = Math.round((1 - p) * W);
        outCtx.save();
        outCtx.beginPath();
        outCtx.rect(revealX, 0, W - revealX, H);
        outCtx.clip();
        outCtx.drawImage(bufB, Math.round((1 - p) * 60), 0);
        outCtx.restore();

        // Electric blue precision shutter rule
        outCtx.fillStyle = PALETTE.softCyan;
        outCtx.fillRect(revealX - 2, 0, 3, H);
      } else {
        // 'depthDissolve' optical scale cross-blend
        const p = easeInOutCubic(u);
        const sOut = 1 + p * 0.045;
        outCtx.save();
        outCtx.translate(W * 0.5, H * 0.5);
        outCtx.scale(sOut, sOut);
        outCtx.drawImage(bufA, -W * 0.5, -H * 0.5);
        outCtx.restore();

        const sIn = 1.04 - p * 0.04;
        outCtx.save();
        outCtx.globalAlpha = p;
        outCtx.translate(W * 0.5, H * 0.5);
        outCtx.scale(sIn, sIn);
        outCtx.drawImage(bufB, -W * 0.5, -H * 0.5);
        outCtx.restore();
      }
      return;
    }

    renderSingleScene(outCtx, curScene, safeT);
  }

  return { renderFrameAtTime };
}
