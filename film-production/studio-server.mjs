// Live Preview & Direct 1-Click MP4 Download Studio Portal (Binds to 0.0.0.0:3000)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { SCENES, FILM_META } from './script/master-script.mjs';

const PORT = Number(process.env.PORT || 3000);
const VIDEO_PATH = path.resolve('deliverables/CodePixel-Web-Advertising-Film.mp4');
const AUDIO_PATH = path.resolve('film-production/assets/audio/master-mix.m4a');
const DOC_PATH = path.resolve('deliverables/PRODUCTION-STORYBOARD-AND-SCRIPT.md');
const QA_PATH = path.resolve('film-production/qa/mp4-decoded-verification.png');

function formatMMSS(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

function streamFileWithRange(req, res, filePath, contentType, downloadName = null) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('File not found');
    return;
  }
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const headers = {
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  };
  if (downloadName) {
    headers['Content-Disposition'] = `attachment; filename="${downloadName}"`;
  }

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? Math.min(total - 1, parseInt(parts[1], 10)) : total - 1;
    if (Number.isNaN(start) || start >= total || end < start) {
      res.writeHead(416, { 'Content-Range': `bytes */${total}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      ...headers,
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': end - start + 1,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { ...headers, 'Content-Length': total });
    fs.createReadStream(filePath).pipe(res);
  }
}

const chapterButtonsHtml = SCENES.map((s) => `
  <button class="chap-btn" onclick="jumpTo(${s.start})">
    <span class="time">${formatMMSS(s.start)}</span>
    <span class="title">${s.number} · ${s.bnTitle}</span>
  </button>
`).join('');

const HTML = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodePixel Web — প্রিমিয়াম বিজ্ঞাপন চলচ্চিত্র ডাউনলোড পোর্টাল</title>
  <style>
    :root {
      --navy: #081426;
      --mid: #102544;
      --blue: #397BFF;
      --cyan: #8DEBFF;
      --light: #F4F6FA;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, "Noto Sans Bengali", system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 20% 0%, #122B52 0%, #081426 55%, #050C18 100%);
      color: #FFFFFF;
      min-height: 100vh;
      padding: 28px 20px 60px;
    }
    .wrap {
      max-width: 1180px;
      margin: 0 auto;
    }
    .top-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(141, 235, 255, 0.16);
    }
    .brand {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand span { color: var(--cyan); font-weight: 700; }
    .pill {
      padding: 8px 16px;
      border-radius: 999px;
      background: rgba(57, 123, 255, 0.18);
      border: 1px solid rgba(141, 235, 255, 0.35);
      color: var(--cyan);
      font-size: 13px;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 32px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }
    .player-card {
      background: rgba(16, 37, 68, 0.72);
      border: 1px solid rgba(141, 235, 255, 0.25);
      border-radius: 26px;
      padding: 16px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    }
    video {
      width: 100%;
      aspect-ratio: 9 / 16;
      border-radius: 18px;
      background: #050C18;
      display: block;
    }
    .info-panel {
      background: rgba(16, 37, 68, 0.60);
      border: 1px solid rgba(141, 235, 255, 0.20);
      border-radius: 26px;
      padding: 30px;
    }
    h1 {
      font-size: 30px;
      line-height: 1.35;
      margin-bottom: 12px;
    }
    .sub {
      color: #CBD5E1;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .dl-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 18px 26px;
      border-radius: 16px;
      background: linear-gradient(135deg, #16A34A, #15803D);
      color: #FFFFFF;
      text-decoration: none;
      font-size: 19px;
      font-weight: 800;
      border: 1px solid #86EFAC;
      box-shadow: 0 12px 30px rgba(22, 163, 74, 0.32);
      transition: transform 0.15s ease;
      margin-bottom: 14px;
    }
    .dl-btn:hover { transform: translateY(-2px); }
    .sec-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 26px;
    }
    .sec-link {
      display: block;
      text-align: center;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(8, 20, 38, 0.78);
      border: 1px solid rgba(141, 235, 255, 0.22);
      color: var(--cyan);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
    }
    .sec-link:hover { background: rgba(57, 123, 255, 0.22); }
    .specs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
      gap: 12px;
      margin-bottom: 26px;
    }
    .spec-box {
      background: rgba(8, 20, 38, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 12px 14px;
    }
    .spec-box .k { color: #94A3B8; font-size: 12px; margin-bottom: 4px; }
    .spec-box .v { color: #FFFFFF; font-size: 15px; font-weight: 700; }
    h2 {
      font-size: 18px;
      color: var(--cyan);
      margin-bottom: 12px;
    }
    .chapters {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
      gap: 8px;
    }
    .chap-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(8, 20, 38, 0.72);
      border: 1px solid rgba(141, 235, 255, 0.16);
      color: #F4F6FA;
      padding: 10px 12px;
      border-radius: 11px;
      cursor: pointer;
      text-align: left;
      font-size: 13.5px;
    }
    .chap-btn:hover { border-color: var(--cyan); background: rgba(57, 123, 255, 0.2); }
    .chap-btn .time {
      font-family: ui-monospace, monospace;
      background: rgba(57, 123, 255, 0.25);
      color: var(--cyan);
      padding: 3px 7px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-bar">
      <div class="brand">CodePixel<span> Web</span> — Brand Film Studio</div>
      <div class="pill">মাত্র ৩০০০ টাকা · এডভান্স নেই · 1080×1920 Full HD</div>
    </div>

    <div class="grid">
      <div class="player-card">
        <video id="filmPlayer" controls playsinline preload="metadata" src="/stream/film.mp4"></video>
      </div>

      <div class="info-panel">
        <h1>আপনার মনের মতো ওয়েবসাইট, মাত্র ৩০০০ টাকায়!</h1>
        <p class="sub">
          নতুনভাবে নির্মিত ৮ মিনিট ১২ সেকেন্ডের (1080×1920, 30 FPS) প্রিমিয়াম বিজ্ঞাপন চলচ্চিত্র।
          নিচের বাটনে ক্লিক করে সরাসরি পূর্ণাঙ্গ MP4 ফাইল ডাউনলোড করুন অথবা যেকোনো দৃশ্যে গিয়ে প্রিভিউ দেখুন।
        </p>

        <a class="dl-btn" href="/download/CodePixel-Web-Advertising-Film.mp4" download="CodePixel-Web-Advertising-Film.mp4">
          ⬇ সরাসরি পূর্ণাঙ্গ MP4 ভিডিও ডাউনলোড করুন (82.7 MB)
        </a>

        <div class="sec-links">
          <a class="sec-link" href="/download/master-audio.m4a" download="CodePixel-Web-Master-Audio.m4a">🎵 মাস্টার অডিও ডাউনলোড (M4A)</a>
          <a class="sec-link" href="/download/storyboard-script.md" download="PRODUCTION-STORYBOARD-AND-SCRIPT.md">📄 স্ক্রিপ্ট ও স্টোরিবোর্ড (MD)</a>
          <a class="sec-link" href="/download/qa-sheet.png" download="MP4-QA-Verification.png">🖼 QA ভেরিফিকেশন শিট (PNG)</a>
        </div>

        <div class="specs">
          <div class="spec-box"><div class="k">রেজোলিউশন</div><div class="v">1080 × 1920 (9:16)</div></div>
          <div class="spec-box"><div class="k">দৈর্ঘ্য</div><div class="v">08:12 (492.0s)</div></div>
          <div class="spec-box"><div class="k">ফ্রেম ও কোডেক</div><div class="v">30 FPS · H.264 High</div></div>
          <div class="spec-box"><div class="k">অডিও মাস্টার</div><div class="v">48 kHz Stereo AAC</div></div>
        </div>

        <h2>১১টি দৃশ্যে সরাসরি যান (Scene Chapters)</h2>
        <div class="chapters">
          ${chapterButtonsHtml}
        </div>
      </div>
    </div>
  </div>

  <script>
    const player = document.getElementById('filmPlayer');
    function jumpTo(sec) {
      player.currentTime = sec;
      player.play();
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  if (urlPath === '/' || urlPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
  } else if (urlPath === '/stream/film.mp4') {
    streamFileWithRange(req, res, VIDEO_PATH, 'video/mp4', null);
  } else if (urlPath === '/download/CodePixel-Web-Advertising-Film.mp4') {
    streamFileWithRange(req, res, VIDEO_PATH, 'video/mp4', 'CodePixel-Web-Advertising-Film.mp4');
  } else if (urlPath === '/download/master-audio.m4a') {
    streamFileWithRange(req, res, AUDIO_PATH, 'audio/mp4', 'CodePixel-Web-Master-Audio.m4a');
  } else if (urlPath === '/download/storyboard-script.md') {
    streamFileWithRange(req, res, DOC_PATH, 'text/markdown; charset=utf-8', 'PRODUCTION-STORYBOARD-AND-SCRIPT.md');
  } else if (urlPath === '/download/qa-sheet.png') {
    streamFileWithRange(req, res, QA_PATH, 'image/png', 'MP4-QA-Verification.png');
  } else if (urlPath === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', videoBytes: fs.statSync(VIDEO_PATH).size }));
  } else {
    res.writeHead(302, { Location: '/' });
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CodePixel Web Brand Film Studio listening on http://0.0.0.0:${PORT}`);
});
