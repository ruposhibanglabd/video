#!/usr/bin/env node
/**
 * QA contact sheets: renders representative frames from every scene and labels
 * them (time / scene # / kind) into a few large sheets for visual inspection.
 *
 *   node tools/qa-frames.mjs                 # all scenes, one frame each
 *   node tools/qa-frames.mjs 4 8 12          # specific scene numbers
 *   node tools/qa-frames.mjs --all-at 0.55   # relative position inside a scene
 */
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { Compositor, buildSchedule, FPS, REGISTRY, PLATFORM_READY } from '../src/render/frame.mjs';
import { SCENES } from '../src/scenes/timeline.mjs';
import { GlobalFonts } from '@napi-rs/canvas';

GlobalFonts.registerFromPath(path.resolve('assets/fonts/NotoSansBengali-Bold.ttf'), 'BN');
GlobalFonts.registerFromPath(path.resolve('assets/fonts/Inter-SemiBold.ttf'), 'Inter');

const args = process.argv.slice(2);
const rel = args.includes('--all-at') ? parseFloat(args[args.indexOf('--all-at') + 1]) : 0.6;
const list = args.filter((a) => /^\d+$/.test(a)).map(Number);
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'output/qa';
const cols = 4;
const tw = 432, th = 768, pad = 26, labelH = 34;

await PLATFORM_READY;
const duration = 492.356;
const schedule = buildSchedule(duration);
const comp = new Compositor();
fs.mkdirSync(outDir, { recursive: true });

const targets = (list.length ? schedule.scenes.filter((s) => list.includes(s.n)) : schedule.scenes);
const perSheet = 8;
let sheet = 0;
for (let start = 0; start < targets.length; start += perSheet) {
  const group = targets.slice(start, start + perSheet);
  const rows = Math.ceil(group.length / cols);
  const canvas = createCanvas(cols * (tw + pad) + pad, rows * (th + labelH + pad) + pad);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#10131a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  group.forEach((s, i) => {
    const frame = Math.min(schedule.totalFrames - 1, Math.round((s.f0 + (s.f1 - s.f0) * rel)));
    comp.drawFrame(schedule, frame);
    const x = pad + (i % cols) * (tw + pad);
    const y = pad + Math.floor(i / cols) * (th + labelH + pad);
    ctx.drawImage(comp.canvas, x, y, tw, th);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.strokeRect(x, y, tw, th);
    ctx.fillStyle = '#8fd7ff';
    ctx.font = '600 18px Inter';
    ctx.fillText(`S${String(s.n).padStart(2, '0')} · ${(frame / FPS).toFixed(1)}s · ${s.kind}`, x + 4, y + th + 24);
  });
  const file = path.join(outDir, `sheet-${String(sheet).padStart(2, '0')}.png`);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  console.log(file, group.map((g) => g.n).join(','));
  sheet++;
}
