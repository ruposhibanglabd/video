/**
 * Renderer — «সে আর মসজিদে আসে না» (Sahih al-Bukhari 516 · Nasa'i 1141 · Bukhari 660)
 *
 *   node render.mjs                 -> full MP4 + audio build + verify + SRT
 *   node render.mjs --still 46.2 --png out.png
 *   node render.mjs --thumb ../assets/thumbnail.png
 *
 * Frames: @napi-rs/canvas (Skia) -> rawvideo -> ffmpeg -> H.264 + AAC.
 * Audio : VO clips placed at scene starts + synthesized pad/SFX (no instruments
 *         under the recitation), loudnorm -14 LUFS.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  FPS, W, H, PAL, SCENES, TAIL, PHRASES, ARABIC_LINES,
  NODES_PROMISE, FOOTERS, SIGNATURE, TITLE, THUMB_REF,
} from './config.mjs';

const require = createRequire(import.meta.url);
const RENDER_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(RENDER_DIR, '..');
const ROOT = path.resolve(RENDER_DIR, '../../../..');
const ASSETS = path.join(PROJECT_DIR, 'assets');
const OUT_DIR = path.join(PROJECT_DIR, 'output');

const ffmpegPath = () => require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = () => require('@ffprobe-installer/ffprobe').path;

/* ------------------------------------------------------------------ */
/* Platform: fonts + images                                            */
/* ------------------------------------------------------------------ */
let napi = null;
const IMGS = {};
let AVATAR = null; // circular creator avatar with gold ring (brand watermark)

async function setupPlatform() {
  napi = await import('@napi-rs/canvas');
  const fonts = [
    ['public/fonts/NotoSansBengali-Regular.ttf', 'BNU'],
    ['public/fonts/NotoSansBengali-SemiBold.ttf', 'BNU'],
    ['public/fonts/NotoSansBengali-Bold.ttf', 'BNU'],
    ['public/fonts/NotoSansBengali-ExtraBold.ttf', 'BNU'],
    ['miqa/brand/fonts/TiroBangla-Regular.ttf', 'Tiro'],
    ['miqa/brand/fonts/TiroBangla-Italic.ttf', 'TiroI'],
    ['creative-studio/assets/fonts/amiri/Amiri-Regular.ttf', 'Amiri'],
    ['creative-studio/assets/fonts/amiri/AmiriQuran.ttf', 'AmiriQuran'],
    ['miqa/brand/fonts/CormorantGaramond-Italic.ttf', 'Cormorant'],
    ['public/fonts/Inter-SemiBold.ttf', 'Inter'],
  ];
  for (const [rel, fam] of fonts) {
    const p = path.join(ROOT, rel);
    if (fs.existsSync(p)) napi.GlobalFonts.registerFromPath(p, fam);
    else console.warn('[font missing]', rel);
  }
  for (const sc of SCENES) {
    const img = new napi.Image();
    img.src = fs.readFileSync(path.join(ASSETS, sc.bg));
    IMGS[sc.id] = img;
  }
  // brand avatar: circular face crop + gold ring
  const photo = new napi.Image();
  photo.src = fs.readFileSync(path.join(ROOT, 'creative-studio/assets/brand/creator-photo.jpg'));
  // napi-rs Image exposes width/height immediately but decodes pixels lazily —
  // draw, then verify a center pixel; retry with growing waits until non-blank.
  const S = 256, av = napi.createCanvas(S, S), ax = av.getContext('2d');
  const FACE = { cx: 367, cy: 452, side: 250 };
  let avatarOk = false;
  for (let attempt = 0; attempt < 10 && !avatarOk; attempt++) {
    await new Promise((r) => setTimeout(r, 150 + attempt * 120));
    ax.clearRect(0, 0, S, S);
    ax.save();
    ax.beginPath(); ax.arc(S / 2, S / 2, S / 2 - 6, 0, 7); ax.clip();
    ax.drawImage(photo, FACE.cx - FACE.side / 2, FACE.cy - FACE.side / 2, FACE.side, FACE.side, 0, 0, S, S);
    ax.restore();
    const px = ax.getImageData(S / 2, S / 2, 1, 1).data;
    avatarOk = px[3] > 0 && (px[0] + px[1] + px[2]) > 24;
  }
  if (!avatarOk) console.warn('[avatar] center pixel still blank after retries');
  ax.strokeStyle = '#E9C87E'; ax.lineWidth = 7; ax.globalAlpha = 0.9;
  ax.beginPath(); ax.arc(S / 2, S / 2, S / 2 - 8, 0, 7); ax.stroke();
  AVATAR = av;
  fs.writeFileSync(path.join(ROOT, 'creative-studio/assets/brand/avatar-ring.png'), av.toBuffer('image/png'));
}

