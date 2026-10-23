import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { FILM, VOICEOVER_CLIPS, SFX_CUES } from '../timeline/cues.mjs';

const SR = 48000;
const TOTAL_SAMPLES = Math.round(FILM.duration * SR);

function decodeMp3ToFloat32Mono(mp3Path) {
  const res = spawnSync(
    ffmpegInstaller.path,
    [
      '-v', 'error',
      '-i', mp3Path,
      '-ac', '1',
      '-ar', String(SR),
      '-f', 'f32le',
      'pipe:1',
    ],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  if (res.status !== 0) {
    throw new Error(`Failed decoding ${mp3Path}: ${res.stderr?.toString()}`);
  }
  const buf = res.stdout;
  return new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
}

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export async function composeMasterAudio({
  voDir = path.resolve('brand_film/assets/voiceover'),
  wavOut = '/tmp/codepixel_master_48k.wav',
  m4aOut = path.resolve('brand_film/assets/audio/master_mix_48k.m4a'),
} = {}) {
  console.log('[audio] Decoding voiceover sources at 48 kHz...');
  const decodedCache = new Map();
  for (const clip of VOICEOVER_CLIPS) {
    if (!decodedCache.has(clip.file)) {
      const fullPath = path.join(voDir, clip.file);
      decodedCache.set(clip.file, decodeMp3ToFloat32Mono(fullPath));
    }
  }

  // 1. Assemble exact phrase-synced voiceover stem
  const voMono = new Float32Array(TOTAL_SAMPLES);
  let prevEnd = 0;

  for (let idx = 0; idx < VOICEOVER_CLIPS.length; idx++) {
    const c = VOICEOVER_CLIPS[idx];
    const src = decodedCache.get(c.file);
    const s0 = Math.max(0, Math.round(c.srcStart * SR));
    const s1 = Math.min(src.length, Math.round(c.srcEnd * SR));
    const len = s1 - s0;
    const dst0 = Math.round(c.at * SR);
    if (c.at < prevEnd - 0.005) {
      throw new Error(`Voiceover overlap at clip #${idx} (${c.file} @ ${c.at}s < prevEnd ${prevEnd.toFixed(3)}s)`);
    }
    prevEnd = c.at + len / SR;

    // Measure clip RMS for gentle consistency across clips
    let sumSq = 0;
    let activeCount = 0;
    for (let i = s0; i < s1; i++) {
      const v = src[i];
      if (Math.abs(v) > 0.015) {
        sumSq += v * v;
        activeCount++;
      }
    }
    const rms = activeCount > 100 ? Math.sqrt(sumSq / activeCount) : 0.14;
    const targetRms = 0.21;
    const clipGain = Math.min(2.1, Math.max(0.75, targetRms / Math.max(0.05, rms)));

    const fadeIn = Math.min(Math.round(0.020 * SR), Math.floor(len / 4));
    const fadeOut = Math.min(Math.round(0.028 * SR), Math.floor(len / 4));

    for (let i = 0; i < len; i++) {
      const di = dst0 + i;
      if (di >= TOTAL_SAMPLES) break;
      let env = 1.0;
      if (i < fadeIn) {
        env = 0.5 * (1 - Math.cos((Math.PI * i) / fadeIn));
      } else if (i > len - fadeOut) {
        const rem = len - i;
        env = 0.5 * (1 - Math.cos((Math.PI * rem) / fadeOut));
      }
      voMono[di] += src[s0 + i] * clipGain * env;
    }
  }

  // 2. Compute smooth lookahead speech-activity envelope for sidechain music ducking
  console.log('[audio] Computing lookahead sidechain ducking envelope...');
  const blockSize = 480; // 10ms blocks
  const numBlocks = Math.ceil(TOTAL_SAMPLES / blockSize);
  const blockSpeech = new Float32Array(numBlocks);
  for (let b = 0; b < numBlocks; b++) {
    const start = b * blockSize;
    const end = Math.min(TOTAL_SAMPLES, start + blockSize);
    let peak = 0;
    for (let i = start; i < end; i++) {
      const a = Math.abs(voMono[i]);
      if (a > peak) peak = a;
    }
    blockSpeech[b] = peak > 0.018 ? 1.0 : 0.0;
  }
  // Dilate 140ms lookahead and 260ms hold so music never pumps between syllables
  const dilated = new Float32Array(numBlocks);
  for (let b = 0; b < numBlocks; b++) {
    let active = 0;
    const lo = Math.max(0, b - 26);
    const hi = Math.min(numBlocks - 1, b + 14);
    for (let k = lo; k <= hi; k++) {
      if (blockSpeech[k] > 0.5) {
        active = 1;
        break;
      }
    }
    dilated[b] = active;
  }
  // Smooth envelope
  const duckGainBlocks = new Float32Array(numBlocks);
  let smoothState = 0;
  for (let b = 0; b < numBlocks; b++) {
    const target = dilated[b];
    const coeff = target > smoothState ? 0.14 : 0.035;
    smoothState += (target - smoothState) * coeff;
    // Music gain: 1.0 in musical pauses, 0.36 (-8.9 dB) under narration
    duckGainBlocks[b] = 1.0 - 0.64 * smoothState;
  }

  // 3. Synthesize Warm Ambient-Cinematic Stereo Score (D major / B minor9)
  console.log('[audio] Synthesizing corporate-cinematic stereo score & subtle sound design...');
  const musicL = new Float32Array(TOTAL_SAMPLES);
  const musicR = new Float32Array(TOTAL_SAMPLES);

  // Progression cycles every 32 seconds (4 chords x 8s):
  // 0: Dmaj9   (D2, A2, F#3, A3, C#4, E4)
  // 1: Bm11    (B1, F#2, D3, F#3, A3, C#4, E4)
  // 2: Gmaj9   (G1, D2, B2, F#3, A3, D4)
  // 3: A6sus4  (A1, E2, D3, F#3, A3, E4)
  const CHORDS = [
    { bass: 38, fifth: 45, pad: [54, 57, 61, 64], arp: [62, 66, 69, 73, 76, 73] },
    { bass: 35, fifth: 42, pad: [50, 54, 57, 61], arp: [59, 62, 66, 69, 73, 66] },
    { bass: 31, fifth: 38, pad: [47, 54, 57, 62], arp: [59, 62, 66, 71, 74, 69] },
    { bass: 33, fifth: 40, pad: [50, 54, 57, 64], arp: [57, 62, 64, 69, 73, 69] },
  ];

  const chordDur = 8.0;
  const totalChords = Math.ceil(FILM.duration / chordDur);

  // Render warm pad chords with crossfades
  for (let ci = 0; ci < totalChords; ci++) {
    const chord = CHORDS[ci % CHORDS.length];
    const tStart = Math.max(0, ci * chordDur - 1.2);
    const tEnd = Math.min(FILM.duration, (ci + 1) * chordDur + 1.2);
    const i0 = Math.round(tStart * SR);
    const i1 = Math.round(tEnd * SR);
    const durSamples = i1 - i0;

    // Scene intensity curve (quieter intimacy in S02, warm steady lift in S03-S08, spacious clarity in S09, grand warm bloom in S11)
    const midT = (tStart + tEnd) * 0.5;
    let sceneLift = 1.0;
    if (midT < 30) sceneLift = 1.05;
    else if (midT < 75) sceneLift = 0.88;
    else if (midT >= 355 && midT < 405) sceneLift = 0.92;
    else if (midT >= 445) sceneLift = 1.18;

    const freqs = [
      { f: midiToHz(chord.bass), amp: 0.052, pan: 0.0 },
      { f: midiToHz(chord.fifth), amp: 0.028, pan: 0.0 },
      ...chord.pad.map((m, idx) => ({
        f: midiToHz(m),
        amp: 0.022 / (1 + idx * 0.12),
        pan: (idx % 2 === 0 ? -1 : 1) * (0.28 + idx * 0.09),
      })),
    ];

    const phasesA = freqs.map((_, k) => (ci * 1.37 + k * 0.83) % (Math.PI * 2));
    const phasesB = freqs.map((_, k) => (ci * 2.11 + k * 1.49) % (Math.PI * 2));
    const twoPiSr = (Math.PI * 2) / SR;

    for (let s = 0; s < durSamples; s++) {
      const idx = i0 + s;
      // Smooth raised-cosine crossfade window (1.8s in, 1.8s out)
      const fadeSamples = Math.round(1.8 * SR);
      let win = 1.0;
      if (s < fadeSamples) win = 0.5 * (1 - Math.cos((Math.PI * s) / fadeSamples));
      else if (s > durSamples - fadeSamples) {
        win = 0.5 * (1 - Math.cos((Math.PI * (durSamples - s)) / fadeSamples));
      }

      // Gentle slow breathing modulation
      const breath = 0.90 + 0.10 * Math.sin(twoPiSr * 0.14 * idx);
      let l = 0;
      let r = 0;

      for (let v = 0; v < freqs.length; v++) {
        const vf = freqs[v];
        // Dual slightly detuned warm sine + soft 2nd harmonic (= warm Rhodes/analog pad, zero harshness)
        const p1 = phasesA[v] + twoPiSr * vf.f * 0.9985 * s;
        const p2 = phasesB[v] + twoPiSr * vf.f * 1.0015 * s;
        const sig = (Math.sin(p1) + Math.sin(p2) + 0.18 * Math.sin(p1 * 2)) * 0.46 * vf.amp;
        const gL = Math.sqrt(0.5 * (1 - vf.pan));
        const gR = Math.sqrt(0.5 * (1 + vf.pan));
        l += sig * gL;
        r += sig * gR;
      }

      const g = win * breath * sceneLift;
      musicL[idx] += l * g;
      musicR[idx] += r * g;
    }

    // Add gentle felt-piano / celesta harmonic notes (every 1.333s, softly damped)
    const stepDur = chordDur / 6;
    for (let n = 0; n < 6; n++) {
      const noteTime = ci * chordDur + n * stepDur + 0.12;
      if (noteTime >= FILM.duration - 1.5) continue;
      const midi = chord.arp[n % chord.arp.length];
      const f0 = midiToHz(midi);
      const nStart = Math.round(noteTime * SR);
      const nLen = Math.min(Math.round(2.4 * SR), TOTAL_SAMPLES - nStart);
      const pan = ((n % 3) - 1) * 0.34;
      const gL = Math.sqrt(0.5 * (1 - pan));
      const gR = Math.sqrt(0.5 * (1 + pan));
      const noteAmp = 0.026 * sceneLift;

      for (let k = 0; k < nLen; k++) {
        const t = k / SR;
        // Soft felt-hammer attack (12ms) + natural piano string decay
        const att = k < 576 ? k / 576 : 1.0;
        const dec1 = Math.exp(-t * 2.3);
        const dec2 = Math.exp(-t * 6.5);
        const sample =
          noteAmp *
          att *
          (0.78 * Math.sin(2 * Math.PI * f0 * t) * dec1 +
            0.18 * Math.sin(2 * Math.PI * f0 * 2.0 * t) * dec2 +
            0.04 * Math.sin(2 * Math.PI * f0 * 3.0 * t) * Math.exp(-t * 11.0));
        musicL[nStart + k] += sample * gL;
        musicR[nStart + k] += sample * gR;
      }
    }
  }

  // Apply warm stereo cross-delay (310ms L->R, 430ms R->L with low-pass feedback) for lush studio space
  const dL = Math.round(0.31 * SR);
  const dR = Math.round(0.43 * SR);
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const fbL = i >= dR ? musicR[i - dR] * 0.24 : 0;
    const fbR = i >= dL ? musicL[i - dL] * 0.24 : 0;
    lpL += 0.08 * (fbL - lpL);
    lpR += 0.08 * (fbR - lpR);
    musicL[i] += lpL;
    musicR[i] += lpR;
  }

  // Master fade-in (first 1.0s) and graceful warm tail fade-out (last 2.8s of 492s)
  const introFade = Math.round(1.0 * SR);
  const outroFade = Math.round(2.8 * SR);
  for (let i = 0; i < introFade; i++) {
    const g = i / introFade;
    musicL[i] *= g;
    musicR[i] *= g;
  }
  for (let i = 0; i < outroFade; i++) {
    const idx = TOTAL_SAMPLES - 1 - i;
    const g = 0.25 + 0.75 * (i / outroFade); // resolves gently without dead-black silence
    musicL[idx] *= g;
    musicR[idx] *= g;
  }

  // 4. Synthesize Controlled, Subtle Sound Effects
  const sfxL = new Float32Array(TOTAL_SAMPLES);
  const sfxR = new Float32Array(TOTAL_SAMPLES);
  let rng = 123456789;
  const rand = () => {
    rng = (1664525 * rng + 1013904223) >>> 0;
    return rng / 2147483648 - 1.0;
  };

  for (const cue of SFX_CUES) {
    const s0 = Math.round(cue.at * SR);
    const g = cue.gain ?? 0.45;

    if (cue.type === 'transition') {
      // Filtered silky air sweep (0.62s) — never harsh
      const len = Math.min(Math.round(0.62 * SR), TOTAL_SAMPLES - s0);
      let bp = 0;
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const u = i / len;
        const env = Math.sin(Math.PI * u) ** 1.8;
        const fc = 260 + 900 * Math.sin(Math.PI * u);
        const f = Math.min(0.35, (2 * Math.PI * fc) / SR);
        const white = rand();
        lp += f * bp;
        const hp = white - lp - 0.85 * bp;
        bp += f * hp;
        const pan = -0.35 + 0.70 * u;
        const sig = bp * env * 0.036 * g;
        sfxL[s0 + i] += sig * Math.sqrt(0.5 * (1 - pan));
        sfxR[s0 + i] += sig * Math.sqrt(0.5 * (1 + pan));
      }
    } else if (cue.type === 'impact') {
      // Warm cinematic felt sub-drum + subtle fifth harmonic bloom (1.35s)
      const len = Math.min(Math.round(1.35 * SR), TOTAL_SAMPLES - s0);
      let phase = 0;
      for (let i = 0; i < len; i++) {
        const t = i / SR;
        const att = i < 360 ? i / 360 : 1.0;
        const freq = 36 + 34 * Math.exp(-t * 9.5);
        phase += (2 * Math.PI * freq) / SR;
        const sub = Math.sin(phase) * Math.exp(-t * 2.9);
        const overtone = 0.25 * Math.sin(2 * Math.PI * 146.83 * t) * Math.exp(-t * 4.2);
        const sig = (sub + overtone) * att * 0.095 * g;
        sfxL[s0 + i] += sig;
        sfxR[s0 + i] += sig;
      }
    } else if (cue.type === 'uiClick') {
      // Soft damped tactile glass/wood tap (45ms)
      const len = Math.min(Math.round(0.055 * SR), TOTAL_SAMPLES - s0);
      for (let i = 0; i < len; i++) {
        const t = i / SR;
        const att = i < 48 ? i / 48 : 1.0;
        const body =
          0.65 * Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 95) +
          0.35 * Math.sin(2 * Math.PI * 1320 * t) * Math.exp(-t * 160);
        const sig = body * att * 0.045 * g;
        sfxL[s0 + i] += sig * 0.95;
        sfxR[s0 + i] += sig * 1.05;
      }
    } else if (cue.type === 'uiConfirm') {
      // Gentle two-note major fifth confirmation (D5 -> A5, soft decayed bell)
      const notes = [
        { offset: 0.0, f: 587.33, dur: 0.36 },
        { offset: 0.085, f: 880.0, dur: 0.52 },
      ];
      for (const nt of notes) {
        const st = s0 + Math.round(nt.offset * SR);
        const len = Math.min(Math.round(nt.dur * SR), TOTAL_SAMPLES - st);
        for (let i = 0; i < len; i++) {
          const t = i / SR;
          const att = i < 120 ? i / 120 : 1.0;
          const sig =
            att *
            Math.sin(2 * Math.PI * nt.f * t) *
            Math.exp(-t * 7.5) *
            0.038 *
            g;
          sfxL[st + i] += sig * 0.92;
          sfxR[st + i] += sig * 1.08;
        }
      }
    } else if (cue.type === 'shimmer') {
      // Delicate warm Dadd9 harmonic shimmer (1.8s)
      const len = Math.min(Math.round(1.8 * SR), TOTAL_SAMPLES - s0);
      const tones = [587.33, 739.99, 880.0, 1108.73];
      for (let i = 0; i < len; i++) {
        const t = i / SR;
        const env = Math.sin(Math.PI * Math.min(1, t / 0.35)) * Math.exp(-t * 1.9);
        let l = 0;
        let r = 0;
        for (let k = 0; k < tones.length; k++) {
          const v = Math.sin(2 * Math.PI * tones[k] * t) * (0.28 / (1 + k * 0.25));
          if (k % 2 === 0) l += v;
          else r += v;
        }
        sfxL[s0 + i] += (l * 0.8 + r * 0.2) * env * 0.055 * g;
        sfxR[s0 + i] += (r * 0.8 + l * 0.2) * env * 0.055 * g;
      }
    }
  }

  // 5. Final Mix + Soft-Knee Master Limiter -> 16-bit Stereo WAV
  console.log('[audio] Mixing voiceover + sidechain-ducked score + SFX -> WAV & AAC...');
  const pcm16 = new Int16Array(TOTAL_SAMPLES * 2);
  let maxPeak = 0;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const b = Math.min(numBlocks - 1, Math.floor(i / blockSize));
    const duck = duckGainBlocks[b];
    const v = voMono[i] * 0.92;
    let l = v + musicL[i] * duck + sfxL[i];
    let r = v + musicR[i] * duck + sfxR[i];

    // Transparent soft-knee limiter above 0.78, ceiling 0.89 (-1.0 dBFS)
    const softLimit = (x) => {
      const ax = Math.abs(x);
      if (ax <= 0.78) return x;
      const sign = x < 0 ? -1 : 1;
      return sign * (0.78 + 0.11 * Math.tanh((ax - 0.78) / 0.14));
    };
    l = softLimit(l);
    r = softLimit(r);
    if (Math.abs(l) > maxPeak) maxPeak = Math.abs(l);
    if (Math.abs(r) > maxPeak) maxPeak = Math.abs(r);

    pcm16[i * 2] = Math.round(l * 32767);
    pcm16[i * 2 + 1] = Math.round(r * 32767);
  }

  // Write RIFF WAV header + PCM payload
  const dataBytes = pcm16.byteLength;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(2, 22);  // 2 channels
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 4, 28); // byte rate
  header.writeUInt16LE(4, 32);  // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(dataBytes, 40);

  fs.mkdirSync(path.dirname(m4aOut), { recursive: true });
  const fd = fs.openSync(wavOut, 'w');
  fs.writeSync(fd, header);
  fs.writeSync(fd, Buffer.from(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength));
  fs.closeSync(fd);

  // Encode clean AAC-LC 192 kbps stereo master
  const enc = spawnSync(
    ffmpegInstaller.path,
    [
      '-y',
      '-v', 'error',
      '-i', wavOut,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-ac', '2',
      m4aOut,
    ],
    { encoding: 'utf8' }
  );
  if (enc.status !== 0) {
    throw new Error(`AAC encode failed: ${enc.stderr}`);
  }

  // Verify loudness & duration
  const probe = JSON.parse(
    spawnSync(
      ffprobeInstaller.path,
      ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,sample_rate,channels', '-of', 'json', m4aOut],
      { encoding: 'utf8' }
    ).stdout
  );
  const vol = spawnSync(
    ffmpegInstaller.path,
    ['-i', wavOut, '-af', 'volumedetect', '-f', 'null', '-'],
    { encoding: 'utf8' }
  ).stderr;
  const volLines = vol
    .split('\n')
    .filter((l) => l.includes('mean_volume') || l.includes('max_volume'))
    .map((l) => l.trim());

  console.log('[audio] Master audio ready:', {
    m4aOut,
    durationSec: Number(probe.format.duration).toFixed(3),
    sizeMB: (Number(probe.format.size) / (1024 * 1024)).toFixed(2),
    peakLinear: maxPeak.toFixed(3),
    volumedetect: volLines,
  });

  return { wavOut, m4aOut, duration: Number(probe.format.duration) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  composeMasterAudio().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
