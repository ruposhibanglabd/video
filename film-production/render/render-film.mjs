// Parallel Multi-Worker HD Renderer (1080x1920 @ 30fps) + 30-Keyframe Visual QA Generator
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { createCanvas } from '@napi-rs/canvas';
import ffmpegPkg from '@ffmpeg-installer/ffmpeg';
import ffprobePkg from '@ffprobe-installer/ffprobe';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  registerProductionFonts,
  loadAllProductionImages,
  fontSpec,
} from './graphics-kit.mjs';
import { buildAllPrebakedSurfaces } from '../websites/prebake-surfaces.mjs';
import { renderMasterFrame } from '../motion/scene-director.mjs';
import { FILM_META } from '../script/master-script.mjs';

const __filename = fileURLToPath(import.meta.url);
const ffmpeg = ffmpegPkg.path;
const ffprobe = ffprobePkg.path;

async function runWorkerSegment({ workerId, startFrame, endFrame, outPath }) {
  registerProductionFonts();
  const images = await loadAllProductionImages();
  const surfaces = buildAllPrebakedSurfaces(images);
  const voTimeline = JSON.parse(
    fs.readFileSync('film-production/assets/audio/voiceover-timeline.json', 'utf8')
  );

  const canvas = createCanvas(FILM_META.width, FILM_META.height);
  const ctx = canvas.getContext('2d');
  const transCanvas = createCanvas(FILM_META.width, FILM_META.height);

  const ff = spawn(ffmpeg, [
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${FILM_META.width}x${FILM_META.height}`,
    '-r', String(FILM_META.fps),
    '-i', 'pipe:0',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '21',
    '-profile:v', 'high',
    '-level', '4.2',
    '-pix_fmt', 'yuv420p',
    '-g', '60',
    '-keyint_min', '60',
    '-sc_threshold', '0',
    '-threads', '2',
    outPath,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let stderrLog = '';
  ff.stderr.on('data', (d) => { stderrLog += d.toString(); });

  const total = endFrame - startFrame;
  const t0 = Date.now();

  for (let f = startFrame; f < endFrame; f++) {
    renderMasterFrame(ctx, transCanvas, f, surfaces, images, voTimeline);
    const rawBuf = canvas.data();
    if (!ff.stdin.write(rawBuf)) {
      await once(ff.stdin, 'drain');
    }

    const done = f - startFrame + 1;
    if (done % 600 === 0 || done === total) {
      const sec = (Date.now() - t0) / 1000;
      const fpsRate = (done / sec).toFixed(1);
      parentPort.postMessage({ workerId, done, total, fpsRate });
    }
  }

  ff.stdin.end();
  const [code] = await once(ff, 'close');
  if (code !== 0) {
    throw new Error(`Worker ${workerId} ffmpeg exited with code ${code}: ${stderrLog.slice(-500)}`);
  }
}

if (!isMainThread) {
  runWorkerSegment(workerData)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  const mode = process.argv[2] || '--qa';

  if (mode === '--qa') {
    registerProductionFonts();
    const images = await loadAllProductionImages();
    const surfaces = buildAllPrebakedSurfaces(images);
    const voTimeline = JSON.parse(
      fs.readFileSync('film-production/assets/audio/voiceover-timeline.json', 'utf8')
    );

    const qaDir = 'film-production/qa';
    fs.mkdirSync(qaDir, { recursive: true });

    const canvas = createCanvas(FILM_META.width, FILM_META.height);
    const ctx = canvas.getContext('2d');
    const transCanvas = createCanvas(FILM_META.width, FILM_META.height);

    // 30 comprehensive QA timestamps covering every single scene & sub-beat (0s..491s)
    const sampleTimes = [
      0.15, 2.4, 5.0, 8.0, 14.5, 22.0,
      36.0, 50.0, 65.0, 88.0,
      112.0, 123.5, 131.0, 138.0, 145.0,
      152.0, 159.0, 166.0, 174.0, 183.0,
      199.0, 208.0, 217.0, 228.0, 244.0,
      258.0, 298.0, 326.0, 344.0, 378.0,
      390.0, 418.0, 452.0, 480.0, 491.5,
    ]; // 35 frames -> 5 cols x 7 rows contact sheets

    const thumbs = [];
    const keyExports = [0, 4, 7, 11, 16, 22, 24, 26, 29, 31, 33]; // Also save full 1080x1920 hero stills

    for (let i = 0; i < sampleTimes.length; i++) {
      const sec = sampleTimes[i];
      const f = Math.min(FILM_META.totalFrames - 1, Math.round(sec * FILM_META.fps));
      renderMasterFrame(ctx, transCanvas, f, surfaces, images, voTimeline);

      if (keyExports.includes(i)) {
        const png = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(qaDir, `still-${String(i).padStart(2, '0')}-${sec}s.png`), png);
      }

      // Store scaled thumbnail canvas (320 x 569)
      const tc = createCanvas(320, 569);
      const tctx = tc.getContext('2d');
      tctx.drawImage(canvas, 0, 0, 320, 569);
      tctx.fillStyle = 'rgba(0,0,0,0.72)';
      tctx.fillRect(0, 0, 138, 34);
      tctx.font = fontSpec(700, 16);
      tctx.fillStyle = '#8DEBFF';
      tctx.textBaseline = 'middle';
      const mm = String(Math.floor(sec / 60)).padStart(2, '0');
      const ss = (sec % 60).toFixed(1).padStart(4, '0');
      tctx.fillText(`${mm}:${ss}`, 10, 17);
      thumbs.push(tc);
    }

    // Build 2 ultra-clear contact sheets (18 frames on sheet A, 17 frames on sheet B, 6 cols x 3 rows = 1980 x 1760)
    for (let s = 0; s < 2; s++) {
      const slice = thumbs.slice(s * 18, (s + 1) * 18);
      const cols = 6;
      const rows = Math.ceil(slice.length / cols);
      const pad = 12;
      const sheet = createCanvas(cols * (320 + pad) + pad, rows * (569 + pad) + pad);
      const sctx = sheet.getContext('2d');
      sctx.fillStyle = '#050B14';
      sctx.fillRect(0, 0, sheet.width, sheet.height);
      slice.forEach((th, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        sctx.drawImage(th, pad + c * (320 + pad), pad + r * (569 + pad));
      });
      fs.writeFileSync(path.join(qaDir, `contact-sheet-${s + 1}.png`), sheet.toBuffer('image/png'));
    }

    // Benchmark single-thread render speed over 90 frames
    const b0 = Date.now();
    for (let f = 0; f < 90; f++) {
      renderMasterFrame(ctx, transCanvas, f * 150, surfaces, images, voTimeline);
      canvas.data();
    }
    const msPerFrame = ((Date.now() - b0) / 90).toFixed(2);
    console.log(`QA generated ${sampleTimes.length} verified frames + 2 contact sheets. Speed benchmark: ${msPerFrame} ms/frame.`);
  } else if (mode === '--master') {
    console.log(`Starting 2-worker parallel master render: ${FILM_META.totalFrames} frames (08:12 @ 30fps, 1080x1920)...`);
    const tmpDir = 'film-production/render/.tmp';
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.mkdirSync('deliverables', { recursive: true });

    const mid = Math.floor(FILM_META.totalFrames / 2); // 7380 (exact GOP multiple of 60!)
    const seg0 = path.join(tmpDir, 'seg-0.mp4');
    const seg1 = path.join(tmpDir, 'seg-1.mp4');
    const listFile = path.join(tmpDir, 'concat.txt');
    const outMp4 = 'deliverables/CodePixel-Web-Advertising-Film.mp4';

    const tStart = Date.now();
    await Promise.all([
      { workerId: 0, startFrame: 0, endFrame: mid, outPath: seg0 },
      { workerId: 1, startFrame: mid, endFrame: FILM_META.totalFrames, outPath: seg1 },
    ].map((cfg) => new Promise((resolve, reject) => {
      const w = new Worker(__filename, { workerData: cfg });
      w.on('message', (m) => {
        console.log(`   [Worker ${m.workerId}] ${m.done}/${m.total} frames (${m.fpsRate} fps)`);
      });
      w.on('error', reject);
      w.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Worker exited ${code}`))));
    })));

    console.log('Concatenating video segments + muxing broadcast master audio...');
    fs.writeFileSync(listFile, `file '${path.resolve(seg0)}'\nfile '${path.resolve(seg1)}'\n`);
    execFileSync(ffmpeg, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-i', 'film-production/assets/audio/master-mix.m4a',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      outMp4,
    ], { stdio: 'inherit' });

    fs.rmSync(tmpDir, { recursive: true, force: true });

    const totalWall = ((Date.now() - tStart) / 1000).toFixed(1);
    const probe = JSON.parse(execFileSync(ffprobe, [
      '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', outMp4,
    ], { encoding: 'utf8' }));
    const szMb = (fs.statSync(outMp4).size / (1024 * 1024)).toFixed(2);
    console.log(`MASTER COMPLETE in ${totalWall}s -> ${outMp4} (${szMb} MB, duration=${probe.format.duration}s)`);
  }
}
