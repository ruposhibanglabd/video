// Studio Audio Mastering Pipeline — Voiceover Assembler + Original Ambient-Corporate Score + SFX + Sidechain Mix
import ffmpegPkg from '@ffmpeg-installer/ffmpeg';
import ffprobePkg from '@ffprobe-installer/ffprobe';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { FILM_META, VO_SEGMENTS, SFX_CUES } from '../script/master-script.mjs';

const ffmpeg = ffmpegPkg.path;
const ffprobe = ffprobePkg.path;
const SR = 48000;
const TOTAL_SEC = FILM_META.durationSec; // 492.0s
const TOTAL_SAMPLES = Math.round(SR * TOTAL_SEC);

const VO_DIR = 'film-production/assets/voiceover';
const OUT_DIR = 'film-production/assets/audio';
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('1/4 Decoding & broadcast-conditioning Bengali voiceover clips...');
const decodedCache = new Map();
for (let i = 1; i <= 9; i++) {
  const mp3 = path.join(VO_DIR, `vo-0${i}.mp3`);
  const rawPath = path.join(OUT_DIR, `_tmp_vo0${i}.f32`);
  // Gentle broadcast EQ: clean sub-rumble highpass, natural chest warmth, clear consonantal presence, zero harshness
  execFileSync(ffmpeg, [
    '-y', '-i', mp3,
    '-af', 'highpass=f=75,equalizer=f=210:t=q:w=1.2:g=1.4,equalizer=f=3200:t=q:w=1.4:g=1.8,acompressor=threshold=-20dB:ratio=2.4:attack=12:release=140:makeup=2.2dB,alimiter=limit=0.92',
    '-ar', String(SR),
    '-ac', '1',
    '-f', 'f32le',
    rawPath,
  ], { stdio: 'ignore' });
  const buf = fs.readFileSync(rawPath);
  decodedCache.set(`vo-0${i}.mp3`, new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4));
  fs.unlinkSync(rawPath);
}

// Assemble exact 492.0s mono voiceover stem + verify zero overlap
const voMono = new Float32Array(TOTAL_SAMPLES);
const timelineReport = [];
let prevEnd = 0;

for (const seg of VO_SEGMENTS) {
  const src = decodedCache.get(seg.file);
  const s0 = Math.max(0, Math.round(seg.srcStart * SR));
  const s1 = Math.min(src.length, Math.round(seg.srcEnd * SR));
  const len = s1 - s0;
  const dur = len / SR;
  const startSample = Math.round(seg.at * SR);
  const endSec = seg.at + dur;

  if (seg.at < prevEnd - 0.001) {
    throw new Error(`OVERLAP DETECTED at ${seg.id}: starts ${seg.at.toFixed(3)}s before prevEnd ${prevEnd.toFixed(3)}s`);
  }
  if (endSec > TOTAL_SEC - 0.5) {
    throw new Error(`OVERRUN at ${seg.id}: ends at ${endSec.toFixed(3)}s`);
  }

  const fadeSamples = Math.min(Math.round(0.022 * SR), Math.floor(len / 4));
  for (let n = 0; n < len; n++) {
    let env = 1.0;
    if (n < fadeSamples) {
      env = 0.5 * (1 - Math.cos((Math.PI * n) / fadeSamples));
    } else if (n >= len - fadeSamples) {
      const k = len - 1 - n;
      env = 0.5 * (1 - Math.cos((Math.PI * k) / fadeSamples));
    }
    voMono[startSample + n] += src[s0 + n] * env;
  }

  prevEnd = endSec;
  timelineReport.push({
    ...seg,
    duration: Number(dur.toFixed(3)),
    end: Number(endSec.toFixed(3)),
  });
}

fs.writeFileSync(
  path.join(OUT_DIR, 'voiceover-timeline.json'),
  JSON.stringify(timelineReport, null, 2)
);
console.log(`   Assembled ${timelineReport.length} synchronized VO phrases. Last phrase ends at ${prevEnd.toFixed(2)}s (leaves ${(TOTAL_SEC - prevEnd).toFixed(2)}s clean brand CTA hold).`);

