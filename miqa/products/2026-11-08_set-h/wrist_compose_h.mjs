#!/usr/bin/env node
/**
 * Set H — on-wrist shots.
 *
 * Both the watch plate and the hands-only plate are put on the identical Steel
 * Daylight stage first (hand_stage_h.mjs), so the watch can be composited as a
 * feathered rectangle: no hard ellipse, every real watch pixel survives
 * (crown, lugs, bracelet links), and no tone band shows up on the wrist.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const STAGE = 'miqa/products/2026-11-08_set-h/plates-stage';
const OUT = 'miqa/deliveries/2026-11-08_set-h/website';
const THUMBS = path.join(OUT, 'thumbs');
const SIZE = 1600;
const THUMB = 600;

const hand = await loadImage('miqa/products/2026-11-08_set-h/plates-stage/wrist_hand_stage.png');

for (const [slug, cfg] of Object.entries(JSON.parse(process.argv[2] || '{}'))) {
  const watch = await loadImage(path.join(STAGE, cfg.plate));

  // 1) crop the watch out of the plate (case + a little bracelet)
  const cw = 470, ch = 760, cx = 512, cy = 540;
  const wc = createCanvas(cw, ch);
  wc.getContext('2d').drawImage(watch, cx - cw / 2, cy - ch / 2, cw, ch, 0, 0, cw, ch);

  // 2) feathered rectangle: both plates share the same gradient, so a soft edge
  //    is invisible and nothing of the watch gets clipped
  const F = 90;
  const wctx = wc.getContext('2d');
  wctx.globalCompositeOperation = 'destination-in';
  const hg = wctx.createLinearGradient(0, 0, cw, 0);
  hg.addColorStop(0, 'rgba(0,0,0,0)');
  hg.addColorStop(F / cw, 'rgba(0,0,0,1)');
  hg.addColorStop(1 - F / cw, 'rgba(0,0,0,1)');
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  wctx.fillStyle = hg;
  wctx.fillRect(0, 0, cw, ch);
  const vg = wctx.createLinearGradient(0, 0, 0, ch);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(F / ch, 'rgba(0,0,0,1)');
  vg.addColorStop(1 - F / ch, 'rgba(0,0,0,1)');
  vg.addColorStop(1, 'rgba(0,0,0,0)');
  wctx.fillStyle = vg;
  wctx.fillRect(0, 0, cw, ch);
  wctx.globalCompositeOperation = 'source-over';

  // 3) compose on the wrist
  const out = createCanvas(SIZE, SIZE);
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const s = Math.max(SIZE / hand.width, SIZE / hand.height);
  ctx.drawImage(hand, (SIZE - hand.width * s) / 2, (SIZE - hand.height * s) / 2, hand.width * s, hand.height * s);

  const ww = cfg.w || 380;
  const wh = ww * (ch / cw);
  const wx = cfg.x ?? SIZE * 0.39;
  const wy = cfg.y ?? SIZE * 0.485;
  const rot = cfg.rot ?? -0.10;

  ctx.save();
  ctx.translate(wx, wy + wh * 0.015);
  ctx.rotate(rot);
  ctx.filter = 'blur(30px)';
  ctx.fillStyle = 'rgba(70,52,42,0.34)';
  ctx.beginPath();
  ctx.ellipse(0, 0, ww * 0.44, wh * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(rot);
  ctx.drawImage(wc, -ww / 2, -wh / 2, ww, wh);
  ctx.restore();

  fs.writeFileSync(path.join(OUT, `${slug}_5_wrist.jpg`), out.toBuffer('image/jpeg', 92));
  const tc = createCanvas(THUMB, THUMB);
  tc.getContext('2d').drawImage(out, 0, 0, THUMB, THUMB);
  fs.writeFileSync(path.join(THUMBS, `${slug}_5_wrist_600.jpg`), tc.toBuffer('image/jpeg', 82));
  console.log(`${slug}: wrist ok`);
}
