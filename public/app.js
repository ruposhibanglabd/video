/**
 * CodePixel Web — 3-step promo video app.
 * Upload voiceover → render in this tab → download the MP4.
 */
import { PLATFORM_READY } from './src/render/platform.mjs';
import { Compositor, buildSchedule } from './src/render/frame.mjs';
import { probeAudio, toEncoderBuffer, detectPauseEnds } from './src/browser/audio.js';
import { capabilities, renderMp4 } from './src/browser/encode.js';

const REFERENCE_DURATION = 492.356; // expected narration length (08:12.356)

const $ = (id) => document.getElementById(id);
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
  blob: null,
  cancelled: false,
  rendering: false,
};

const ERROR_TEXT = {
  NO_WEB_CODECS:
    'এই ব্রাউজারে WebCodecs নেই, তাই ভিডিও তৈরি করা যাবে না। কম্পিউটারের Chrome অথবা Edge-এর সর্বশেষ ভার্সনে পেজটি খুলুন।',
  H264_UNSUPPORTED: 'এই ব্রাউজারে H.264 এনকোডার পাওয়া যায়নি। Chrome বা Edge-এর সর্বশেষ ভার্সন ব্যবহার করুন।',
  AAC_UNSUPPORTED: 'এই ব্রাউজারে AAC অডিও এনকোডার নেই। Chrome বা Edge-এর সর্বশেষ ভার্সন ব্যবহার করুন।',
  DECODE_FAILED: 'এই ফাইলটি পড়া গেল না। ফাইলটি নষ্ট হতে পারে — অন্য একটি MP3/WAV দিয়ে চেষ্টা করুন।',
  TOO_SHORT: 'অডিওটি খুব ছোট (১ সেকেন্ডের কম)। অন্তত কয়েক সেকেন্ডের ভয়েসওভার দিন।',
  TOO_LONG: 'অডিওটি ৩০ মিনিটের বেশি — এটি সমর্থিত নয়।',
  NO_WEB_AUDIO: 'এই ব্রাউজারে অডিও প্রসেসিং নেই। Chrome বা Edge ব্যবহার করুন।',
  CANCELLED: 'রেন্ডার বাতিল করা হয়েছে।',
  BAD_TYPE: 'শুধু অডিও ফাইল (MP3, WAV, M4A, AAC, OGG) দিন।',
};

function showError(err) {
  const code = typeof err === 'string' ? err : err?.message || 'UNKNOWN';
  const key = String(code).split(':')[0];
  el.error.textContent = ERROR_TEXT[key] || `কিছু একটা সমস্যা হয়েছে (${key})। আবার চেষ্টা করুন।`;
  el.error.hidden = false;
  console.error(err);
}
const clearError = () => { el.error.hidden = true; };