/* ------------------------------------------------------------------ */
/* Timing model                                                        */
/* ------------------------------------------------------------------ */
function probeDuration(file) {
  const out = execFileSync(ffprobePath(), [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ], { encoding: 'utf8' });
  return parseFloat(out.trim());
}

function detectSilences(file) {
  return new Promise((resolve) => {
    const res = spawn(ffmpegPath(), [
      '-hide_banner', '-i', file, '-af', 'silencedetect=noise=-35dB:d=0.28', '-f', 'null', '-',
    ]);
    let log = '';
    res.stderr.on('data', (d) => { log += d.toString(); });
    res.on('close', () => {
      const pts = [];
      const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
      let m;
      while ((m = re.exec(log))) {
        const a = parseFloat(m[1]); const b = parseFloat(m[2]);
        if (b - a >= 0.28 && b > 0.5) pts.push((a + b) / 2);
      }
      resolve(pts);
    });
    res.on('error', () => resolve([]));
  });
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distribute phrase start times inside [0, dur], snapped to silence points. */
function anchorPhrases(texts, dur, silences) {
  const n = texts.length;
  if (n === 1) return [0.12];
  const lens = texts.map((t) => Math.max(4, t.length));
  const total = lens.reduce((a, b) => a + b, 0);
  const starts = [0.12];
  let acc = lens[0];
  const used = new Set();
  for (let i = 1; i < n; i++) {
    const guess = 0.12 + (acc / total) * (dur - 0.5);
    let best = null; let bestD = 0.65;
    silences.forEach((s, k) => {
      if (used.has(k)) return;
      const d = Math.abs(s - guess);
      if (d < bestD && s > starts[i - 1] + 0.6) { best = s; bestD = d; used.add(k); }
    });
    starts.push(best != null ? best : Math.max(guess, starts[i - 1] + 0.9));
    acc += lens[i];
  }
  return starts;
}

async function buildSchedule() {
  let cursor = 0;
  const scenes = [];
  for (const sc of SCENES) {
    const voPath = path.join(ASSETS, sc.vo);
    const voDur = probeDuration(voPath);
    const silences = await detectSilences(voPath);
    const dur = voDur + sc.leadIn;
    const entry = {
      ...sc, voPath, voDur, start: cursor + sc.leadIn, end: 0,
      phrases: [], arabicSlices: [],
    };
    entry.end = cursor + dur;
    const ph = PHRASES[sc.id] || [];
    if (ph.length) {
      const starts = anchorPhrases(ph.map((p) => p.t), voDur, silences);
      entry.phrases = ph.map((p, i) => ({ ...p, start: entry.start + starts[i] }));
    }
    if (sc.arabic) {
      const lens = ARABIC_LINES.map((l) => l.length);
      const tot = lens.reduce((a, b) => a + b, 0);
      let a0 = entry.start + 0.35; let acc = 0;
      entry.arabicSlices = ARABIC_LINES.map((line, i) => {
        const s = a0 + (acc / tot) * (voDur - 0.7);
        acc += lens[i];
        const e = a0 + (acc / tot) * (voDur - 0.7);
        return { line, start: s, end: e };
      });
    }
    scenes.push(entry);
    cursor = entry.end + sc.gapAfter;
  }
  const total = scenes[scenes.length - 1].end + TAIL;
  return { scenes, total };
}

const sceneAt = (sched, t) =>
  sched.scenes.find((s) => t >= s.start - s.leadIn && t < s.end + s.gapAfter) ||
  sched.scenes[sched.scenes.length - 1];

/* ------------------------------------------------------------------ */
/* Drawing helpers                                                     */
/* ------------------------------------------------------------------ */
const COOL_SCENES = new Set(['s3']);

function drawBG(ctx, scene, t, mode = 'push') {
  const img = IMGS[scene.id];
  const dur = Math.max(1, scene.end - scene.start + scene.gapAfter);
  const local = t - (scene.start - scene.leadIn);
  const p = clamp(local / dur);
  const zoom = mode === 'pull' ? lerp(1.12, 1.04, p) : lerp(1.04, 1.11, p);
  const scale = Math.max(W / img.width, H / img.height) * zoom;
  const dw = img.width * scale; const dh = img.height * scale;
  const panX = (W - dw) / 2 + Math.sin(p * Math.PI) * 14;
  const panY = (H - dh) / 2 + (p - 0.5) * -22;
  ctx.drawImage(img, panX, panY, dw, dh);
  // light theme: gentle warm veil + soft vignette (keeps images bright)
  ctx.fillStyle = 'rgba(255,251,240,0.07)';
  ctx.fillRect(0, 0, W, H);
  if (COOL_SCENES.has(scene.id)) {
    ctx.fillStyle = 'rgba(120,145,190,0.10)';
    ctx.fillRect(0, 0, W, H);
  }
  vignette(ctx, 0.16);
}

function vignette(ctx, a) {
  const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.22, W / 2, H * 0.5, H * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function glowText(ctx, text, x, y, font, color, glow = 0, align = 'center') {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (glow > 0) { ctx.shadowColor = `rgba(255,250,235,${0.8 * glow})`; ctx.shadowBlur = 30 * glow; }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

const PUNCT = /[—।…,!?;:.\"'«»“”]+$/;
function layoutWords(ctx, text, font, maxW, goldSet) {
  ctx.save(); ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const spaceW = ctx.measureText(' ').width;
  const lines = []; let line = []; let w = 0;
  for (const word of words) {
    const ww = ctx.measureText(word).width;
    if (line.length && w + spaceW + ww > maxW) { lines.push({ line, w }); line = []; w = 0; }
    line.push({ word, w: ww, gold: goldSet.has(word.replace(PUNCT, '')) });
    w += (w ? spaceW : 0) + ww;
  }
  if (line.length) lines.push({ line, w });
  ctx.restore();
  return { lines, spaceW };
}

/** Kinetic word-by-word phrase block. Returns nothing; draws. */
function drawPhrase(ctx, ph, t, { cx = W / 2, top = 0, font = `700 56px BNU, sans-serif`,
  maxW = 900, lineH = 82, alpha = 1, baseColor = null, hiColor = null } = {}) {
  const goldSet = new Set(ph.hi || []);
  const base = baseColor || (ph.ember ? PAL.ember : PAL.ink);
  const hiC = hiColor || (ph.ember ? PAL.emberDeep : PAL.goldInk);
  const { lines, spaceW } = layoutWords(ctx, ph.t, font, maxW, goldSet);
  let wi = 0;
  lines.forEach((L, li) => {
    let x = -L.w / 2;
    for (const wd of L.line) {
      const lt = (t - ph.start) - wi * 0.05;
      const a = smooth(lt / 0.30) * alpha;
      if (a > 0.001) {
        const dy = (1 - easeOut(lt / 0.38)) * 16;
        ctx.globalAlpha = a;
        glowText(ctx, wd.word, cx + x + wd.w / 2, top + li * lineH + dy,
          font, wd.gold ? hiC : base, wd.gold ? 0.9 : 0.25);
        ctx.globalAlpha = 1;
      }
      x += wd.w + spaceW;
      wi++;
    }
  });
}

/** Rolling: phrase visible from its start until next phrase start + 0.55s. */
function drawRolling(ctx, scene, t, opts) {
  const phs = scene.phrases;
  phs.forEach((ph, i) => {
    const next = phs[i + 1];
    const outro = next ? next.start - 0.10 : scene.end + 10;
    if (t < ph.start - 0.1 || t > outro) return;
    const aIn = smooth((t - ph.start) / 0.35);
    const aOut = next ? 1 - smooth((t - (outro - 0.45)) / 0.45) : 1;
    drawPhrase(ctx, ph, t, { ...opts, alpha: Math.min(aIn, aOut) });
  });
}

function drawFooter(ctx, text) {
  ctx.save();
  ctx.font = `600 40px Inter, BNU, sans-serif`;
  const tw = ctx.measureText(text).width;
  ctx.globalAlpha = 0.42;
  panel(ctx, 90 + tw / 2, 1784, tw + 44, 62, 16);
  ctx.fillStyle = 'rgba(251,246,234,1)';
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 6;
  ctx.fillStyle = 'rgba(138,106,31,0.95)';
  ctx.fillText(text, 90, 1784);
  ctx.restore();
}

/** Gentle floating dust (warm scenes). */
function drawDust(ctx, t, seed, n = 22, color = PAL.goldInk) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const bx = rnd() * W; const sp = 16 + rnd() * 26; const ph0 = rnd() * 9;
    const yy = H - ((t * sp + ph0 * 160) % (H + 80));
    ctx.globalAlpha = 0.20 + 0.16 * Math.sin(t * 2 + i);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(bx, yy, 1.5 + rnd() * 1.5, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* ------------------------------------------------------------------ */
/* Scene painters                                                      */
/* ------------------------------------------------------------------ */
const painters = {
  // S1 HOOK — mosque at Maghrib, children running; stacked persistent phrases
  s1(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    drawDust(ctx, t, 11);
    const phs = scene.phrases;
    if (phs[0]) drawPhrase(ctx, phs[0], t, { top: 620, font: `700 62px BNU, sans-serif` });
    if (phs[1]) drawPhrase(ctx, phs[1], t, { top: 750, font: `700 62px BNU, sans-serif` });
  },

  // S2 THE MISTAKE — the scolding; quote in ember, heartbeat-stop tension
  s2(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    const [q0, q1, q2] = scene.phrases;
    if (q0) drawPhrase(ctx, q0, t, { top: 480, font: `400 50px Tiro, sans-serif`, hiColor: PAL.ember });
    if (q1) {
      // ember pulse behind the quote as it lands
      if (t > q1.start + 0.1) {
        const k = Math.sin(clamp((t - q1.start - 0.1) / 1.0) * Math.PI);
        const g = ctx.createRadialGradient(540, 1080, 40, 540, 1080, 560);
        g.addColorStop(0, `rgba(224,138,74,${0.22 * k})`);
        g.addColorStop(1, 'rgba(224,138,74,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      drawPhrase(ctx, q1, t, {
        top: 1040, font: `800 72px BNU, sans-serif`, maxW: 920, lineH: 96,
        baseColor: PAL.ember, hiColor: PAL.ember,
      });
    }
    if (q2) drawPhrase(ctx, q2, t, { top: 1500, font: `700 50px BNU, sans-serif` });
  },

  // S3 CONSEQUENCE — cold walk away; title line lands big
  s3(ctx, scene, t) {
    drawBG(ctx, scene, t, 'pull');
    const [p0, p1] = scene.phrases;
    if (p0) drawPhrase(ctx, p0, t, { top: 620, font: `700 58px BNU, sans-serif` });
    if (p1) {
      drawPhrase(ctx, p1, t, { top: 830, font: `800 88px BNU, sans-serif`, maxW: 940, lineH: 116 });
      // faint cold glow behind the title line
      if (t > p1.start + 0.3) {
        const a = smooth((t - p1.start - 0.3) / 0.8);
        ctx.save(); ctx.globalAlpha = a;
        const g = ctx.createRadialGradient(540, 830, 30, 540, 830, 480);
        g.addColorStop(0, 'rgba(143,165,200,0.10)');
        g.addColorStop(1, 'rgba(143,165,200,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 430, W, 800);
        ctx.restore();
      }
    }
  },

  // S4 THE TURN — rhetorical question into gold
  s4(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    const [p0, p1] = scene.phrases;
    if (p0) drawPhrase(ctx, p0, t, { top: 660, font: `400 52px Tiro, sans-serif` });
    // gold rule draws itself between the phrases
    if (p1) {
      const rp = easeInOut(clamp((t - p1.start + 0.5) / 0.9));
      if (rp > 0) {
        ctx.save();
        ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(246,220,158,0.8)'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(540 - 220 * rp, 800); ctx.lineTo(540 + 220 * rp, 800); ctx.stroke();
        ctx.restore();
      }
      drawPhrase(ctx, p1, t, { top: 920, font: `800 78px BNU, sans-serif`, baseColor: PAL.goldInk });
    }
  },

  // S5 ARABIC — Bukhari 516, RTL reveal, no music (audio handled in buildAudio)
  s5(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    const font = `60px AmiriQuran, Amiri, serif`;
    ctx.save();
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lineH = 124; const y0 = 780;
    scene.arabicSlices.forEach((sl, i) => {
      const lp = clamp((t - sl.start) / Math.max(0.4, (sl.end - sl.start) * 0.85));
      if (lp <= 0) return;
      const y = y0 + i * lineH;
      const wLine = ctx.measureText(sl.line).width;
      ctx.save();
      ctx.beginPath();
      ctx.rect(540 + wLine / 2 + 30 - (wLine + 60) * easeInOut(lp), y - lineH / 2, (wLine + 60) * easeInOut(lp), lineH);
      ctx.clip();
      ctx.shadowColor = 'rgba(255,252,240,0.9)'; ctx.shadowBlur = 26;
      ctx.fillStyle = PAL.goldInk;
      ctx.fillText(sl.line, 540, y);
      ctx.restore();
    });
    // flourish after last line
    const last = scene.arabicSlices[scene.arabicSlices.length - 1];
    if (last && t > last.end - 0.2) {
      const fp = smooth((t - last.end + 0.2) / 0.8);
      ctx.globalAlpha = fp;
      ctx.strokeStyle = PAL.goldInk; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      const fy = y0 + (scene.arabicSlices.length - 1) * lineH + 66;
      ctx.beginPath(); ctx.moveTo(540 - 150 * fp, fy); ctx.lineTo(540 + 150 * fp, fy); ctx.stroke();
      ctx.beginPath(); ctx.arc(540, fy, 5.5, 0, 7);
      ctx.fillStyle = PAL.goldInk; ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    drawFooter(ctx, FOOTERS.s5);
  },

  // S6 WHAT HE ﷺ DID — symbolic (no depiction); rolling narration
  s6(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    drawDust(ctx, t, 23, 18);
    drawRolling(ctx, scene, t, { top: 560, font: `700 54px BNU, sans-serif`, lineH: 78 });
    drawFooter(ctx, FOOTERS.s6);
  },

  // S7 THE PROMISE — two of the seven under Allah's shade
  s7(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    // soft light veil so the ink text survives the bright sky
    const band = ctx.createLinearGradient(0, 300, 0, 860);
    band.addColorStop(0, 'rgba(251,246,234,0.62)');
    band.addColorStop(1, 'rgba(251,246,234,0)');
    ctx.fillStyle = band; ctx.fillRect(0, 300, W, 560);
    const [p1, p2] = scene.phrases;
    if (p1) drawPhrase(ctx, p1, t, { top: 460, font: `800 72px BNU, sans-serif` });
    if (p2) drawPhrase(ctx, p2, t, { top: 640, font: `700 52px BNU, sans-serif` });
    const nodeT = [
      p2 ? p2.start + 0.7 : scene.start + 3,
      p2 ? p2.start + 2.1 : scene.start + 5,
    ];
    drawPathGraph(ctx, NODES_PROMISE, nodeT, t, {
      stroke: PAL.goldDeep, glowC: 'rgba(176,138,62,', labelFont: `700 52px BNU, sans-serif`, labelC: PAL.ink, dir: 1,
    });
    drawFooter(ctx, FOOTERS.s7);
  },

  // S8 THE MESSAGE — love, not scolding
  s8(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    drawRolling(ctx, scene, t, { top: 860, font: `800 64px BNU, sans-serif`, lineH: 92 });
    const lastP = scene.phrases[scene.phrases.length - 1];
    if (lastP && t > lastP.start + 1.0) {
      const k = 0.5 + 0.2 * Math.sin(t * 1.4);
      const g = ctx.createRadialGradient(540, 860, 30, 540, 860, 620);
      g.addColorStop(0, `rgba(246,220,158,${0.13 * k})`);
      g.addColorStop(1, 'rgba(246,220,158,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  },

  // S9 CLOSE — the boy returns at dawn; title payoff
  s9(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    drawDust(ctx, t, 31, 18);
    // soft paper veil behind the text zone (bright sky behind)
    const veil = ctx.createLinearGradient(0, 460, 0, 1020);
    veil.addColorStop(0, 'rgba(251,246,234,0)');
    veil.addColorStop(0.5, 'rgba(251,246,234,0.42)');
    veil.addColorStop(1, 'rgba(251,246,234,0)');
    ctx.fillStyle = veil; ctx.fillRect(0, 460, W, 560);
    const [p0, p1] = scene.phrases;
    if (p0) drawPhrase(ctx, p0, t, { top: 620, font: `700 58px BNU, sans-serif` });
    if (p1) {
      drawPhrase(ctx, p1, t, { top: 800, font: `800 96px BNU, sans-serif`, maxW: 940, lineH: 124 });
      if (t > p1.start + 0.9) {
        const k = 0.6 + 0.25 * Math.sin(t * 1.2);
        const g = ctx.createRadialGradient(540, 800, 30, 540, 800, 560);
        g.addColorStop(0, `rgba(246,220,158,${0.12 * k})`);
        g.addColorStop(1, 'rgba(246,220,158,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 400, W, 800);
      }
    }
  },
};

function panel(ctx, cx, cy, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy - h / 2);
  ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r);
  ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r);
  ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r);
  ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r);
  ctx.closePath();
}

function drawPathGraph(ctx, nodes, nodeT, t, { stroke, glowC, labelFont, labelC, dir }) {
  for (let i = 0; i < nodes.length - 1; i++) {
    const t0 = nodeT[i]; const t1 = nodeT[i + 1];
    const p = clamp((t - t0 - 0.25) / Math.max(0.5, t1 - t0));
    if (p <= 0) continue;
    const [x0, y0] = [nodes[i].x, nodes[i].y];
    const [x1, y1] = [nodes[i + 1].x, nodes[i + 1].y];
    ctx.save();
    ctx.strokeStyle = stroke; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.shadowColor = glowC + '0.7)'; ctx.shadowBlur = 16;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    const my = (y0 + y1) / 2;
    const steps = 24; const n = Math.max(2, Math.floor(steps * easeInOut(p)));
    for (let s = 1; s <= n; s++) {
      const u = s / steps;
      const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * ((x0 + x1) / 2 + 60 * dir) + u * u * x1;
      const by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
    ctx.restore();
  }
  nodes.forEach((nd, i) => {
    const lt = t - nodeT[i];
    if (lt <= 0) return;
    const a = smooth(lt / 0.5);
    const pulse = 1 + 0.08 * Math.sin(t * 3 + i);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.shadowColor = glowC + '0.9)'; ctx.shadowBlur = 30;
    ctx.fillStyle = stroke;
    ctx.beginPath(); ctx.arc(nd.x, nd.y, 17 * pulse, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = stroke; ctx.lineWidth = 2.6; ctx.globalAlpha = a * 0.8;
    ctx.beginPath(); ctx.arc(nd.x, nd.y, 30 * pulse, 0, 7); ctx.stroke();
    ctx.restore();
    // soft paper plate behind the label so it survives bright backgrounds
    const lx = nd.x + (dir > 0 ? 40 : -40); const ly = nd.y + 74;
    ctx.save();
    ctx.globalAlpha = a * 0.62;
    ctx.font = labelFont;
    const lw = ctx.measureText(nd.label).width;
    panel(ctx, lx, ly, lw + 56, 76, 20);
    ctx.fillStyle = 'rgba(251,246,234,1)';
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = a;
    glowText(ctx, nd.label, lx, ly, labelFont, labelC, 0.35);
    ctx.restore();
  });
}

/** Persistent brand watermark: avatar + name, bottom-right, one fixed place. */
function drawWatermark(ctx, t, sched) {
  const fadeIn = smooth(t / 0.8);
  const finalFade = smooth((t - (sched.total - 0.7)) / 0.7);
  const a = 0.62 * fadeIn * (1 - finalFade);
  if (a <= 0.01) return;
  const size = 72, cx = 1004, cy = 1784;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.drawImage(AVATAR, cx - size / 2, cy - size / 2, size, size);
  ctx.font = `italic 500 34px Cormorant, serif`;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.65)'; ctx.shadowBlur = 6;
  ctx.fillStyle = 'rgba(22,56,42,0.92)';
  ctx.fillText(SIGNATURE, cx - size / 2 - 16, cy + 1);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Frame compositor + transitions                                      */
/* ------------------------------------------------------------------ */
const CUT_AFTER = new Set(['s2']); // s2 -> s3 hard contrast cut

function paintFrame(ctx, sched, t) {
  const scene = sceneAt(sched, t);
  ctx.fillStyle = PAL.emeraldDeep;
  ctx.fillRect(0, 0, W, H);
  painters[scene.id](ctx, scene, t, sched);
  // scene-boundary fades (through black), except registered cuts
  const idx = sched.scenes.indexOf(scene);
  const next = sched.scenes[idx + 1];
  const fd = 0.4;
  if (next && !CUT_AFTER.has(scene.id)) {
    const out = (t - (scene.end + scene.gapAfter - fd)) / fd;
    if (out > 0) { ctx.fillStyle = `rgba(251,246,234,${smooth(out)})`; ctx.fillRect(0, 0, W, H); }
  }
  const into = (t - (scene.start - scene.leadIn)) / fd;
  if (idx > 0 && !CUT_AFTER.has(sched.scenes[idx - 1].id) && into < 1) {
    ctx.fillStyle = `rgba(251,246,234,${1 - smooth(into)})`; ctx.fillRect(0, 0, W, H);
  }
  if (t > sched.total - 0.7) { // final fade
    ctx.fillStyle = `rgba(0,0,0,${smooth((t - (sched.total - 0.7)) / 0.7)})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawWatermark(ctx, t, sched);
}

/* ------------------------------------------------------------------ */
/* Audio build                                                         */
/* ------------------------------------------------------------------ */
function buildAudio(sched) {
  const A = [];
  const filters = [];
  const mixLabels = [];
  let inCount = 0;
  const addIn = (args) => { A.push(...args); return inCount++; };

  // VO inputs
  sched.scenes.forEach((sc, i) => {
    const idx = addIn(['-i', sc.voPath]);
    const ms = Math.round(sc.start * 1000);
    const L = `v${i}`;
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,adelay=${ms}|${ms}[${L}]`);
    mixLabels.push(`[${L}]`);
  });

  const s5 = sched.scenes.find((s) => s.id === 's5');
  const padExpr = '0.55*sin(2*PI*110*t)+0.35*sin(2*PI*164.81*t)+0.30*sin(2*PI*220*t)+0.25*sin(2*PI*55*t)';
  // pad part 1 (before recitation)
  {
    const d = s5.start;
    const idx = addIn(['-f', 'lavfi', '-i', `aevalsrc=exprs=${padExpr}:s=48000:d=${d.toFixed(3)}`]);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=2.5,afade=t=out:st=${(d - 1.2).toFixed(3)}:d=1.2,volume=0.045[pad0]`);
    mixLabels.push('[pad0]');
  }
  // pad part 2 (after recitation)
  {
    const d = sched.total - s5.end;
    const ms = Math.round(s5.end * 1000);
    const idx = addIn(['-f', 'lavfi', '-i', `aevalsrc=exprs=${padExpr}:s=48000:d=${d.toFixed(3)}`]);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=1.2,afade=t=out:st=${(d - 2.2).toFixed(3)}:d=2.2,volume=0.045,adelay=${ms}|${ms}[pad1]`);
    mixLabels.push('[pad1]');
  }

  // chimes on the two promise nodes (S7)
  const s7 = sched.scenes.find((s) => s.id === 's7');
  const s2 = sched.scenes.find((s) => s.id === 's2');
  const s9 = sched.scenes.find((s) => s.id === 's9');
  const chimes = [];
  if (s7?.phrases.length >= 2) {
    chimes.push({ t: s7.phrases[1].start + 0.7, f: 1174.7, d: 0.8, g: 0.26 });
    chimes.push({ t: s7.phrases[1].start + 2.1, f: 1318.5, d: 1.0, g: 0.28 });
  }
  chimes.forEach((c, k) => {
    const idx = addIn(['-f', 'lavfi', '-i', `sine=frequency=${c.f}:duration=${c.d}:sample_rate=48000`]);
    const dec = (Math.LN2 * 8).toFixed(3);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,volume=exp(-${dec}*t):eval=frame,volume=${c.g},adelay=${Math.round(c.t * 1000)}|${Math.round(c.t * 1000)}[ch${k}]`);
    mixLabels.push(`[ch${k}]`);
  });

  // sub swells: opening, the scolding thud, into recitation, final close
  const swells = [
    { t: 0.25, f: 55, d: 1.8, g: 0.5 },
    { t: s2.phrases[1] ? s2.phrases[1].start - 0.05 : s2.start + 1, f: 48, d: 1.2, g: 0.6 },
    { t: Math.max(0, s5.start - 0.4), f: 65, d: 1.4, g: 0.4 },
    { t: s9.start - 0.1, f: 55, d: 2.4, g: 0.45 },
  ];
  swells.forEach((s, k) => {
    const idx = addIn(['-f', 'lavfi', '-i', `sine=frequency=${s.f}:duration=${s.d}:sample_rate=48000`]);
    const env = `t*(${s.d}-t)*${(4 / (s.d * s.d)).toFixed(4)}`;
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,volume=${env}:eval=frame,volume=${s.g},adelay=${Math.round(s.t * 1000)}|${Math.round(s.t * 1000)}[sw${k}]`);
    mixLabels.push(`[sw${k}]`);
  });

  filters.push(`${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=longest,volume=${Math.min(20, mixLabels.length * 0.85).toFixed(1)},loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.891,aformat=sample_rates=48000:channel_layouts=stereo[aout]`);

  const out = path.join(OUT_DIR, 'audio-track.wav');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  execFileSync(ffmpegPath(), [
    '-hide_banner', '-loglevel', 'error', '-y', ...A,
    '-filter_complex', filters.join(';'),
    '-map', '[aout]', '-t', sched.total.toFixed(3), '-c:a', 'pcm_s16le', out,
  ], { stdio: ['ignore', 'inherit', 'inherit'] });
  return out;
}

/* ------------------------------------------------------------------ */
/* SRT                                                                 */
/* ------------------------------------------------------------------ */
const srtT = (s) => {
  const ms = Math.round((s % 1) * 1000);
  const t = Math.floor(s);
  return `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

function writeSRT(sched) {
  let n = 1; const cues = [];
  for (const sc of sched.scenes) {
    if (sc.arabic) {
      sc.arabicSlices.forEach((sl) => {
        cues.push([sl.start, sl.end, sl.line]);
      });
      continue;
    }
    sc.phrases.forEach((ph, i) => {
      const next = sc.phrases[i + 1];
      cues.push([ph.start, next ? next.start - 0.08 : sc.end - 0.15, ph.t]);
    });
  }
  const body = cues.map(([a, b, txt]) => `${n++}\n${srtT(a)} --> ${srtT(b)}\n${txt}\n`).join('\n');
  const p = path.join(OUT_DIR, 'Masjid-Shishu-Bukhari-516.srt');
  fs.writeFileSync(p, body, 'utf8');
  return p;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
async function main() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      args[k] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : 'true';
    }
  }
  await setupPlatform();
  const sched = await buildSchedule();
  console.log(JSON.stringify({ total: sched.total.toFixed(2), scenes: sched.scenes.map((s) => ({ id: s.id, start: +s.start.toFixed(2), end: +s.end.toFixed(2) })) }));

  const canvas = napi.createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  if (args.still) {
    const t = parseFloat(args.still);
    paintFrame(ctx, sched, t);
    fs.mkdirSync(path.dirname(args.png), { recursive: true });
    fs.writeFileSync(args.png, canvas.toBuffer('image/png'));
    console.log('still ->', args.png);
    return;
  }

  if (args.thumb) {
    // thumbnail: dawn-walk bg + title + reference + brand mark
    const s9 = sched.scenes.find((s) => s.id === 's9');
    drawBG(ctx, s9, s9.start + 2.0, 'push');
    const band = ctx.createLinearGradient(0, 0, 0, 900);
    band.addColorStop(0, 'rgba(251,246,234,0.60)');
    band.addColorStop(1, 'rgba(251,246,234,0)');
    ctx.fillStyle = band; ctx.fillRect(0, 0, W, 900);
    const tp = { t: TITLE, hi: ['মসজিদে'], start: -9 };
    drawPhrase(ctx, tp, 0, { top: 460, font: `800 88px BNU, sans-serif`, maxW: 940, lineH: 118 });
    // soft plate behind subtitle + reference for contrast on the field
    const plate = ctx.createLinearGradient(0, 860, 0, 1110);
    plate.addColorStop(0, 'rgba(251,246,234,0)');
    plate.addColorStop(0.5, 'rgba(251,246,234,0.55)');
    plate.addColorStop(1, 'rgba(251,246,234,0)');
    ctx.fillStyle = plate; ctx.fillRect(0, 860, W, 250);
    glowText(ctx, 'মসজিদে শিশুদের ধমক নয় — ভালোবাসা', 540, 940, `600 46px BNU, sans-serif`, PAL.ink, 0.3);
    glowText(ctx, THUMB_REF, 540, 1040, `600 44px Inter, BNU, sans-serif`, PAL.goldInk, 0.5);
    ctx.save();
    ctx.drawImage(AVATAR, 1004 - 40, 1760 - 40, 80, 80);
    ctx.font = `italic 500 42px Cormorant, serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(22,56,42,0.92)';
    ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 6;
    ctx.fillText(SIGNATURE, 1004 - 56, 1762);
    ctx.restore();
    fs.mkdirSync(path.dirname(args.thumb), { recursive: true });
    fs.writeFileSync(args.thumb, canvas.toBuffer('image/png'));
    console.log('thumb ->', args.thumb);
    return;
  }

  const audio = buildAudio(sched);
  const srt = writeSRT(sched);
  const out = path.join(OUT_DIR, 'Masjid-Shishu-Bukhari-516-Final.mp4');
  const temp = out.replace(/\.mp4$/, '.part.mp4');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const ff = spawn(ffmpegPath(), [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.2', '-g', String(FPS * 2),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart',
    '-metadata', 'title=সে আর মসজিদে আসে না — সহীহ বুখারী ৫১৬',
    '-metadata', 'comment=Abdur Rahman Nayeem — Creative Studio',
    temp,
  ], { stdio: ['pipe', 'inherit', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', (d) => { ffErr += d.toString(); });
  const done = new Promise((res, rej) => {
    ff.on('close', (c) => (c === 0 ? res() : rej(new Error('FFMPEG: ' + ffErr.slice(-400)))));
    ff.on('error', rej);
  });

  const totalFrames = Math.round(sched.total * FPS);
  const started = Date.now();
  for (let f = 0; f < totalFrames; f++) {
    paintFrame(ctx, sched, f / FPS);
    const raw = canvas.data ? canvas.data() : ctx.getImageData(0, 0, W, H).data;
    if (!ff.stdin.write(Buffer.from(raw))) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) {
      const el = (Date.now() - started) / 1000;
      console.log(JSON.stringify({ frame: f, totalFrames, pct: +(100 * f / totalFrames).toFixed(1), fps: +(f / Math.max(0.1, el)).toFixed(1) }));
    }
  }
  ff.stdin.end();
  await done;
  fs.renameSync(temp, out);

  const verify = JSON.parse(execFileSync(ffprobePath(), [
    '-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,width,height', '-of', 'json', out,
  ], { encoding: 'utf8' }));
  const v = (verify.streams || []).find((s) => s.codec_type === 'video');
  const a = (verify.streams || []).find((s) => s.codec_type === 'audio');
  console.log(JSON.stringify({
    done: true, out, srt, duration: verify.format.duration,
    video: v && `${v.codec_name} ${v.width}x${v.height}`, audio: a && a.codec_name,
    sizeMB: +(verify.format.size / 1048576).toFixed(1),
    renderSec: Math.round((Date.now() - started) / 1000),
  }));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
