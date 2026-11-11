/**
 * Voice energy layer.
 *
 * The narration is never modified — but the *visuals* listen to it. A short
 * RMS envelope is extracted once (Node: ffmpeg → PCM, browser: AudioBuffer)
 * and every scene can query `voiceLevel(t)` to add a small, tasteful amount of
 * life that is locked to the spoken words.
 *
 * No data → a soft synthetic fallback so stills and smoke tests still render.
 */
export const VOICE_FPS = 20;

let env = null;
let envFps = VOICE_FPS;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * @param {ArrayLike<number>} arr raw RMS values (any scale)
 * @param {number} fps samples per second
 */
export function setVoiceEnvelope(arr, fps = VOICE_FPS) {
  if (!arr || !arr.length) { env = null; return null; }
  const sorted = Array.from(arr).sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1] || 1;
  const scale = ref > 1e-6 ? 1 / ref : 1;
  env = Float32Array.from(arr, (v) => clamp01(v * scale));
  envFps = fps;
  return env.length;
}

export const clearVoiceEnvelope = () => { env = null; };
export const hasVoice = () => !!env;
export const voiceFps = () => envFps;

/** Raw (interpolated) level 0..1 at time t seconds. */
export function voiceLevel(t) {
  if (!env) return 0.4 + 0.06 * Math.sin(t * 2.1) + 0.04 * Math.sin(t * 0.7);
  const f = Math.max(0, t) * envFps;
  const i = Math.floor(f);
  const k = f - i;
  const a = env[Math.min(env.length - 1, i)];
  const b = env[Math.min(env.length - 1, i + 1)];
  return a + (b - a) * k;
}

/** Trailing average — the "breath" of the sentence, not the syllable. */
export function voiceSmooth(t, win = 0.35) {
  const n = Math.max(1, Math.round(win * envFps));
  let sum = 0;
  for (let i = 0; i < n; i++) sum += voiceLevel(t - i / envFps);
  return sum / n;
}

/** Positive derivative — used for tiny accent hits on stressed syllables. */
export function voiceOnset(t) {
  const a = voiceSmooth(t - 0.14, 0.2);
  const b = voiceSmooth(t, 0.2);
  return clamp01((b - a) * 2.6);
}

/** Envelope from mono PCM float samples. */
export function envelopeFromPcm(pcm, sampleRate, fps = VOICE_FPS) {
  const win = Math.max(1, Math.round(sampleRate / fps));
  const n = Math.floor(pcm.length / win);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const base = i * win;
    // stride 4: plenty for an envelope, 4x cheaper
    for (let j = 0; j < win; j += 4) {
      const v = pcm[base + j] || 0;
      sum += v * v;
    }
    out[i] = Math.sqrt(sum / Math.ceil(win / 4));
  }
  return { rms: out, fps };
}

/** Envelope from a browser AudioBuffer (first channel). */
export function envelopeFromAudioBuffer(buffer, fps = VOICE_FPS) {
  const data = buffer.getChannelData ? buffer.getChannelData(0) : buffer;
  return envelopeFromPcm(data, buffer.sampleRate || 48000, fps);
}

/** Convenience: measure + install in one call. Returns the level array. */
export function analyseAudioBuffer(buffer) {
  const { rms, fps } = envelopeFromAudioBuffer(buffer);
  setVoiceEnvelope(rms, fps);
  return rms;
}