// Compute smooth lookahead voice-activity envelope at 100 Hz control rate for musical ducking
const CTRL_HZ = 100;
const CTRL_LEN = Math.ceil(TOTAL_SEC * CTRL_HZ);
const speechActivity = new Float32Array(CTRL_LEN);
for (const seg of timelineReport) {
  const c0 = Math.max(0, Math.floor((seg.at - 0.22) * CTRL_HZ));
  const c1 = Math.min(CTRL_LEN - 1, Math.ceil((seg.end + 0.35) * CTRL_HZ));
  for (let c = c0; c <= c1; c++) speechActivity[c] = 1.0;
}
// Smooth control curve with 280ms low-pass window so ducking breathes like a human mixing engineer
const duckGainCtrl = new Float32Array(CTRL_LEN);
let smoothAct = 0;
for (let c = 0; c < CTRL_LEN; c++) {
  const target = speechActivity[c];
  const coeff = target > smoothAct ? 0.14 : 0.045;
  smoothAct += (target - smoothAct) * coeff;
  // Music gain: 0.34 when narrator speaks, gently blooms to 0.85 during visual showcases
  duckGainCtrl[c] = 0.85 - 0.51 * smoothAct;
}

console.log('2/4 Composing original 08:12 ambient-corporate cinematic score & sound design...');
const mixL = new Float32Array(TOTAL_SAMPLES);
const mixR = new Float32Array(TOTAL_SAMPLES);

// Warm acoustic/ambient chord palette in F Major / D minor9 (frequencies in Hz)
// Progression cycles smoothly every 16 seconds (4 seconds per chord = 60 BPM)
const CHORDS = [
  // Fmaj9: F2, C3, F3, A3, C4, G4
  { bass: 87.31, notes: [174.61, 220.00, 261.63, 329.63, 392.00], arp: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 392.00] },
  // Dm11: D2, A2, F3, A3, C4, G4
  { bass: 73.42, notes: [146.83, 220.00, 261.63, 349.23, 392.00], arp: [293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66, 440.00] },
  // Bbmaj9: Bb1, F2, D3, F3, A3, C4
  { bass: 58.27, notes: [174.61, 233.08, 293.66, 349.23, 440.00], arp: [233.08, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66] },
  // C6/9: C2, G2, E3, G3, A3, D4
  { bass: 65.41, notes: [196.00, 246.94, 293.66, 329.63, 440.00], arp: [261.63, 293.66, 392.00, 440.00, 587.33, 440.00, 392.00, 293.66] },
];

const TWO_PI = Math.PI * 2;
const CHORD_DUR = 4.0;
const CHORD_SAMPLES = CHORD_DUR * SR;
const NUM_BARS = Math.ceil(TOTAL_SEC / CHORD_DUR);