const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}
function fmtEta(sec) {
  if (!isFinite(sec) || sec == null) return '';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m} মিনিট ${pad(s)} সেকেন্ড` : `${s} সেকেন্ড`;
}
function fmtSize(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/* ------------------------------------------------------------------ file */
function resetOutput() {
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = null;
  state.blob = null;
  el.preview.removeAttribute('src');
  el.preview.load();
  el.previewWrap.hidden = true;
  el.download.hidden = true;
  el.download.removeAttribute('href');
  el.again.hidden = true;
}

async function acceptFile(file) {
  clearError();
  resetOutput();
  if (!file) return;
  const okType = (file.type && file.type.startsWith('audio/')) || /\.(mp3|wav|m4a|aac|ogg|oga|flac|mp4|webm)$/i.test(file.name);
  if (!okType) return showError('BAD_TYPE');
  if (file.size > 300 * 1024 * 1024) return showError('অডিও ফাইলটি ৩০০ MB-এর চেয়ে বড়।');

  state.file = file;
  state.probe = null;
  el.render.disabled = true;
  el.gate.textContent = 'অডিও যাচাই হচ্ছে…';
  el.filename.textContent = file.name;
  el.filesize.textContent = fmtSize(file.size);
  el.duration.textContent = '…';
  el.fileinfo.hidden = false;

  if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
  state.audioUrl = URL.createObjectURL(file);
  el.audioPreview.src = state.audioUrl;
  el.audioPreview.hidden = false;

  try {
    const probe = await probeAudio(file);
    state.probe = probe;
    el.duration.textContent = fmtDuration(probe.duration);
    el.gate.textContent = '';
    el.render.disabled = false;
    if (state.cancelled) state.cancelled = false;

    const diff = probe.duration - REFERENCE_DURATION;
    if (Math.abs(diff) > 1.5) {
      const dir = diff > 0 ? 'বেশি' : 'কম';
      el.durNote.textContent =
        `দৈর্ঘ্য ${fmtDuration(probe.duration)} — পরিকল্পিত ০৮:১২.৩৫৬ থেকে ${fmtDuration(Math.abs(diff))} ${dir}। ` +
        'দৃশ্যগুলো এই অডিওর দৈর্ঘ্য অনুযায়ী আনুপাতিকভাবে সাজানো হবে; অডিও কাটা বা টানবে না।';
      el.durNote.hidden = false;
    } else {
      el.durNote.hidden = true;
    }
  } catch (err) {
    el.fileinfo.hidden = true;
    el.gate.textContent = 'অডিও আপলোড করলে বাটন চালু হবে।';
    showError(err);
  }
}

el.file.addEventListener('change', (e) => acceptFile(e.target.files?.[0]));
el.replace.addEventListener('click', () => el.file.click());
el.drop.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.file.click(); }
});
for (const evt of ['dragenter', 'dragover']) {
  el.drop.addEventListener(evt, (e) => { e.preventDefault(); el.drop.classList.add('over'); });
}
for (const evt of ['dragleave', 'drop']) {
  el.drop.addEventListener(evt, (e) => { e.preventDefault(); el.drop.classList.remove('over'); });
}
el.drop.addEventListener('drop', (e) => {
  const f = e.dataTransfer?.files?.[0];
  if (f) acceptFile(f);
});

/* ---------------------------------------------------------------- render */
function setProgress(p, label, sub) {
  el.bar.style.width = `${Math.max(1, Math.min(100, p * 100)).toFixed(1)}%`;
  el.pct.textContent = `${Math.round(p * 100)}%`;
  if (label) el.stage.textContent = label;
  el.sub.textContent = sub || '';
}

el.cancel.addEventListener('click', () => {
  state.cancelled = true;
  el.stage.textContent = 'বাতিল করা হচ্ছে…';
});

el.render.addEventListener('click', async () => {
  if (state.rendering || !state.probe) return;
  clearError();
  state.rendering = true;
  state.cancelled = false;
  el.render.disabled = true;
  el.cancel.disabled = false;
  el.progress.hidden = false;
  el.again.hidden = true;
  el.download.hidden = true;
  el.previewWrap.hidden = true;
  el.outMeta.textContent = 'রেন্ডার চলছে…';
  setProgress(0, 'প্রজেক্ট প্রস্তুত হচ্ছে', '');

  try {
    await PLATFORM_READY;
    setProgress(0.02, 'অডিও বিশ্লেষণ হচ্ছে', '');
    const pauses = detectPauseEnds(state.probe.buffer);
    const schedule = buildSchedule(state.probe.duration, { snapPoints: pauses });
    setProgress(0.04, 'ভয়েসওভার প্রস্তুত হচ্ছে', `${schedule.scenes.length} দৃশ্য · ${schedule.totalFrames} ফ্রেম`);

    const audio = await toEncoderBuffer(state.probe.buffer);
    if (state.cancelled) throw new Error('CANCELLED');

    const compositor = new Compositor({ preview: true });
    const result = await renderMp4({
      compositor,
      schedule,
      audio,
      bitrate: 3_000_000,
      shouldStop: () => state.cancelled,
      onStage: (phase, label) => {
        if (phase === 'audio') setProgress(0.05, label, '');
        if (phase === 'finalize') setProgress(0.98, label, '');
      },
      onProgress: (p, info) => {
        if (p < 0.06) return setProgress(p, 'অডিও এনকোড হচ্ছে', '');
        const sub = info
          ? `${info.frame.toLocaleString('en-US')} / ${info.total.toLocaleString('en-US')} ফ্রেম` +
            (info.fps ? ` · ${info.fps.toFixed(1)} fps` : '') +
            (info.eta ? ` · বাকি ≈ ${fmtEta(info.eta)}` : '')
          : '';
        setProgress(p, 'দৃশ্য রেন্ডার ও এনকোড হচ্ছে', sub);
      },
    });

    state.blob = result.blob;
    state.objectUrl = URL.createObjectURL(result.blob);
    el.preview.src = state.objectUrl;
    el.previewWrap.hidden = false;
    el.download.href = state.objectUrl;
    el.download.setAttribute('download', 'CodePixel-Web-Promo-Reels.mp4');
    el.download.hidden = false;
    el.again.hidden = false;
    const mb = (result.bytes / 1024 / 1024).toFixed(1);
    el.outMeta.textContent =
      `1080 × 1920 · 30 fps · ${fmtDuration(result.duration)} · H.264 + AAC · ${mb} MB`;
    setProgress(1, 'ভিডিও প্রস্তুত', 'ডাউনলোড করতে পারেন');
    el.pct.textContent = '100%';
    el.stage.textContent = 'ডাউনলোডের জন্য প্রস্তুত';
  } catch (err) {
    el.progress.hidden = true;
    el.outMeta.textContent = 'রেন্ডার সম্পন্ন হয়নি।';
    showError(err);
  } finally {
    state.rendering = false;
    el.render.disabled = !state.probe;
    el.cancel.disabled = true;
  }
});

el.again.addEventListener('click', () => {
  resetOutput();
  el.file.value = '';
  state.file = null;
  state.probe = null;
  el.fileinfo.hidden = true;
  el.audioPreview.hidden = true;
  el.audioPreview.removeAttribute('src');
  el.durNote.hidden = true;
  el.progress.hidden = true;
  el.render.disabled = true;
  el.gate.textContent = 'অডিও আপলোড করলে বাটন চালু হবে।';
  el.outMeta.textContent = 'রেন্ডার শেষ হলে এখানে প্রিভিউ ও ডাউনলোড বাটন আসবে।';
  el.stage.textContent = '';
  el.sub.textContent = '';
  el.bar.style.width = '0%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ------------------------------------------------------------------ boot */
(function boot() {
  const caps = capabilities();
  if (!caps.ok) {
    el.render.disabled = true;
    el.gate.textContent = '';
    el.error.textContent = ERROR_TEXT.NO_WEB_CODECS;
    el.error.hidden = false;
  }
})();
