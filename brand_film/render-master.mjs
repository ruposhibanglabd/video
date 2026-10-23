import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

import { FILM } from './timeline/cues.mjs';
import { fontSpec, loadStudioAssets } from './engine/canvas-core.mjs';
import { buildStoreSurfaces } from './ui/industry-stores.mjs';
import { buildAdminSurfaces } from './ui/admin-and-workflow.mjs';
import { createFilmCompositor } from './engine/compositor.mjs';
import { composeMasterAudio } from './audio/compose-audio.mjs';

const __filename = fileURLToPath(import.meta.url);

async function initRenderer() {
  const assets = await loadStudioAssets(process.cwd());
  const stores = buildStoreSurfaces(assets);
  const admin = buildAdminSurfaces(assets);
  const compositor = createFilmCompositor(assets, stores, admin);
  return { assets, stores, admin, compositor };
}

async function generateQaSheets(outDir = '/tmp/cpw_qa') {
  console.log('[qa] Initializing renderer and rendering 24 keyframes across all 11 scenes...');
  fs.mkdirSync(outDir, { recursive: true });
  const { compositor } = await initRenderer();

  const sampleTimes = [
    // Scene 01
    { t: 3.5, label: 'S01a Opening Boutique' },
    { t: 13.5, label: 'S01b Craft & Mobile' },
    { t: 20.0, label: 'S01c Hero Title' },
    { t: 26.5, label: 'S01d Brand Plaque' },
    // Scene 02
    { t: 35.0, label: 'S02a Entrepreneur' },
    { t: 54.0, label: 'S02b Scattered Inbox' },
    { t: 65.0, label: 'S02c Website Question' },
    // Scene 03
    { t: 88.0, label: 'S03a Desktop Solution' },
    { t: 110.0, label: 'S03b Mobile Transition' },
    // Scene 04
    { t: 129.5, label: 'S04.1 Fashion Store' },
    { t: 135.0, label: 'S04.2 Watch Store' },
    { t: 140.5, label: 'S04.3 Shoe Store' },
    { t: 146.0, label: 'S04.4 Cosmetics Store' },
    { t: 151.0, label: 'S04.5 Furniture Store' },
    { t: 156.5, label: 'S04.6 Restaurant' },
    { t: 165.0, label: 'S04.7 6-Industry Grid' },
    // Scene 05
    { t: 182.0, label: 'S05a Browse Catalog' },
    { t: 195.0, label: 'S05b Size & Color' },
    { t: 213.0, label: 'S05c Order Confirmed' },
    // Scene 06 & 07 & 08
    { t: 240.0, label: 'S06 Admin Products' },
    { t: 304.0, label: 'S07 Courier Workflow' },
    { t: 348.0, label: 'S08 3-Device Sync' },
    // Scene 09, 10, 11
    { t: 398.0, label: 'S09 Full Pricing & Trust' },
    { t: 434.0, label: 'S10 How to Get Started' },
    { t: 484.0, label: 'S11 Final WhatsApp CTA' },
  ];

  const frameCanvas = createCanvas(FILM.width, FILM.height);
  const fctx = frameCanvas.getContext('2d');
  const savedPaths = [];

  for (let i = 0; i < sampleTimes.length; i++) {
    const item = sampleTimes[i];
    compositor.renderFrameAtTime(fctx, item.t);
    const p = path.join(outDir, `still_${String(i + 1).padStart(2, '0')}_${item.t}s.png`);
    fs.writeFileSync(p, frameCanvas.toBuffer('image/png'));
    savedPaths.push({ ...item, path: p });
  }

  // Build two crisp 4x3 contact sheets (each cell 360x640 -> 1440x1920)
  for (let sheet = 0; sheet < 2; sheet++) {
    const cols = 4;
    const rows = 3;
    const cw = 360;
    const ch = 640;
    const sc = createCanvas(cols * cw, rows * ch);
    const sctx = sc.getContext('2d');
    sctx.fillStyle = '#050B14';
    sctx.fillRect(0, 0, sc.width, sc.height);

    for (let k = 0; k < 12; k++) {
      const idx = sheet * 12 + k;
      if (idx >= savedPaths.length) break;
      const item = savedPaths[idx];
      const img = await loadImage(item.path);
      const col = k % cols;
      const row = Math.floor(k / cols);
      const x = col * cw;
      const y = row * ch;
      sctx.drawImage(img, x + 4, y + 4, cw - 8, ch - 38);
      sctx.fillStyle = '#0D1B30';
      sctx.fillRect(x + 4, y + ch - 34, cw - 8, 30);
      sctx.fillStyle = '#8DEBFF';
      sctx.font = fontSpec(700, 14);
      sctx.textAlign = 'left';
      sctx.textBaseline = 'middle';
      sctx.fillText(`${item.t.toFixed(1)}s · ${item.label}`, x + 12, y + ch - 19);
    }

    const sheetPath = path.join(outDir, `contact_sheet_${sheet + 1}.jpg`);
    fs.writeFileSync(sheetPath, sc.toBuffer('image/jpeg', 90));
    console.log('[qa] Wrote contact sheet:', sheetPath);
  }
}

