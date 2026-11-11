/**
 * Audio helpers — browser side.
 * The uploaded file is never modified. We decode it once to measure the real
 * duration, detect natural speech pauses (used to snap scene boundaries), and
 * render a 48 kHz stereo copy that the AAC encoder needs.
 */
export const TARGET_RATE = 48000;

let sharedCtx = null;
function audioContext() {
  if (!sharedCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error('NO_WEB_AUDIO');
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

/** Decode the uploaded file. Throws with a machine code on failure. */
export async function probeAudio(file) {
  const bytes = await file.arrayBuffer();
  let buffer;
  try {
    buffer = await audioContext().decodeAudioData(bytes.slice(0));
  } catch {
    throw new Error('DECODE_FAILED');
  }
  if (!buffer || !buffer.duration || buffer.duration < 0.5) throw new Error('TOO_SHORT');
  if (buffer.duration > 60 * 30) throw new Error('TOO_LONG');
  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.channels,
    buffer,
  };
}

/** Resample to 48 kHz stereo without changing speed or pitch. */
export async function toEncoderBuffer(buffer) {
  const frames = Math.ceil(buffer.duration * TARGET_RATE);
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Offline) throw new Error('NO_OFFLINE_AUDIO');
  const off = new Offline(2, frames, TARGET_RATE);
  const src = off.createBufferSource();
  src.buffer = buffer;
  src.connect(off.destination);
  src.start(0);
  const rendered = await off.startRendering();
  const left = rendered.getChannelData(0);
  const right = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : left;
  const planar = new Float32Array(rendered.length * 2);
  planar.set(left, 0);
  planar.set(right, rendered.length);
  return { planar, frames: rendered.length, sampleRate: TARGET_RATE, channels: 2 };
}

/**
 * RMS envelope of the narration (20 samples/second) — the motion system uses
 * it for voice-reactive detail. Purely derived data; the audio is untouched.
 */
export function buildEnvelope(buffer, { fps = 20 } = {}) {
  const data = buffer.getChannelData(0);
  const win = Math.max(1, Math.round(buffer.sampleRate / fps));
  const n = Math.floor(data.length / win);
  const rms = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const base = i * win;
    for (let j = 0; j < win; j += 4) {
      const v = data[base + j] || 0;
      sum += v * v;
    }
    rms[i] = Math.sqrt(sum / Math.ceil(win / 4));
  }
  return { rms, fps };
}

/**
 * Find natural pauses: RMS windows below a threshold for >= 0.22 s.
 * Returns the *end* of each pause (where speech resumes) in seconds.
 */
export function detectPauseEnds(buffer, { windowSec = 0.02, threshold = 0.012, minPause = 0.22 } = {}) {
  const rate = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const win = Math.max(1, Math.round(rate * windowSec));
  const rms = [];
  for (let i = 0; i + win <= data.length; i += win) {
    let sum = 0;
    for (let j = 0; j < win; j += 3) sum += data[i + j] * data[i + j];
    const n = Math.ceil(win / 3);
    rms.push(Math.sqrt(sum / n));
  }
  const points = [];
  let runStart = -1;
  for (let i = 0; i < rms.length; i++) {
    const quiet = rms[i] < threshold;
    if (quiet && runStart < 0) runStart = i;
    if (!quiet && runStart >= 0) {
      const pauseLen = (i - runStart) * windowSec;
      if (pauseLen >= minPause) points.push(i * windowSec);
      runStart = -1;
    }
  }
  return points;
}