// Render warm stereo pads + sub-bass bar-by-bar with 0.8s overlap crossfade so zero chord clicks
for (let bar = 0; bar < NUM_BARS; bar++) {
  const chord = CHORDS[bar % CHORDS.length];
  const barStart = bar * CHORD_DUR;
  const sStart = Math.max(0, Math.round((barStart - 0.6) * SR));
  const sEnd = Math.min(TOTAL_SAMPLES, Math.round((barStart + CHORD_DUR + 0.6) * SR));
  const len = sEnd - sStart;

  // Macro energy curve across the 8m12s film so sections feel dynamic and alive
  let sectionLift = 1.0;
  if (barStart < 30) sectionLift = 1.12;             // Energetic opening
  else if (barStart < 75) sectionLift = 0.86;        // Intimate, warm story
  else if (barStart < 170) sectionLift = 1.05;       // Confident design showcases
  else if (barStart < 315) sectionLift = 0.94;       // Clean product & admin focus
  else if (barStart < 405) sectionLift = 1.08;       // Authoritative value & trust
  else if (barStart < 445) sectionLift = 0.96;       // Warm friendly invitation
  else sectionLift = 1.16;                           // Uplifting brand finale

  const phasesA = chord.notes.map((_, idx) => idx * 1.13 + bar * 0.37);
  const phasesB = chord.notes.map((_, idx) => idx * 2.07 + bar * 0.51);
  let bassPhase = 0;

  for (let i = 0; i < len; i++) {
    const idx = sStart + i;
    const localT = (idx / SR) - barStart;
    // Smooth raised-cosine window across the 0.6s overlap edges
    let win = 1.0;
    if (localT < 0.6) {
      win = 0.5 * (1 + Math.sin((Math.PI * (localT - 0.0)) / 1.2));
    } else if (localT > CHORD_DUR - 0.6) {
      win = 0.5 * (1 - Math.sin((Math.PI * (localT - CHORD_DUR)) / 1.2));
    }
    win = Math.max(0, Math.min(1, win));

    // Gentle warm sub-bass
    bassPhase += (TWO_PI * chord.bass) / SR;
    const sub = Math.sin(bassPhase) * 0.042 + Math.sin(bassPhase * 2) * 0.012;

    let padL = sub;
    let padR = sub;
    for (let k = 0; k < chord.notes.length; k++) {
      const f = chord.notes[k];
      phasesA[k] += (TWO_PI * f * 0.9985) / SR;
      phasesB[k] += (TWO_PI * f * 1.0015) / SR;
      const vA = Math.sin(phasesA[k]) + 0.22 * Math.sin(phasesA[k] * 2);
      const vB = Math.sin(phasesB[k]) + 0.22 * Math.sin(phasesB[k] * 2);
      const pan = (k / (chord.notes.length - 1)) * 0.65 + 0.175;
      padL += (vA * (1 - pan) + vB * 0.35) * 0.0165;
      padR += (vB * pan + vA * 0.35) * 0.0165;
    }

    const g = win * sectionLift;
    mixL[idx] += padL * g;
    mixR[idx] += padR * g;
  }

  // Delicate felt-piano eighth-note plucks (8 notes per 4s bar = every 0.50s)
  for (let step = 0; step < 8; step++) {
    const noteTime = barStart + step * 0.5;
    if (noteTime >= TOTAL_SEC - 1.2) break;
    // Skip every occasional note in quieter storytelling section for organic breathing
    if (barStart >= 30 && barStart < 75 && step % 2 === 1) continue;

    const freq = chord.arp[step % chord.arp.length];
    const n0 = Math.round(noteTime * SR);
    const noteLen = Math.min(Math.round(1.15 * SR), TOTAL_SAMPLES - n0);
    const panR = 0.28 + ((step * 37) % 100) / 220;
    const panL = 1.0 - panR;
    const vel = (step === 0 ? 1.0 : step === 4 ? 0.85 : 0.62) * 0.030 * sectionLift;
    let ph = 0;
    for (let n = 0; n < noteLen; n++) {
      const t = n / SR;
      const attack = Math.min(1, t / 0.008);
      const decay = Math.exp(-t * 3.6);
      ph += (TWO_PI * freq) / SR;
      // Felt piano timbre: fundamental + soft 2nd & decaying 3rd harmonic
      const sig =
        Math.sin(ph) * 0.72 +
        Math.sin(ph * 2) * 0.22 * Math.exp(-t * 6.0) +
        Math.sin(ph * 3) * 0.06 * Math.exp(-t * 11.0);
      const v = sig * attack * decay * vel;
      mixL[n0 + n] += v * panL;
      mixR[n0 + n] += v * panR;
    }
  }
}

// Apply smooth lookahead sidechain ducking + gentle global fade-in (0.4s) & fade-out (last 2.2s)
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SR;
  const cIdx = Math.min(CTRL_LEN - 1, Math.floor(t * CTRL_HZ));
  let env = duckGainCtrl[cIdx];
  if (t < 0.4) env *= t / 0.4;
  if (t > TOTAL_SEC - 2.2) env *= Math.max(0.08, (TOTAL_SEC - t) / 2.2);
  mixL[i] *= env;
  mixR[i] *= env;
}

// Layer subtle, refined UI sound effects (soft glass taps, warm fifth chimes, gentle air transitions)
let noiseSeed = 1234567;
function nextNoise() {
  noiseSeed = (noiseSeed * 16807) % 2147483647;
  return (noiseSeed / 1073741823.5) - 1.0;
}

