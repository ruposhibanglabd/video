#!/usr/bin/env node
/**
 * Real MP4 renderer.
 *
 *   node src/render/render.mjs --audio uploads/x/voice.m4a --out output/CodePixel-Web-Promo-Reels.mp4
 *   node src/render/render.mjs --audio x.m4a --still 12.5 --png /tmp/frame.png
 *
 * Frames are drawn with Skia (@napi-rs/canvas) and piped as rawvideo into
 * ffmpeg; the untouched voiceover is muxed as AAC. Progress is emitted as JSON
 * lines on stdout so the web app can show real job state.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Compositor, buildSchedule, FPS } from './frame.mjs';
import { PLATFORM_READY } from './platform.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function ffmpegPath() {
  try { return require('@ffmpeg-installer/ffmpeg').path; } catch { return 'ffmpeg'; }
}
export function ffprobePath() {
  try { return require('@ffprobe-installer/ffprobe').path; } catch { return 'ffprobe'; }
}

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

export function probeAudio(file) {
  const out = execFileSync(ffprobePath(), [
    '-v', 'error', '-show_entries', 'format=duration,format_name:stream=codec_type,codec_name,sample_rate,channels,bit_rate',
    '-of', 'json', file,
  ], { encoding: 'utf8' });
  const info = JSON.parse(out);
  const streams = (info.streams || []).filter((s) => s.codec_type === 'audio');
  if (!streams.length) throw new Error('NO_AUDIO_STREAM');
  const duration = parseFloat(info.format?.duration || '0');
  if (!isFinite(duration) || duration <= 0.2) throw new Error('BAD_DURATION');
  return {
    duration,
    codec: streams[0].codec_name,
    sampleRate: Number(streams[0].sample_rate) || null,
    channels: streams[0].channels || null,
    format: info.format?.format_name,
  };
}

export function detectSilences(file) {
  try {
    const res = spawn(ffmpegPath(), ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.30', '-f', 'null', '-']);
    let log = '';
    res.stderr.on('data', (d) => { log += d.toString(); });
    return new Promise((resolve) => {
      res.on('close', () => {
        const points = [];
        const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
        let m;
        while ((m = re.exec(log))) {
          const start = parseFloat(m[1]);
          const end = parseFloat(m[2]);
          if (end - start >= 0.30 && end > 1) points.push((start + end) / 2);
        }
        resolve(points);
      });
      res.on('error', () => resolve([]));
    });
  } catch {
    return Promise.resolve([]);
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      args[key] = val;
    }
  }
  return args;
}

async function renderStill(audio, at, pngPath) {
  await PLATFORM_READY;
  const probed = audio ? probeAudio(audio) : { duration: 492.356 };
  const silences = audio ? await detectSilences(audio) : [];
  const schedule = buildSchedule(probed.duration, { snapPoints: silences });
  const frame = Math.min(schedule.totalFrames - 1, Math.round(at * FPS));
  const comp = new Compositor({ preview: true });
  comp.drawFrame(schedule, frame);
  fs.mkdirSync(path.dirname(pngPath), { recursive: true });
  fs.writeFileSync(pngPath, comp.canvas.toBuffer('image/png'));
  return { frame, scene: schedule.scenes.find((s) => s.f0 <= frame && s.f1 > frame)?.n };
}

async function renderVideo({ audio, out, width = 1080, height = 1920 }) {
  await PLATFORM_READY;
  const started = Date.now();
  emit({ type: 'progress', phase: 'prepare', progress: 0.01, label: 'প্রজেক্ট প্রস্তুত হচ্ছে' });

  if (!audio || !fs.existsSync(audio)) throw new Error('AUDIO_MISSING');
  const probed = probeAudio(audio);
  emit({ type: 'meta', audioDuration: probed.duration, audioCodec: probed.codec });
  emit({ type: 'progress', phase: 'validate', progress: 0.03, label: 'অডিও ও অ্যাসেট যাচাই' });

  const silences = await detectSilences(audio);
  const schedule = buildSchedule(probed.duration, { snapPoints: silences });
  emit({ type: 'schedule', totalFrames: schedule.totalFrames, snapped: silences.length, duration: probed.duration });

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const temp = out.replace(/\.mp4$/, '') + '.part.mp4';
  const comp = new Compositor({ width, height });

  const ff = spawn(ffmpegPath(), [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-r', String(FPS), '-i', '-',
    '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.2', '-g', String(FPS * 2), '-keyint_min', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart',
    '-metadata', 'title=CodePixel Web — Promo (Reels)',
    '-metadata', 'comment=Voiceover supplied by the client; visuals generated by the CodePixel Web renderer.',
    temp,
  ], { stdio: ['pipe', 'inherit', 'pipe'] });

  let ffErr = '';
  ff.stderr.on('data', (d) => { ffErr += d.toString(); });
  const done = new Promise((resolve, reject) => {
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('FFMPEG_FAILED: ' + ffErr.slice(-500)))));
    ff.on('error', reject);
  });

  emit({ type: 'progress', phase: 'render', progress: 0.05, label: 'সিন রেন্ডার হচ্ছে' });
  const total = schedule.totalFrames;
  let lastEmit = 0;
  for (let f = 0; f < total; f++) {
    comp.drawFrame(schedule, f);
    const buf = comp.canvas.data ? comp.canvas.data() : null;
    // napi-rs canvas: get raw RGBA pixels
    const raw = buf || comp.ctx.getImageData(0, 0, width, height).data;
    if (!ff.stdin.write(Buffer.from(raw))) {
      await new Promise((r) => ff.stdin.once('drain', r));
    }
    const now = Date.now();
    if (now - lastEmit > 500) {
      lastEmit = now;
      const p = 0.05 + 0.9 * (f / total);
      emit({
        type: 'progress', phase: 'render', progress: p,
        label: 'সিন রেন্ডার হচ্ছে', frame: f, total,
        fps: f / Math.max(0.001, (now - started) / 1000),
        eta: Math.round((total - f) / Math.max(0.01, f / Math.max(0.001, (now - started) / 1000))),
      });
    }
  }
  ff.stdin.end();
  emit({ type: 'progress', phase: 'encode', progress: 0.96, label: 'ভিডিও এনকোড হচ্ছে' });
  await done;
  fs.renameSync(temp, out);

  const verify = JSON.parse(execFileSync(ffprobePath(), [
    '-v', 'error', '-show_entries', 'format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,channels,sample_rate',
    '-of', 'json', out,
  ], { encoding: 'utf8' }));
  const v = (verify.streams || []).find((s) => s.codec_type === 'video');
  const a = (verify.streams || []).find((s) => s.codec_type === 'audio');
  if (!v || !a) throw new Error('VERIFY_FAILED');
  const result = {
    out,
    width: v.width, height: v.height, fps: FPS,
    videoCodec: v.codec_name, audioCodec: a.codec_name,
    duration: parseFloat(verify.format.duration),
    audioDuration: probed.duration,
    sizeBytes: Number(verify.format.size),
    bitrate: Number(verify.format.bit_rate),
    scenes: schedule.scenes.length,
    frames: total,
    renderSeconds: Math.round((Date.now() - started) / 1000),
  };
  emit({ type: 'progress', phase: 'finalize', progress: 0.99, label: 'MP4 ফাইনাল হচ্ছে' });
  emit({ type: 'done', ...result });
  return result;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  (async () => {
    try {
      if (args.still) {
        const info = await renderStill(args.audio, parseFloat(args.still), args.png || 'output/still.png');
        console.log(JSON.stringify(info));
        return;
      }
      await renderVideo({
        audio: args.audio,
        out: args.out || path.join(ROOT, 'output', 'CodePixel-Web-Promo-Reels.mp4'),
        width: Number(args.width || 1080),
        height: Number(args.height || 1920),
      });
    } catch (err) {
      emit({ type: 'error', message: String(err.message || err) });
      process.exitCode = 1;
    }
  })();
}

export { renderVideo, renderStill };