async function runWorker(startFrame, endFrame, outPath) {
  const { compositor } = await initRenderer();
  const canvas = createCanvas(FILM.width, FILM.height);
  const ctx = canvas.getContext('2d');

  const ffArgs = [
    '-y',
    '-v', 'error',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${FILM.width}x${FILM.height}`,
    '-r', String(FILM.fps),
    '-i', 'pipe:0',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '23',
    '-profile:v', 'high',
    '-level', '4.1',
    '-pix_fmt', 'yuv420p',
    '-g', '60',
    '-keyint_min', '60',
    '-sc_threshold', '0',
    outPath,
  ];

  const ff = spawn(ffmpegInstaller.path, ffArgs, { stdio: ['pipe', 'inherit', 'pipe'] });
  let stderrText = '';
  ff.stderr.on('data', (d) => {
    stderrText += d.toString();
  });

  const total = endFrame - startFrame;
  const t0 = Date.now();

  for (let f = startFrame; f < endFrame; f++) {
    const t = f / FILM.fps;
    compositor.renderFrameAtTime(ctx, t);
    const raw = canvas.data(); // Direct zero-copy RGBA Uint8ClampedArray from @napi-rs/canvas
    const buf = Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength);
    if (!ff.stdin.write(buf)) {
      await new Promise((resolve) => ff.stdin.once('drain', resolve));
    }
    const done = f - startFrame + 1;
    if (done % 600 === 0 || done === total) {
      const sec = (Date.now() - t0) / 1000;
      const fps = (done / Math.max(0.01, sec)).toFixed(1);
      console.log(`[worker ${startFrame}..${endFrame}] ${done}/${total} frames (${fps} fps)`);
    }
  }

  ff.stdin.end();
  const code = await new Promise((resolve) => ff.on('close', resolve));
  if (code !== 0) {
    throw new Error(`ffmpeg worker exited ${code}: ${stderrText}`);
  }
}

async function runFullMasterRender({
  finalOut = path.resolve('output/CodePixel-Web-Brand-Film-2026.mp4'),
} = {}) {
  const startAll = Date.now();
  fs.mkdirSync(path.dirname(finalOut), { recursive: true });

  // 1. Ensure master audio exists
  const audioM4a = path.resolve('brand_film/assets/audio/master_mix_48k.m4a');
  if (!fs.existsSync(audioM4a)) {
    await composeMasterAudio({ m4aOut: audioM4a });
  }

  // 2. Split 14,760 frames across CPU workers (aligned on 60-frame GOP boundary!)
  const numWorkers = Math.max(1, Math.min(4, os.cpus().length));
  const gopFrames = 60;
  const approxPerWorker = Math.floor(FILM.totalFrames / numWorkers / gopFrames) * gopFrames;
  const chunks = [];
  for (let w = 0; w < numWorkers; w++) {
    const s = w * approxPerWorker;
    const e = w === numWorkers - 1 ? FILM.totalFrames : (w + 1) * approxPerWorker;
    const partPath = `/tmp/cpw_chunk_${w}.mp4`;
    chunks.push({ w, s, e, partPath });
  }

  console.log(`[master] Rendering ${FILM.totalFrames} frames (${FILM.duration}s @ ${FILM.fps}fps) across ${chunks.length} parallel workers...`);

  await Promise.all(
    chunks.map(
      (ch) =>
        new Promise((resolve, reject) => {
          const proc = spawn(
            process.execPath,
            [__filename, '--worker', String(ch.s), String(ch.e), ch.partPath],
            { stdio: 'inherit' }
          );
          proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Worker ${ch.w} failed with exit code ${code}`));
          });
        })
    )
  );

  // 3. Concatenate video chunks losslessly + mux master 48kHz stereo AAC audio
  const listFile = '/tmp/cpw_concat_list.txt';
  fs.writeFileSync(listFile, chunks.map((c) => `file '${c.partPath}'`).join('\n') + '\n');

  console.log('[master] Muxing H.264 video + 48kHz stereo AAC audio ->', finalOut);
  const mux = spawnSync(
    ffmpegInstaller.path,
    [
      '-y',
      '-v', 'error',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-i', audioM4a,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      finalOut,
    ],
    { encoding: 'utf8' }
  );
  if (mux.status !== 0) {
    throw new Error(`Final mux failed: ${mux.stderr}`);
  }

  // Cleanup temp chunks
  for (const ch of chunks) {
    if (fs.existsSync(ch.partPath)) fs.unlinkSync(ch.partPath);
  }
  if (fs.existsSync(listFile)) fs.unlinkSync(listFile);

  const elapsed = ((Date.now() - startAll) / 1000).toFixed(1);
  const probe = JSON.parse(
    spawnSync(
      ffprobeInstaller.path,
      [
        '-v', 'error',
        '-show_entries', 'format=duration,size,bit_rate:stream=index,codec_type,codec_name,profile,width,height,r_frame_rate,nb_frames,sample_rate,channels',
        '-of', 'json',
        finalOut,
      ],
      { encoding: 'utf8' }
    ).stdout
  );

  console.log(`[master] COMPLETED in ${elapsed}s!`);
  console.log(JSON.stringify(probe, null, 2));
}

// CLI Entrypoint
const args = process.argv.slice(2);
if (args[0] === '--qa-sheet') {
  generateQaSheets(args[1] || '/tmp/cpw_qa').catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else if (args[0] === '--worker') {
  const s = Number(args[1]);
  const e = Number(args[2]);
  const out = args[3];
  runWorker(s, e, out).catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  const outIdx = args.indexOf('--out');
  const finalOut = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.resolve('output/CodePixel-Web-Brand-Film-2026.mp4');
  runFullMasterRender({ finalOut }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