for (const cue of SFX_CUES) {
  const s0 = Math.round(cue.at * SR);
  if (s0 < 0 || s0 >= TOTAL_SAMPLES - SR) continue;

  if (cue.type === 'tap') {
    const dur = Math.round(0.075 * SR);
    for (let n = 0; n < dur; n++) {
      const t = n / SR;
      const env = Math.min(1, t / 0.002) * Math.exp(-t * 58);
      const v = (Math.sin(TWO_PI * 1046.5 * t) * 0.65 + Math.sin(TWO_PI * 1568 * t) * 0.35) * env * cue.gain * 0.14;
      mixL[s0 + n] += v;
      mixR[s0 + n] += v;
    }
  } else if (cue.type === 'chime' || cue.type === 'chimeHi') {
    const freqs = cue.type === 'chimeHi' ? [523.25, 659.25, 783.99, 1046.5] : [349.23, 523.25, 659.25];
    freqs.forEach((f, idx) => {
      const start = s0 + Math.round(idx * 0.045 * SR);
      const dur = Math.min(Math.round(1.35 * SR), TOTAL_SAMPLES - start);
      for (let n = 0; n < dur; n++) {
        const t = n / SR;
        const env = Math.min(1, t / 0.01) * Math.exp(-t * 2.9);
        const v = (Math.sin(TWO_PI * f * t) * 0.8 + Math.sin(TWO_PI * f * 2 * t) * 0.2 * Math.exp(-t * 5)) * env * cue.gain * 0.085;
        mixL[start + n] += v * (idx % 2 === 0 ? 1.05 : 0.85);
        mixR[start + n] += v * (idx % 2 === 0 ? 0.85 : 1.05);
      }
    });
  } else if (cue.type === 'whoosh') {
    const dur = Math.min(Math.round(0.46 * SR), TOTAL_SAMPLES - s0);
    let lpL = 0, lpR = 0;
    for (let n = 0; n < dur; n++) {
      const u = n / dur;
      const env = Math.sin(Math.PI * u) ** 1.8;
      const alpha = 0.02 + 0.09 * Math.sin(Math.PI * u);
      lpL += alpha * (nextNoise() - lpL);
      lpR += alpha * (nextNoise() - lpR);
      mixL[s0 + n] += lpL * env * cue.gain * 0.16 * (1 - 0.35 * u);
      mixR[s0 + n] += lpR * env * cue.gain * 0.16 * (0.65 + 0.35 * u);
    }
  }
}

console.log('3/4 Mixing voiceover foreground + sidechained music/SFX stems...');
// Write standalone music+SFX stem AND master combined stereo WAV -> AAC 192k
function writeStereoWav(filePath, leftFn, rightFn) {
  const dataBytes = TOTAL_SAMPLES * 4;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(2, 22); // Stereo
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataBytes, 40);

  const fd = fs.openSync(filePath, 'w');
  fs.writeSync(fd, header);

  const CHUNK = 48000 * 4; // 4-second write chunks
  const buf = Buffer.alloc(CHUNK * 4);
  for (let offset = 0; offset < TOTAL_SAMPLES; offset += CHUNK) {
    const end = Math.min(TOTAL_SAMPLES, offset + CHUNK);
    let p = 0;
    for (let i = offset; i < end; i++) {
      // Soft-clipping limiter at +-0.97 to guarantee zero digital clipping
      let l = leftFn(i);
      let r = rightFn(i);
      l = Math.tanh(l * 1.04) * 0.96;
      r = Math.tanh(r * 1.04) * 0.96;
      buf.writeInt16LE(Math.round(l * 32767), p);
      buf.writeInt16LE(Math.round(r * 32767), p + 2);
      p += 4;
    }
    fs.writeSync(fd, buf, 0, p);
  }
  fs.closeSync(fd);
}

const masterWav = path.join(OUT_DIR, 'master-mix.wav');
const masterM4a = path.join(OUT_DIR, 'master-mix.m4a');
const voMasterMp3 = path.join(OUT_DIR, 'voiceover-clean.mp3');

writeStereoWav(
  masterWav,
  (i) => voMono[i] * 0.94 + mixL[i],
  (i) => voMono[i] * 0.94 + mixR[i]
);

// Export clean standalone voiceover MP3 + high-bitrate AAC master audio
writeStereoWav(
  path.join(OUT_DIR, '_vo_tmp.wav'),
  (i) => voMono[i] * 0.94,
  (i) => voMono[i] * 0.94
);
execFileSync(ffmpeg, ['-y', '-i', path.join(OUT_DIR, '_vo_tmp.wav'), '-c:a', 'libmp3lame', '-b:a', '160k', voMasterMp3], { stdio: 'ignore' });
fs.unlinkSync(path.join(OUT_DIR, '_vo_tmp.wav'));

execFileSync(ffmpeg, ['-y', '-i', masterWav, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', masterM4a], { stdio: 'ignore' });
fs.unlinkSync(masterWav); // Keep workspace lean; master-mix.m4a + voiceover-clean.mp3 are kept

console.log('4/4 Running broadcast audio QA...');
const vol = spawnSync(ffmpeg, ['-i', masterM4a, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
const info = JSON.parse(execFileSync(ffprobe, ['-v', 'quiet', '-print_format', 'json', '-show_format', masterM4a], { encoding: 'utf8' }));
const stats = vol.stderr.split('\n').filter((l) => l.includes('mean_volume') || l.includes('max_volume')).join(' | ');
console.log(`   master-mix.m4a duration: ${info.format.duration}s | ${stats}`);
