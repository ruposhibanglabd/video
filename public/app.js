/**
 * CodePixel Web — Interactive Commercial Player, Synchronized 11-Scene Navigator,
 * One-Click MP4 Download & Optional Custom WebCodecs Re-Render Studio.
 */
import { PLATFORM_READY } from './src/render/platform.mjs';
import { Compositor, buildSchedule } from './src/render/frame.mjs';
import { AD_SYNC } from './src/scenes/syncData.mjs';
import { probeAudio, toEncoderBuffer, detectPauseEnds } from './src/browser/audio.js';
import { capabilities, renderMp4 } from './src/browser/encode.js';

const $ = (id) => document.getElementById(id);

const masterVideo = $('masterVideo');
const sceneList = $('sceneList');
const copyScriptBtn = $('copyScriptBtn');

const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
function fmtClock(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${pad(m)}:${pad(s)}`;
}
function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

// Render interactive 11-scene timeline list & sync with master `<video>`
const sceneButtons = AD_SYNC.scenes.map((s) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scene-item';
  btn.innerHTML = `
    <div class="scene-meta-row">
      <span>SCENE ${s.num} · ${s.titleEn}</span>
      <span>${fmtClock(s.start)} – ${fmtClock(s.end)} (${s.duration.toFixed(1)}s)</span>
    </div>
    <div class="scene-title">${s.titleBn}</div>
    <div class="scene-script">“${s.script}”</div>
  `;
  btn.addEventListener('click', () => {
    masterVideo.currentTime = s.start + 0.02;
    masterVideo.play().catch(() => {});
  });
  sceneList.appendChild(btn);
  return { scene: s, btn };
});

function highlightActiveScene() {
  const t = masterVideo.currentTime || 0;
  for (const { scene, btn } of sceneButtons) {
    const active = t >= scene.start && t < scene.end;
    btn.classList.toggle('active', active);
  }
}
masterVideo.addEventListener('timeupdate', highlightActiveScene);
highlightActiveScene();

copyScriptBtn?.addEventListener('click', async () => {
  const full = AD_SYNC.scenes
    .map((s) => `[Scene ${s.num} — ${s.titleBn} | ${fmtClock(s.start)}–${fmtClock(s.end)}]\n${s.script}`)
    .join('\n\n');
  try {
    await navigator.clipboard.writeText(full);
    copyScriptBtn.textContent = '✓ স্ক্রিপ্ট কপি হয়েছে!';
    setTimeout(() => { copyScriptBtn.textContent = 'স্ক্রিপ্ট কপি করুন'; }, 2200);
  } catch {
    copyScriptBtn.textContent = 'কপি করা যায়নি';
  }
});

/* ---------------- Optional Custom Voiceover Re-Render Studio ---------------- */
const el = {
  file: $('file'),
  drop: $('drop'),
  fileinfo: $('fileinfo'),
  filename: $('filename'),
  duration: $('duration'),
  filesize: $('filesize'),
  replace: $('replace'),
  audioPreview: $('audioPreview'),
  durNote: $('durNote'),
  render: $('render'),
  gate: $('gate'),
  progress: $('progress'),
  bar: $('bar'),
  stage: $('stage'),
  pct: $('pct'),
  sub: $('sub'),
  cancel: $('cancel'),
  previewWrap: $('previewWrap'),
  preview: $('preview'),
  outMeta: $('outMeta'),
  download: $('download'),
  again: $('again'),
  error: $('error'),
};

const state = {
  file: null,
  probe: null,
  objectUrl: null,
  audioUrl: null,
  cancelled: false,
  rendering: false,
};

function showError(msg) {
  el.error.textContent = typeof msg === 'string' ? msg : (msg?.message || 'রেন্ডার সম্পন্ন হয়নি।');
  el.error.hidden = false;
}

async function acceptFile(file) {
  el.error.hidden = true;
  if (!file) return;
  state.file = file;
  el.filename.textContent = file.name;
  el.filesize.textContent = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
  el.fileinfo.hidden = false;
  if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
  state.audioUrl = URL.createObjectURL(file);
  el.audioPreview.src = state.audioUrl;
  el.audioPreview.hidden = false;

  try {
    const probe = await probeAudio(file);
    state.probe = probe;
    el.duration.textContent = fmtDuration(probe.duration);
    el.render.disabled = false;
    el.gate.textContent = 'প্রস্তুত — কাস্টম MP4 তৈরি করতে বাটনে ক্লিক করুন।';
  } catch (err) {
    showError(err);
  }
}

el.file?.addEventListener('change', (e) => acceptFile(e.target.files?.[0]));
el.replace?.addEventListener('click', () => el.file.click());
for (const evt of ['dragenter', 'dragover']) {
  el.drop?.addEventListener(evt, (e) => { e.preventDefault(); el.drop.classList.add('over'); });
}
for (const evt of ['dragleave', 'drop']) {
  el.drop?.addEventListener(evt, (e) => { e.preventDefault(); el.drop.classList.remove('over'); });
}
el.drop?.addEventListener('drop', (e) => acceptFile(e.dataTransfer?.files?.[0]));
el.cancel?.addEventListener('click', () => { state.cancelled = true; });

el.render?.addEventListener('click', async () => {
  if (state.rendering || !state.probe) return;
  const caps = capabilities();
  if (!caps.ok) {
    showError('কাস্টম ব্রাউজার রেন্ডারের জন্য ডেস্কটপ Chrome বা Edge প্রয়োজন। উপরের রেডি মাস্টার MP4 সরাসরি ডাউনলোড করতে পারেন!');
    return;
  }
  state.rendering = true;
  state.cancelled = false;
  el.render.disabled = true;
  el.progress.hidden = false;

  try {
    await PLATFORM_READY;
    const pauses = detectPauseEnds(state.probe.buffer);
    const schedule = buildSchedule(state.probe.duration, { snapPoints: pauses });
    const audio = await toEncoderBuffer(state.probe.buffer);
    const compositor = new Compositor({ preview: true });
    const result = await renderMp4({
      compositor,
      schedule,
      audio,
      bitrate: 3_000_000,
      shouldStop: () => state.cancelled,
      onProgress: (p, info) => {
        el.bar.style.width = `${Math.round(p * 100)}%`;
        el.pct.textContent = `${Math.round(p * 100)}%`;
        if (info) el.sub.textContent = `${info.frame} / ${info.total} ফ্রেম`;
      },
    });
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = URL.createObjectURL(result.blob);
    el.preview.src = state.objectUrl;
    el.download.href = state.objectUrl;
    el.download.hidden = false;
    el.again.hidden = false;
    el.previewWrap.hidden = false;
    el.outMeta.textContent = `1080×1920 · 30 fps · ${fmtDuration(result.duration)} · ${(result.bytes / 1024 / 1024).toFixed(1)} MB`;
  } catch (err) {
    showError(err);
  } finally {
    state.rendering = false;
    el.render.disabled = !state.probe;
  }
});
