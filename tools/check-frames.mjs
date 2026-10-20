/** Sanity check: no near-black / empty frames at scene transitions. */
import { Compositor, buildSchedule } from '../src/render/frame.mjs';
const s = buildSchedule(492.356);
const c = new Compositor();
let dark = [];
for (const sc of s.scenes) {
  for (const f of [sc.f0, Math.floor((sc.f0 + sc.f1) / 2), Math.max(sc.f0, sc.f1 - 2)]) {
    c.drawFrame(s, Math.min(f, s.totalFrames - 1));
    const d = c.ctx.getImageData(0, 0, 1080, 1920).data;
    let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 97) { sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114; n++; }
    const mean = sum / n;
    if (mean < 8) dark.push({ scene: sc.n, frame: f, mean: mean.toFixed(1) });
  }
}
console.log('checked', s.scenes.length * 3, 'frames; near-black:', dark.length ? dark : 'none');
