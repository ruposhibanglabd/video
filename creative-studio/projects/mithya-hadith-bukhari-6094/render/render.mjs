/**
 * Renderer — «তোমার নামের পাশে কী লেখা হচ্ছে?» (Sahih al-Bukhari 6094)
 *
 *   node render.mjs                 -> full MP4 + audio build + verify + SRT
 *   node render.mjs --still 46.2 --png out.png
 *   node render.mjs --thumb ../assets/thumb.png
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
  NODES_LIGHT, NODES_EMBER, SIGNATURE, REFERENCE_CARD, TITLE,
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
  // napi-rs Image decodes asynchronously — let it settle before drawing
  await new Promise((r) => setTimeout(r, 150));
  const S = 256, av = napi.createCanvas(S, S), ax = av.getContext('2d');
  const FACE = { cx: 367, cy: 452, side: 250 };
  ax.save();
  ax.beginPath(); ax.arc(S / 2, S / 2, S / 2 - 6, 0, 7); ax.clip();
  ax.drawImage(photo, FACE.cx - FACE.side / 2, FACE.cy - FACE.side / 2, FACE.side, FACE.side, 0, 0, S, S);
  ax.restore();
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
  // grade overlay
  const dark = ['s1', 's2', 's3', 's4', 's7'].includes(scene.id);
  const darkAmt = scene.id === 's2' ? 0.30 : 0.20;
  ctx.fillStyle = dark ? `rgba(5,16,12,${darkAmt})` : 'rgba(233,200,126,0.05)';
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, dark ? 0.42 : 0.30);
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
  if (glow > 0) { ctx.shadowColor = `rgba(246,220,158,${0.75 * glow})`; ctx.shadowBlur = 34 * glow; }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

const PUNCT = /[—।…,!?;:."'\u201C\u201D]+$/;
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
  maxW = 900, lineH = 82, alpha = 1 } = {}) {
  const goldSet = new Set(ph.hi || []);
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
          font, wd.gold ? PAL.gold : PAL.ivory, wd.gold ? 0.9 : 0.25);
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

function panel(ctx, cx, cy, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy - h / 2);
  ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r);
  ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r);
  ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r);
  ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r);
  ctx.closePath();
}

/* ------------------------------------------------------------------ */
/* Scene painters                                                      */
/* ------------------------------------------------------------------ */
const painters = {
  s1(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    // golden ink stroke writing itself (lower third)
    const p = easeInOut(clamp((t - scene.start - 0.45) / 3.2));
    if (p > 0) {
      const pts = []; const rnd = mulberry32(7);
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        pts.push([lerp(180, 900, u), 1470 + Math.sin(u * 6.2) * 26 + (rnd() - 0.5) * 8]);
      }
      ctx.save();
      ctx.strokeStyle = PAL.gold; ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(246,220,158,0.85)'; ctx.shadowBlur = 22;
      ctx.lineWidth = 5;
      ctx.beginPath();
      const n = Math.max(2, Math.floor(pts.length * p));
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      // nib dot + particles
      const tip = pts[n - 1];
      ctx.beginPath(); ctx.arc(tip[0], tip[1], 8, 0, 7); ctx.fillStyle = PAL.goldBright; ctx.fill();
      ctx.restore();
      // rising dust
      const rnd2 = mulberry32(11);
      for (let i = 0; i < 26; i++) {
        const bx = rnd2() * W; const sp = 20 + rnd2() * 30; const ph0 = rnd2() * 9;
        const yy = H - ((t * sp + ph0 * 160) % (H + 80));
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + i);
        ctx.fillStyle = PAL.gold;
        ctx.beginPath(); ctx.arc(bx, yy, 1.6 + rnd2() * 1.6, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    // stacked persistent phrases, upper-middle
    const phs = scene.phrases;
    if (phs[0]) drawPhrase(ctx, phs[0], t, { top: 620, font: `700 62px BNU, sans-serif` });
    if (phs[1]) drawPhrase(ctx, phs[1], t, { top: 740, font: `700 62px BNU, sans-serif` });
  },

  s2(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    // light pulse on "কী"
    const ki = scene.phrases[1];
    if (ki && t > ki.start + 0.2) {
      const k = Math.sin(clamp((t - ki.start - 0.2) / 0.9) * Math.PI);
      const g = ctx.createRadialGradient(540, 1330, 40, 540, 1330, 560);
      g.addColorStop(0, `rgba(246,220,158,${0.30 * k})`);
      g.addColorStop(1, 'rgba(246,220,158,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (scene.phrases[0]) drawPhrase(ctx, scene.phrases[0], t, { top: 470, font: `400 50px Tiro, sans-serif` });
    if (scene.phrases[1]) drawPhrase(ctx, scene.phrases[1], t, { top: 1330, font: `800 84px BNU, sans-serif` });
  },

  s3(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    const a = smooth(t / 0.7);
    // card
    ctx.save(); ctx.globalAlpha = a;
    const cy = 830;
    panel(ctx, 540, cy, 800, 560, 26);
    ctx.fillStyle = PAL.emeraldPanel; ctx.fill();
    ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; ctx.stroke();
    panel(ctx, 540, cy, 776, 536, 20);
    ctx.strokeStyle = 'rgba(233,200,126,0.55)'; ctx.lineWidth = 1.4; ctx.stroke();
    // header phrase on card
    const p0 = scene.phrases[0];
    if (p0) {
      const lt = clamp((t - p0.start) / 0.5);
      ctx.globalAlpha = a * smooth(lt);
      glowText(ctx, 'রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম', 540, cy - 170,
        `700 44px BNU, sans-serif`, PAL.ivory, 0.3);
    }
    // gold rule draws itself
    const rp = easeInOut(clamp((t - scene.start - 2.2) / 1.1));
    if (rp > 0) {
      ctx.globalAlpha = a;
      ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(246,220,158,0.8)'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(540 - 260 * rp, cy - 80); ctx.lineTo(540 + 260 * rp, cy - 80); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // references
    const ra = smooth(clamp((t - scene.start - 3.0) / 0.8));
    if (ra > 0) {
      ctx.globalAlpha = a * ra;
      glowText(ctx, REFERENCE_CARD[0], 540, cy + 30, `600 48px Inter, BNU, sans-serif`, PAL.gold, 0.5);
      glowText(ctx, REFERENCE_CARD[1], 540, cy + 110, `600 48px Inter, BNU, sans-serif`, PAL.gold, 0.5);
      glowText(ctx, 'মান: সহীহ (মুত্তাফাক আলাইহি)', 540, cy + 205, `400 40px Tiro, sans-serif`, PAL.ivoryDim, 0);
    }
    ctx.restore();
    // second phrase under card
    if (scene.phrases[1]) drawRolling(ctx, { ...scene, phrases: [scene.phrases[1]] }, t,
      { top: 1430, font: `700 56px BNU, sans-serif` });
  },

  s4(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    const font = `62px AmiriQuran, Amiri, serif`;
    ctx.save();
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lineH = 118; const y0 = 610;
    scene.arabicSlices.forEach((sl, i) => {
      const lp = clamp((t - sl.start) / (sl.end - sl.start));
      if (lp <= 0) return;
      const y = y0 + i * lineH;
      const wLine = ctx.measureText(sl.line).width;
      // reveal right-to-left via clip
      ctx.save();
      ctx.beginPath();
      ctx.rect(540 + wLine / 2 + 30 - (wLine + 60) * easeInOut(lp), y - lineH / 2, (wLine + 60) * easeInOut(lp), lineH);
      ctx.clip();
      ctx.shadowColor = 'rgba(246,220,158,0.65)'; ctx.shadowBlur = 26;
      ctx.fillStyle = PAL.goldBright;
      ctx.fillText(sl.line, 540, y);
      ctx.restore();
    });
    // flourish after last line
    const last = scene.arabicSlices[scene.arabicSlices.length - 1];
    if (last && t > last.end - 0.2) {
      const fp = smooth((t - last.end + 0.2) / 0.8);
      ctx.globalAlpha = fp;
      ctx.strokeStyle = PAL.gold; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(540 - 150 * fp, y0 + 5 * lineH + 66); ctx.lineTo(540 + 150 * fp, y0 + 5 * lineH + 66); ctx.stroke();
      ctx.beginPath(); ctx.arc(540, y0 + 5 * lineH + 66, 5.5, 0, 7);
      ctx.fillStyle = PAL.goldBright; ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.font = `600 40px Inter, BNU, sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(233,200,126,0.66)';
    ctx.fillText('সহীহ বুখারী · ৬০৯৪', 90, 1784);
    ctx.restore();
  },

  s5(ctx, scene, t) {
    drawBG(ctx, scene, t, 'push');
    const [p1, p2, , p4] = scene.phrases;
    const nodeT = [
      p1 ? p1.start + 0.30 : 0,
      p2 ? p2.start + 0.15 : 0,
      p2 ? p2.start + Math.max(0.9, p2.endGuess || 1.6) : 0,
    ];
    drawPathGraph(ctx, NODES_LIGHT, nodeT, t, {
      stroke: PAL.gold, glowC: 'rgba(246,220,158,', labelFont: `700 58px BNU, sans-serif`, labelC: PAL.ivory, dir: 1,
    });
    // big landing word (with soft dark plate — sun zone is bright)
    if (p4 && t > p4.start + 0.3) {
      const a = smooth((t - p4.start - 0.3) / 0.6);
      const sc2 = 1 + (1 - easeOut((t - p4.start - 0.3) / 0.7)) * 0.18;
      ctx.save(); ctx.globalAlpha = a;
      const plate = ctx.createRadialGradient(540, 620, 40, 540, 620, 400);
      plate.addColorStop(0, 'rgba(5,16,12,0.52)');
      plate.addColorStop(1, 'rgba(5,16,12,0)');
      ctx.fillStyle = plate;
      ctx.fillRect(0, 220, W, 800);
      ctx.translate(540, 620); ctx.scale(sc2, sc2);
      glowText(ctx, 'সিদ্দীক', 0, 0, `800 120px BNU, sans-serif`, PAL.goldBright, 1);
      ctx.restore();
    }
    drawRolling(ctx, scene, t, { top: 1500, font: `700 54px BNU, sans-serif` });
  },

  s6(ctx, scene, t) {
    drawBG(ctx, scene, t, 'pull');
    const [p1, p2, p3] = scene.phrases;
    const nodeT = [
      p1 ? p1.start + 0.25 : 0,
      p2 ? p2.start + 0.9 : 0,
      p3 ? p3.start + 0.9 : 0,
    ];
    drawPathGraph(ctx, NODES_EMBER, nodeT, t, {
      stroke: PAL.ember, glowC: 'rgba(224,138,74,', labelFont: `700 58px BNU, sans-serif`, labelC: '#F0D9C4', dir: -1,
    });
    drawRolling(ctx, scene, t, { top: 1500, font: `700 54px BNU, sans-serif` });
  },

  s7(ctx, scene, t) {
    drawBG(ctx, scene, t, 'pull');
    const [p1, p2, p3] = scene.phrases;
    // left name (recall of সিদ্দীক) — fades in complete
    const aL = smooth((t - scene.start - 0.2) / 0.9);
    ctx.save(); ctx.globalAlpha = aL;
    glowText(ctx, 'صِدِّيقًا', 290, 830, `130px AmiriQuran, Amiri, serif`, PAL.goldBright, 1);
    glowText(ctx, 'সিদ্দীক · মহাসত্যবাদী', 290, 975, `600 42px BNU, sans-serif`, PAL.gold, 0.5);
    ctx.restore();
    // right name writes itself during p2
    if (p2) {
      const wp = easeInOut(clamp((t - p2.start - 0.5) / 2.2));
      if (wp > 0) {
        const font = `130px AmiriQuran, Amiri, serif`;
        ctx.save(); ctx.font = font;
        const word = 'كَذَّابًا';
        const wW = ctx.measureText(word).width;
        ctx.beginPath();
        ctx.rect(790 + wW / 2 + 24 - (wW + 48) * wp, 830 - 100, (wW + 48) * wp, 200);
        ctx.clip();
        ctx.shadowColor = 'rgba(224,138,74,0.8)'; ctx.shadowBlur = 26;
        ctx.fillStyle = PAL.ember; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(word, 790, 830);
        ctx.restore();
        if (wp > 0.97) {
          const hb = 1 + 0.05 * Math.max(0, Math.sin((t - p2.start - 2.9) * 9)) * (t < p2.start + 4 ? 1 : 0);
          ctx.save(); ctx.translate(790, 975); ctx.scale(hb, hb);
          glowText(ctx, 'কায্যাব · মহামিথ্যুক', 0, 0, `600 42px BNU, sans-serif`, PAL.ember, 0.6);
          ctx.restore();
        }
      }
    }
    if (p3) drawPhrase(ctx, p3, t, { top: 1420, font: `800 72px BNU, sans-serif` });
  },

  s8(ctx, scene, t, sched) {
    drawBG(ctx, scene, t, 'push');
    drawRolling(ctx, scene, t, { top: 1000, font: `700 56px BNU, sans-serif` });
    // final word glow bump on সিদ্দীক
    const lastP = scene.phrases[scene.phrases.length - 1];
    if (lastP && t > lastP.start + 1.2) {
      const k = 0.5 + 0.2 * Math.sin(t * 1.4);
      const g = ctx.createRadialGradient(540, 860, 30, 540, 860, 620);
      g.addColorStop(0, `rgba(246,220,158,${0.13 * k})`);
      g.addColorStop(1, 'rgba(246,220,158,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  },
};

function drawPathGraph(ctx, nodes, nodeT, t, { stroke, glowC, labelFont, labelC, dir }) {
  // edges: progressive curve through nodes
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
    // quadratic bezier, partially drawn
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
    glowText(ctx, nd.label, nd.x + (dir > 0 ? 130 : -130), nd.y, labelFont, labelC, 0.35);
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
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 6;
  ctx.fillStyle = 'rgba(245,239,226,0.95)';
  ctx.fillText(SIGNATURE, cx - size / 2 - 16, cy + 1);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Frame compositor + transitions                                      */
/* ------------------------------------------------------------------ */
const CUT_AFTER = new Set(['s5']); // s5 -> s6 hard contrast cut

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
    if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${smooth(out)})`; ctx.fillRect(0, 0, W, H); }
  }
  const into = (t - (scene.start - scene.leadIn)) / fd;
  if (idx > 0 && !CUT_AFTER.has(sched.scenes[idx - 1].id) && into < 1) {
    ctx.fillStyle = `rgba(0,0,0,${1 - smooth(into)})`; ctx.fillRect(0, 0, W, H);
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

  const s4 = sched.scenes.find((s) => s.id === 's4');
  const padExpr = '0.55*sin(2*PI*110*t)+0.35*sin(2*PI*164.81*t)+0.30*sin(2*PI*220*t)+0.25*sin(2*PI*55*t)';
  // pad part 1 (before recitation)
  {
    const d = s4.start;
    const idx = addIn(['-f', 'lavfi', '-i', `aevalsrc=exprs=${padExpr}:s=48000:d=${d.toFixed(3)}`]);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=2.5,afade=t=out:st=${(d - 1.2).toFixed(3)}:d=1.2,volume=0.045[pad0]`);
    mixLabels.push('[pad0]');
  }
  // pad part 2 (after recitation)
  {
    const d = sched.total - s4.end;
    const ms = Math.round(s4.end * 1000);
    const idx = addIn(['-f', 'lavfi', '-i', `aevalsrc=exprs=${padExpr}:s=48000:d=${d.toFixed(3)}`]);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=1.2,afade=t=out:st=${(d - 2.2).toFixed(3)}:d=2.2,volume=0.045,adelay=${ms}|${ms}[pad1]`);
    mixLabels.push('[pad1]');
  }

  // chimes (light path nodes + landing sparkle)
  const s5 = sched.scenes.find((s) => s.id === 's5');
  const s6 = sched.scenes.find((s) => s.id === 's6');
  const s7 = sched.scenes.find((s) => s.id === 's7');
  const chimes = [];
  if (s5?.phrases.length >= 4) {
    chimes.push({ t: s5.phrases[0].start + 0.3, f: 1174.7, d: 0.7, g: 0.30 });
    chimes.push({ t: s5.phrases[1].start + 0.15, f: 1174.7, d: 0.7, g: 0.30 });
    chimes.push({ t: s5.phrases[1].start + 1.6, f: 1174.7, d: 0.8, g: 0.32 });
    chimes.push({ t: s5.phrases[3].start + 0.35, f: 2093.0, d: 1.0, g: 0.26 });
  }
  if (s6?.phrases.length >= 3) {
    chimes.push({ t: s6.phrases[0].start + 0.25, f: 523.25, d: 0.9, g: 0.30 });
    chimes.push({ t: s6.phrases[1].start + 0.9, f: 466.16, d: 0.9, g: 0.30 });
    chimes.push({ t: s6.phrases[2].start + 0.9, f: 415.30, d: 1.1, g: 0.32 });
  }
  chimes.forEach((c, k) => {
    const idx = addIn(['-f', 'lavfi', '-i', `sine=frequency=${c.f}:duration=${c.d}:sample_rate=48000`]);
    const dec = (Math.LN2 * 8).toFixed(3);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,volume=exp(-${dec}*t):eval=frame,volume=${c.g},adelay=${Math.round(c.t * 1000)}|${Math.round(c.t * 1000)}[ch${k}]`);
    mixLabels.push(`[ch${k}]`);
  });

  // sub swells
  const swells = [
    { t: 0.25, f: 55, d: 1.8, g: 0.5 },
    { t: Math.max(0, s4.start - 0.4), f: 65, d: 1.4, g: 0.4 },
    { t: s6.start - 0.1, f: 48, d: 2.2, g: 0.55 },
  ];
  swells.forEach((s, k) => {
    const idx = addIn(['-f', 'lavfi', '-i', `sine=frequency=${s.f}:duration=${s.d}:sample_rate=48000`]);
    const env = `t*(${s.d}-t)*${(4 / (s.d * s.d)).toFixed(4)}`;
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,volume=${env}:eval=frame,volume=${s.g},adelay=${Math.round(s.t * 1000)}|${Math.round(s.t * 1000)}[sw${k}]`);
    mixLabels.push(`[sw${k}]`);
  });

  // heartbeat after কায্যাব reveal
  if (s7?.phrases.length >= 2) {
    const hb0 = s7.phrases[1].start + 2.9;
    [0, 0.42].forEach((off, k) => {
      const idx = addIn(['-f', 'lavfi', '-i', `sine=frequency=58:duration=0.22:sample_rate=48000`]);
      filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,volume=exp(-13.863*t):eval=frame,volume=0.85,adelay=${Math.round((hb0 + off) * 1000)}|${Math.round((hb0 + off) * 1000)}[hb${k}]`);
      mixLabels.push(`[hb${k}]`);
    });
  }

  // page-ish noise at S3
  const s3 = sched.scenes.find((s) => s.id === 's3');
  {
    const idx = addIn(['-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=0.5:seed=7:sample_rate=48000']);
    filters.push(`[${idx}:a]aformat=channel_layouts=mono,aresample=48000,pan=stereo|c0=c0|c1=c0,lowpass=f=900,volume=exp(-4*t):eval=frame,volume=0.30,adelay=${Math.round((s3.start + 0.05) * 1000)}|${Math.round((s3.start + 0.05) * 1000)}[pg]`);
    mixLabels.push('[pg]');
  }

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
  const body = cues.map(([a, b, txt], i) => `${n++}\n${srtT(a)} --> ${srtT(b)}\n${txt}\n`).join('\n');
  const p = path.join(OUT_DIR, 'Mithya-Hadith-Bukhari-6094.srt');
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
    // thumbnail: S7-style split + title + names + signature
    const s7 = sched.scenes.find((s) => s.id === 's7');
    drawBG(ctx, s7, 2.0, 'pull');
    const band = ctx.createLinearGradient(0, 0, 0, 840);
    band.addColorStop(0, 'rgba(4,12,9,0.45)');
    band.addColorStop(1, 'rgba(4,12,9,0)');
    ctx.fillStyle = band; ctx.fillRect(0, 0, W, 840);
    const tp = { t: TITLE, hi: ['কী'], start: -9 };
    drawPhrase(ctx, tp, 0, { top: 480, font: `800 76px BNU, sans-serif`, maxW: 940, lineH: 104 });
    glowText(ctx, 'صِدِّيقًا', 290, 1000, `120px AmiriQuran, Amiri, serif`, PAL.goldBright, 1);
    glowText(ctx, 'كَذَّابًا', 790, 1000, `120px AmiriQuran, Amiri, serif`, PAL.ember, 0.8);
    glowText(ctx, 'সহীহ বুখারী · ৬০৯৪', 540, 1220, `600 44px Inter, BNU, sans-serif`, PAL.gold, 0.5);
    ctx.save();
    ctx.drawImage(AVATAR, 1004 - 40, 1760 - 40, 80, 80);
    ctx.font = `italic 500 42px Cormorant, serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(245,239,226,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6;
    ctx.fillText(SIGNATURE, 1004 - 56, 1762);
    ctx.restore();
    fs.mkdirSync(path.dirname(args.thumb), { recursive: true });
    fs.writeFileSync(args.thumb, canvas.toBuffer('image/png'));
    console.log('thumb ->', args.thumb);
    return;
  }

  const audio = buildAudio(sched);
  const srt = writeSRT(sched);
  const out = path.join(OUT_DIR, 'Mithya-Hadith-Bukhari-6094-Final.mp4');
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
    '-metadata', 'title=তোমার নামের পাশে কী লেখা হচ্ছে? — সহীহ বুখারী ৬০৯৪',
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
