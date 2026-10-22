#!/usr/bin/env node
/**
 * Segment renderer (used by tools/render-fast.mjs).
 *
 *   node tools/render-segment.mjs --plan <audio> --planOut plan.json
 *   node tools/render-segment.mjs --audio x.mp3 --planIn plan.json \
 *        --start 0 --end 3700 --out seg.mp4
 *
 * Emits JSON progress lines on stdout. Video-only output with the exact encoder
 * settings of the master renderer, so segments can be concatenated losslessly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Compositor, buildSchedule, FPS, PLATFORM_READY } from '../src/render/frame.mjs';
import { setVoiceEnvelope, envelopeFromPcm } from '../src/render/voice.mjs';
import { probeAudio, detectSilences, ffmpegPath } from '../src/render/render.mjs';

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

async function voiceEnvelope(file, { sampleRate = 8000, fps = 20 } = {}) {
  return new Promise((resolve) => {
    const ff = spawn(ffmpegPath(), ['-hide_banner', '-loglevel', 'error', '-i', file,
      '-ac', '1', '-ar', String(sampleRate), '-f', 'f32le', '-']);
    const chunks = [];
    ff.stdout.on('data', (d) => chunks.push(d));
    ff.on('close', (code) => {
      if (code !== 0) return resolve(null);
      const buf = Buffer.concat(chunks);
      const pcm = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
      const { rms, fps: f } = envelopeFromPcm(pcm, sampleRate, fps);
      setVoiceEnvelope(rms, f);
      resolve(true);
    });
  });
}

const a = args(process.argv.slice(2));
await PLATFORM_READY;

if (a.plan) {
  const probed = probeAudio(a.plan);
  const silences = await detectSilences(a.plan);
  const schedule = buildSchedule(probed.duration, { snapPoints: silences });
  fs.mkdirSync(path.dirname(a.planOut), { recursive: true });
  fs.writeFileSync(a.planOut, JSON.stringify({
    duration: probed.duration,
    totalFrames: schedule.totalFrames,
    silences,
  }));
  process.stdout.write(JSON.stringify({ type: 'plan', totalFrames: schedule.totalFrames, duration: probed.duration }) + '\n');
  process.exit(0);
}

const start = Number(a.start);
const end = Number(a.end);
const out = a.out;
const plan = JSON.parse(fs.readFileSync(a.planIn, 'utf8'));
const schedule = buildSchedule(plan.duration, { snapPoints: plan.silences });
await voiceEnvelope(a.audio);

fs.mkdirSync(path.dirname(out), { recursive: true });
const comp = new Compositor({ width: 1080, height: 1920 });

const ff = spawn(ffmpegPath(), [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '1080x1920', '-r', String(FPS), '-i', '-',
  '-an',
  '-c:v', 'libx264', '-preset', a.preset || 'veryfast', '-crf', a.crf || '20',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
  '-g', String(FPS * 2), '-keyint_min', String(FPS),
  '-x264-params', 'scenecut=0:open-gop=0',
  out,
], { stdio: ['pipe', 'inherit', 'pipe'] });

let err = '';
ff.stderr.on('data', (d) => { err += d.toString(); });
const closed = new Promise((resolve, reject) => {
  ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('FFMPEG_FAILED ' + err.slice(-400)))));
  ff.on('error', reject);
});

const total = end - start;
let done = 0;
let last = 0;
const started = Date.now();
for (let f = start; f < end; f++) {
  comp.drawFrame(schedule, f);
  const raw = comp.canvas.data();
  try {
    if (!ff.stdin.write(Buffer.from(raw))) {
      await new Promise((r) => ff.stdin.once('drain', r));
    }
  } catch {
    throw new Error('FFMPEG_PIPE_CLOSED: ' + err.slice(-600));
  }
  done++;
  const now = Date.now();
  if (now - last > 1000) {
    last = now;
    process.stdout.write(JSON.stringify({ type: 'progress', done }) + '\n');
  }
}
ff.stdin.end();
await closed;
process.stdout.write(JSON.stringify({
  type: 'progress', done,
  fps: done / Math.max(0.001, (Date.now() - started) / 1000),
}) + '\n');
