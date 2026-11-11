#!/usr/bin/env node
/**
 * Parallel master renderer.
 *
 * The Skia → ffmpeg pipeline is CPU-bound; drawing one frame is ~16 ms but
 * copying 1080×1920 RGBA out of the canvas is ~90 ms. So we split the frame
 * range across N worker processes, encode each segment with identical encoder
 * settings, then concat the segments and mux the untouched voiceover.
 *
 *   node tools/render-fast.mjs --audio assets/voiceover/voiceover.mp3 \
 *     --out output/CodePixel-Web-Promo-Reels.mp4 --workers 4
 *
 * Output is identical in spec to `node src/render/render.mjs`:
 * 1080×1920 · 30 fps · H.264 High + AAC 48 kHz.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER = path.join(ROOT, 'tools', 'render-segment.mjs');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      out[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    }
  }
  return out;
}

const a = args(process.argv.slice(2));
const audio = a.audio || path.join(ROOT, 'assets', 'voiceover', 'voiceover.mp3');
const outFile = path.resolve(a.out || path.join(ROOT, 'output', 'CodePixel-Web-Promo-Reels.mp4'));
const workers = Math.max(1, Math.min(8, Number(a.workers || Math.min(4, os.cpus().length))));
const from = a.from != null ? Number(a.from) : null;
const to = a.to != null ? Number(a.to) : null;
const crf = a.crf || '20';
const preset = a.preset || 'veryfast';
const tmpDir = path.join(ROOT, '.tmp', `render-${Date.now()}`);

if (!fs.existsSync(audio)) {
  console.error(`[fast] audio missing: ${audio}`);
  process.exit(1);
}
fs.mkdirSync(tmpDir, { recursive: true });

console.log(`[fast] audio   ${path.relative(ROOT, audio)}`);
console.log(`[fast] output  ${path.relative(ROOT, outFile)}`);
console.log(`[fast] workers ${workers} · crf ${crf} · preset ${preset}`);

const started = Date.now();

// ------------------------------------------------------------------ segments
// Worker 0 measures the schedule and writes it, so every worker agrees on the
// exact frame boundaries (silence snapping + voice envelope are deterministic,
// but we still share the plan to guarantee identical output).
const planFile = path.join(tmpDir, 'plan.json');
await new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [WORKER, '--plan', audio, '--planOut', planFile], { stdio: 'inherit' });
  p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('plan failed'))));
});
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const total = plan.totalFrames;
const first = from != null ? Math.max(0, from) : 0;
const last = to != null ? Math.min(total, to) : total;
const count = last - first;
console.log(`[fast] frames  ${count} (${(count / 30).toFixed(1)}s of ${(total / 30).toFixed(1)}s)`);

const per = Math.ceil(count / workers);
const ranges = [];
for (let i = 0; i < workers; i++) {
  const s = first + i * per;
  const e = Math.min(last, s + per);
  if (e > s) ranges.push({ s, e, file: path.join(tmpDir, `seg-${String(i).padStart(2, '0')}.mp4`) });
}

const workerDone = new Map();
let lastLog = 0;
const children = [];
await Promise.all(ranges.map((r, i) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [
    WORKER,
    '--audio', audio,
    '--planIn', planFile,
    '--start', String(r.s),
    '--end', String(r.e),
    '--out', r.file,
    '--crf', crf,
    '--preset', preset,
  ]);
  children.push(child);
  let buf = '';
  child.stdout.on('data', (d) => {
    buf += d.toString();
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('{')) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.type === 'progress') {
          workerDone.set(i, msg.done);
          const doneFrames = [...workerDone.values()].reduce((x, y) => x + y, 0);
          const now = Date.now();
          if (now - lastLog > 8000) {
            lastLog = now;
            const el = (now - started) / 1000;
            console.log(`[fast] ${String(doneFrames).padStart(6)}/${count} frames · ${(doneFrames / el).toFixed(1)} fps · ${Math.round(el)}s elapsed · ETA ${Math.round((count - doneFrames) / Math.max(0.1, doneFrames / el))}s`);
          }
        }
      } catch { /* ignore */ }
    }
  });
  child.stderr.on('data', (d) => process.stderr.write(`[w${i}] ${d}`));
  child.on('close', (c) => {
    if (c === 0) resolve();
    else reject(new Error(`worker ${i} failed (${c})`));
  });
})));

console.log(`[fast] segments ready in ${Math.round((Date.now() - started) / 1000)}s — joining`);

// ------------------------------------------------------------------ join + mux
const listFile = path.join(tmpDir, 'list.txt');
fs.writeFileSync(listFile, ranges.map((r) => `file '${r.file.replace(/'/g, "'\\''")}'`).join('\n') + '\n');

const joined = path.join(tmpDir, 'video.mp4');
const ffmpeg = (await import('../src/render/render.mjs')).ffmpegPath();
const ffprobe = (await import('../src/render/render.mjs')).ffprobePath();

function run(bin, argv) {
  execFileSync(bin, argv, { stdio: ['ignore', 'inherit', 'inherit'] });
}

run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'concat', '-safe', '0', '-i', listFile,
  '-c', 'copy', joined]);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const temp = outFile.replace(/\.mp4$/, '') + '.part.mp4';
if (from == null && to == null) {
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y',
    '-i', joined, '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart',
    '-metadata', 'title=CodePixel Web — Promo (Reels)',
    '-metadata', 'comment=Voiceover supplied by the client; visuals generated by the CodePixel Web renderer.',
    temp]);
  fs.renameSync(temp, outFile);
  console.log(`[fast] muxed → ${path.relative(ROOT, outFile)}`);
} else {
  fs.copyFileSync(joined, temp);
  fs.renameSync(temp, outFile);
  console.log(`[fast] segment export → ${path.relative(ROOT, outFile)} (no audio, partial range)`);
}

const verify = JSON.parse(execFileSync(ffprobe, [
  '-v', 'error', '-show_entries', 'format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,channels,sample_rate',
  '-of', 'json', outFile,
], { encoding: 'utf8' }));
const v = (verify.streams || []).find((s) => s.codec_type === 'video');
const au = (verify.streams || []).find((s) => s.codec_type === 'audio');
console.log(JSON.stringify({
  type: 'done',
  out: path.relative(ROOT, outFile),
  width: v?.width, height: v?.height, fps: v?.r_frame_rate,
  video: v?.codec_name, audio: au?.codec_name,
  duration: Number(verify.format.duration),
  sizeBytes: Number(verify.format.size),
  bitrate: Number(verify.format.bit_rate),
  frames: count,
  workers,
  renderSeconds: Math.round((Date.now() - started) / 1000),
}, null, 0));

if (!a.keep) fs.rmSync(tmpDir, { recursive: true, force: true });
