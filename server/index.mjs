/**
 * CodePixel Web — video creator server (no external framework).
 *
 *   npm start  →  http://localhost:3000
 *
 * Endpoints
 *   POST /api/upload?name=<file>   raw audio bytes  → { uploadId, duration, ... }
 *   POST /api/render               { uploadId }     → { jobId } (one job at a time)
 *   GET  /api/events/<jobId>       Server-Sent Events with real render progress
 *   GET  /api/jobs/<jobId>         latest job snapshot
 *   GET  /media/uploads/...        uploaded audio (for preview playback)
 *   GET  /media/output/...         rendered MP4 (with HTTP Range support)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { probeAudio } from '../src/render/render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPLOADS = path.join(ROOT, 'uploads');
const OUTPUT = path.join(ROOT, 'output');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);
const FPS = 30;
const REFERENCE_SECONDS = 492.356;

for (const dir of [UPLOADS, OUTPUT]) fs.mkdirSync(dir, { recursive: true });

const jobs = new Map();
let activeJob = null;
const ALLOWED = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus', '.flac', '.mp4', '.webm']);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.aac': 'audio/aac', '.flac': 'audio/flac',
};

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(data);
}

function readBody(req, limit = 200 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('TOO_LARGE')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function serveFile(req, res, file, { download = null } = {}) {
  let stat;
  try { stat = fs.statSync(file); } catch { return json(res, 404, { error: 'NOT_FOUND' }); }
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const range = req.headers.range;
  const headers = {
    'content-type': type,
    'accept-ranges': 'bytes',
    'cache-control': 'no-store',
  };
  if (download) headers['content-disposition'] = `attachment; filename="${download}"`;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? Number(m[1]) : 0;
    const end = m && m[2] ? Number(m[2]) : stat.size - 1;
    res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${stat.size}`, 'content-length': end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { ...headers, 'content-length': stat.size });
    fs.createReadStream(file).pipe(res);
  }
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  const ss = s.toFixed(3).padStart(6, '0');
  return `${String(m).padStart(2, '0')}:${ss}`;
}

async function handleUpload(req, res, url) {
  const raw = url.searchParams.get('name') || 'voiceover.m4a';
  const name = path.basename(decodeURIComponent(raw));
  const ext = path.extname(name).toLowerCase();
  if (!ALLOWED.has(ext)) {
    return json(res, 400, { error: 'UNSUPPORTED_TYPE', message: 'এই ফাইল ফরম্যাট সমর্থিত নয়। MP3, WAV, M4A বা AAC ব্যবহার করুন।' });
  }
  const body = await readBody(req);
  if (!body.length) return json(res, 400, { error: 'EMPTY_FILE', message: 'ফাইলটি খালি।' });
  const id = crypto.randomBytes(8).toString('hex');
  const dir = path.join(UPLOADS, id);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'voiceover' + ext);
  fs.writeFileSync(file, body);
  let info;
  try {
    info = probeAudio(file);
  } catch (err) {
    fs.rmSync(dir, { recursive: true, force: true });
    return json(res, 422, { error: 'UNDECODABLE', message: 'অডিওটি ডিকোড করা যাচ্ছে না। অন্য ফাইল দিয়ে চেষ্টা করুন।' });
  }
  const warnings = [];
  if (Math.abs(info.duration - REFERENCE_SECONDS) > 2) {
    warnings.push(`আপলোড করা অডিওর দৈর্ঘ্য ${fmtTime(info.duration)} — ভিডিওর টাইমলাইন এই দৈর্ঘ্যের সাথে আনুপাতিকভাবে মেলানো হবে।`);
  }
  return json(res, 200, {
    uploadId: id,
    fileName: name,
    duration: info.duration,
    durationLabel: fmtTime(info.duration),
    codec: info.codec,
    sampleRate: info.sampleRate,
    channels: info.channels,
    referenceDuration: REFERENCE_SECONDS,
    url: `/media/uploads/${id}/${path.basename(file)}`,
    warnings,
  });
}

function startRender(uploadId, opts = {}) {
  const dir = path.join(UPLOADS, uploadId);
  if (!fs.existsSync(dir)) throw new Error('UPLOAD_NOT_FOUND');
  const file = fs.readdirSync(dir).find((f) => f.startsWith('voiceover'));
  if (!file) throw new Error('UPLOAD_NOT_FOUND');
  const audio = path.join(dir, file);
  const jobId = crypto.randomBytes(6).toString('hex');
  const outName = 'CodePixel-Web-Promo-Reels.mp4';
  const out = path.join(OUTPUT, outName);
  const job = {
    id: jobId, uploadId, audio, out, outName,
    status: 'running', progress: 0, phase: 'prepare', label: 'প্রস্তুত হচ্ছে',
    startedAt: Date.now(), log: [], clients: new Set(), result: null, error: null,
  };
  jobs.set(jobId, job);
  activeJob = job;

  const child = spawn(process.execPath, [
    path.join(ROOT, 'src/render/render.mjs'),
    '--audio', audio, '--out', out,
  ], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });

  const push = (evt) => {
    job.log.push(evt);
    for (const c of job.clients) c.write(`data: ${JSON.stringify(evt)}\n\n`);
  };

  let buf = '';
  child.stdout.on('data', (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let evt;
      try { evt = JSON.parse(line); } catch { continue; }
      if (evt.type === 'progress') {
        job.progress = evt.progress;
        job.phase = evt.phase;
        job.label = evt.label;
        job.fps = evt.fps;
        job.frame = evt.frame;
        job.total = evt.total;
        job.eta = evt.eta;
      }
      if (evt.type === 'meta') job.audioDuration = evt.audioDuration;
      if (evt.type === 'schedule') job.totalFrames = evt.totalFrames;
      if (evt.type === 'done') {
        job.status = 'done';
        job.progress = 1;
        job.result = evt;
        job.label = 'ডাউনলোডের জন্য প্রস্তুত';
        job.finishedAt = Date.now();
        activeJob = null;
      }
      if (evt.type === 'error') {
        job.status = 'error';
        job.error = evt.message;
        job.label = 'রেন্ডার ব্যর্থ হয়েছে';
        job.finishedAt = Date.now();
        activeJob = null;
      }
      push(evt);
    }
  });
  let errBuf = '';
  child.stderr.on('data', (d) => { errBuf += d.toString(); if (errBuf.length > 8000) errBuf = errBuf.slice(-8000); });
  child.on('close', (code) => {
    if (job.status === 'running') {
      job.status = code === 0 ? 'done' : 'error';
      if (job.status === 'error') job.error = errBuf.slice(-600) || `exit ${code}`;
      job.finishedAt = Date.now();
      activeJob = null;
      push({ type: job.status === 'done' ? 'done' : 'error', message: job.error, ...(job.result || {}) });
    }
    for (const c of job.clients) c.end();
  });
  return job;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;
  try {
    if (p === '/' || p === '/index.html') return serveFile(req, res, path.join(PUBLIC, 'index.html'));
    if (p.startsWith('/static/')) {
      const f = path.join(PUBLIC, path.normalize(p.slice(8)).replace(/^(\.\.[/\\])+/, ''));
      return serveFile(req, res, f);
    }
    if (p.startsWith('/media/uploads/')) {
      const f = path.join(UPLOADS, path.normalize(p.slice(15)).replace(/^(\.\.[/\\])+/, ''));
      return serveFile(req, res, f);
    }
    if (p.startsWith('/media/output/')) {
      const want = path.basename(p.slice(14));
      const f = path.join(OUTPUT, want);
      const dl = url.searchParams.get('dl');
      return serveFile(req, res, f, { download: dl ? decodeURIComponent(dl) : null });
    }
    if (p === '/api/upload' && req.method === 'POST') return await handleUpload(req, res, url);
    if (p === '/api/render' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      if (activeJob) return json(res, 429, { error: 'BUSY', message: 'একটি রেন্ডার চলছে — শেষ হলে আবার চেষ্টা করুন।', jobId: activeJob.id });
      const job = startRender(body.uploadId);
      return json(res, 202, { jobId: job.id });
    }
    if (p.startsWith('/api/events/')) {
      const job = jobs.get(p.split('/').pop());
      if (!job) return json(res, 404, { error: 'NO_JOB' });
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store', connection: 'keep-alive', 'x-accel-buffering': 'no',
      });
      res.write(`data: ${JSON.stringify({ type: 'snapshot', ...snapshot(job) })}\n\n`);
      for (const evt of job.log.slice(-40)) res.write(`data: ${JSON.stringify(evt)}\n\n`);
      job.clients.add(res);
      req.on('close', () => job.clients.delete(res));
      return;
    }
    if (p.startsWith('/api/jobs/')) {
      const job = jobs.get(p.split('/').pop());
      if (!job) return json(res, 404, { error: 'NO_JOB' });
      return json(res, 200, snapshot(job));
    }
    if (p === '/api/health') return json(res, 200, { ok: true, activeJob: activeJob?.id || null, fps: FPS });
    return json(res, 404, { error: 'NOT_FOUND' });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'SERVER_ERROR', message: String(err.message || err) });
  }
});

function snapshot(job) {
  return {
    id: job.id, status: job.status, progress: job.progress, phase: job.phase, label: job.label,
    frame: job.frame, total: job.total || job.totalFrames, fps: job.fps, eta: job.eta,
    audioDuration: job.audioDuration, result: job.result, error: job.error,
  };
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CodePixel Web video creator → http://0.0.0.0:${PORT}`);
  console.log(`uploads: ${UPLOADS}`);
  console.log(`output:  ${OUTPUT}`);
});
