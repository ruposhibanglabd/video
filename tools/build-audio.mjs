#!/usr/bin/env node
/**
 * CodePixel Web — Studio Audio Mastering, Millisecond Sync Analyzer & Procedural Sound Design
 *
 * 1. Decodes the 10 generated Bengali voiceover clips at 48 kHz mono float32 PCM.
 * 2. Splits Clip 06-07 cleanly at its exact natural sentence silence into Scene 06 & Scene 07.
 * 3. Trims excess leading/trailing TTS padding with smooth 20 ms cosine fades and detects
 *    exact internal clause/beat timestamps inside every scene to 1 ms precision.
 * 4. Masters the standalone clean voiceover (`assets/voiceover/codepixel-voiceover.mp3` +
 *    `assets/voiceover/voiceover.mp3`).
 * 5. Synthesizes an original, 100% royalty-free stereo 48 kHz digital-agency ambient score
 *    + frame-synced UI foley & cinematic accents (`assets/audio/codepixel-music-sfx.mp3`).
 * 6. Sidechain-ducks the music beneath the voiceover with generous vocal headroom and zero
 *    clipping (`assets/audio/codepixel-final-audio.m4a`) and exports exact sync data to
 *    `src/scenes/syncData.mjs` and `public/media/timeline.json`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const FFMPEG = require('@ffmpeg-installer/ffmpeg').path;
const FFPROBE = require('@ffprobe-installer/ffprobe').path;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SR = 48000;

function decodeMonoF32(file) {
  const buf = execFileSync(FFMPEG, [
    '-hide_banner', '-loglevel', 'error',
    '-i', file,
    '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', '1', '-ar', String(SR),
    'pipe:1',
  ], { maxBuffer: 256 * 1024 * 1024 });
  return new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
}

function writeWavStereo(file, left, right) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const n = left.length;
  const dataBytes = n * 2 * 2; // 16-bit stereo
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(2, 22); // stereo
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataBytes, 40);

  const pcm = Buffer.alloc(dataBytes);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-0.985, Math.min(0.985, left[i]));
    const r = Math.max(-0.985, Math.min(0.985, right[i]));
    pcm.writeInt16LE(Math.round(l * 32767), i * 4);
    pcm.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
  }
  fs.writeFileSync(file, Buffer.concat([header, pcm]));
}

/** Find speech active region & internal pauses using 10ms RMS windows. */
function analyzePcm(samples, threshDb = -36) {
  const win = Math.round(SR * 0.01); // 10ms = 480 samples
  const frames = Math.floor(samples.length / win);
  const thresh = Math.pow(10, threshDb / 20);
  const rms = new Float32Array(frames);
  let peak = 1e-6;
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    const base = i * win;
    for (let j = 0; j < win; j++) {
      const v = samples[base + j];
      sum += v * v;
      const av = Math.abs(v);
      if (av > peak) peak = av;
    }
    rms[i] = Math.sqrt(sum / win);
  }

  let firstActive = 0;
  while (firstActive < frames && rms[firstActive] < thresh) firstActive++;
  let lastActive = frames - 1;
  while (lastActive > firstActive && rms[lastActive] < thresh) lastActive--;

  const padLead = Math.round(SR * 0.045);
  const padTrail = Math.round(SR * 0.065);
  const trimStart = Math.max(0, firstActive * win - padLead);
  const trimEnd = Math.min(samples.length, (lastActive + 1) * win + padTrail);

  // Detect internal pauses >= 130ms inside trimmed region
  const pauses = [];
  let inSil = false;
  let silStart = 0;
  const fStart = Math.floor(trimStart / win);
  const fEnd = Math.ceil(trimEnd / win);
  for (let i = fStart; i < fEnd; i++) {
    if (rms[i] < thresh) {
      if (!inSil) { inSil = true; silStart = i; }
    } else if (inSil) {
      const durMs = (i - silStart) * 10;
      if (durMs >= 130) {
        const s = (silStart * win - trimStart) / SR;
        const e = (i * win - trimStart) / SR;
        pauses.push({ start: +s.toFixed(3), end: +e.toFixed(3), mid: +((s + e) / 2).toFixed(3), durMs });
      }
      inSil = false;
    }
  }

  return { trimStart, trimEnd, peak, pauses };
}

function sliceClean(samples, start, end, gainScale = 1.0) {
  const len = Math.max(1, end - start);
  const out = new Float32Array(len);
  const fade = Math.min(Math.round(SR * 0.02), Math.floor(len / 4));
  for (let i = 0; i < len; i++) {
    let g = gainScale;
    if (i < fade) g *= 0.5 * (1 - Math.cos((Math.PI * i) / fade));
    else if (i >= len - fade) g *= 0.5 * (1 - Math.cos((Math.PI * (len - 1 - i)) / fade));
    out[i] = samples[start + i] * g;
  }
  return out;
}

const CLIP_DIR = path.join(ROOT, 'assets', 'voiceover', 'clips');

// Decode all clips and split 06-07 cleanly at its sentence pause (~9.74s)
const raw0607 = decodeMonoF32(path.join(CLIP_DIR, '06-07-management.mp3'));
// Find the major sentence pause near 9.0s..10.5s in 06-07-management.mp3
let splitSample = Math.round(9.738 * SR);
{
  const info0607 = analyzePcm(raw0607, -35);
  // Pauses inside info0607 are relative to trimStart
  const target = info0607.pauses
    .map((p) => ({ ...p, absMid: info0607.trimStart / SR + p.mid }))
    .filter((p) => p.absMid > 8.8 && p.absMid < 10.6)
    .sort((a, b) => b.durMs - a.durMs)[0];
  if (target) splitSample = Math.round(target.absMid * SR);
}

const SCENE_DEFS = [
  {
    id: 'scene-01-hook',
    num: '01',
    titleBn: 'শক্তিশালী হুক ও অফার সূচনা',
    titleEn: 'Attention Hook & Zero-Advance Offer',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '01-hook.mp3')),
    gapAfter: 0.28,
    script: 'আপনার ব্যবসার জন্য প্রিমিয়াম ওয়েবসাইট চান? মাত্র ৩০০০ টাকায়—তাও কোনো অগ্রিম পেমেন্ট ছাড়াই!',
    visualSummary: 'ফেসবুক ইনবক্সের বিশৃঙ্খলা কেটে ডায়াগোনাল লাইট-মাস্ক ট্রানজিশনে প্রিমিয়াম ই-কমার্স ওয়েবসাইট ও “মাত্র ৩০০০ টাকা · কোনো অগ্রিম পেমেন্ট নেই” ব্যাজ প্রকাশ।',
    transition: 'cut',
  },
  {
    id: 'scene-02-website',
    num: '02',
    titleBn: 'কাস্টমার ওয়েবসাইট ও ব্র্যান্ড পরিচিতি',
    titleEn: 'Branded Storefront & Multi-Category Showcase',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '02-website.mp3')),
    gapAfter: 0.28,
    script: 'ফেসবুক পেজের ভিড়ে হারিয়ে না গিয়ে, CodePixel Web-এর মাধ্যমে গড়ে তুলুন আপনার নিজস্ব ব্র্যান্ডের গোছানো অনলাইন স্টোর। পোশাক, ঘড়ি, কসমেটিকস, জুতা কিংবা ইলেকট্রনিক্স—মোবাইল ও কম্পিউটারে আপনার প্রতিটি পণ্য দেখাবে প্রিমিয়াম ও বিশ্বাসযোগ্য।',
    visualSummary: 'ডেস্কটপ ও মোবাইল রেসপন্সিভ ফ্রেমে NOIRÉ (পোশাক), TIMEORA (ঘড়ি), LUMÉRA (কসমেটিকস), NEXT IQ (জুতা) ও TECHORA (ইলেকট্রনিক্স) স্টোরফ্রন্ট ক্যারোসেল।',
    transition: 'wipe',
  },
  {
    id: 'scene-03-browsing',
    num: '03',
    titleBn: 'পণ্য ব্রাউজিং, ক্যাটাগরি ও স্মার্ট ফিল্টার',
    titleEn: 'Product Browsing, Categories & Search Filter',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '03-browsing.mp3')),
    gapAfter: 0.26,
    script: 'আকর্ষণীয় ব্যানার, আলাদা ক্যাটাগরি, স্মার্ট সার্চ ও ফিল্টারের কারণে কাস্টমার এক নজরেই খুঁজে পাবেন পছন্দের পণ্য—পরিষ্কার ছবি, সঠিক দাম, স্টক ও বিস্তারিত বিবরণসহ।',
    visualSummary: 'লাইভ ক্যাটাগরি ট্যাব সুইচিং, সার্চ বার অ্যানিমেশন এবং আসল স্টুডিও পণ্যের ছবি, দাম (৳), স্টক ব্যাজ ও বিবরণসহ প্রোডাক্ট কার্ড ব্রাউজিং।',
    transition: 'push',
  },
  {
    id: 'scene-04-shopping',
    num: '04',
    titleBn: 'সাইজ/কালার নির্বাচন, কার্ট ও স্মার্ট চেকআউট',
    titleEn: 'Variant Selection, Cart & Smart Checkout',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '04-shopping.mp3')),
    gapAfter: 0.36,
    script: 'ইনবক্সে অপেক্ষা নয়—কাস্টমার নিজেই সাইজ বা কালার বেছে কার্টে যোগ করবেন, আর ক্যাশ অন ডেলিভারি কিংবা বিকাশ, নগদ ও কার্ডে কয়েক সেকেন্ডেই অর্ডার সম্পন্ন করবেন।',
    visualSummary: 'প্রোডাক্ট পেজে সাইজ (L) ও কালার নির্বাচন → কার্টে যোগ → স্মার্ট চেকআউটে COD / bKash / Nagad / Card নির্বাচন ও ইনস্ট্যান্ট অর্ডার কনফার্মেশন।',
    transition: 'push',
  },
  {
    id: 'scene-05-admin',
    num: '05',
    titleBn: 'অ্যাডমিন প্যানেল — আপনার স্টোর কন্ট্রোল রুম',
    titleEn: 'CodePixel Commerce OS — Admin Dashboard',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '05-admin.mp3')),
    gapAfter: 0.26,
    script: 'আর শুধু সুন্দর ওয়েবসাইট নয়—দোকান চালানোর পুরো নিয়ন্ত্রণ থাকবে আপনার হাতেই! সাথে পাচ্ছেন শক্তিশালী অ্যাডমিন প্যানেল, যেখানে ড্যাশবোর্ডেই দেখবেন মোট বিক্রি, অর্ডার ও ব্যবসার লাইভ হিসাব।',
    visualSummary: 'CodePixel Commerce OS অ্যাডমিন ড্যাশবোর্ডে ক্যামেরা পুশ-ইন: মোট বিক্রি ৳৪৮,৫২০, ১২৮ অর্ডার, ৮৬ কাস্টমার, ২৪ পেন্ডিং অর্ডার ও ৩০ দিনের সেলস চার্ট।',
    transition: 'wipe',
  },
  {
    id: 'scene-06-products',
    num: '06',
    titleBn: 'পণ্য, ক্যাটাগরি, স্টক ও ভ্যারিয়েন্ট ম্যানেজমেন্ট',
    titleEn: 'Product, Category, Stock & Variant Management',
    pcm: raw0607.subarray(0, splitSample),
    gapAfter: 0.28,
    script: 'কোনো কোডিং ছাড়াই নতুন পণ্য যোগ করুন, ছবি ও দাম আপডেট করুন, ক্যাটাগরি সাজান এবং সাইজ, কালার ও স্টক পরিচালনা করুন খুব সহজে।',
    visualSummary: 'অ্যাডমিন প্যানেলে নতুন পণ্য যোগ করার ফর্ম পূরণ (ছবি আপলোড, দাম ৳২,৪৫০, স্টক ৪৫, সাইজ M/L/XL), সংরক্ষণ ক্লিক ও প্রোডাক্ট লিস্টে তাৎক্ষণিক যুক্ত হওয়া।',
    transition: 'push',
  },
  {
    id: 'scene-07-orders',
    num: '07',
    titleBn: 'অর্ডার ম্যানেজমেন্ট, স্ট্যাটাস ও কুরিয়ার অটোমেশন',
    titleEn: 'Order List, Status Update & Courier Automation',
    pcm: raw0607.subarray(splitSample),
    gapAfter: 0.34,
    script: 'আর প্রতিটি নতুন অর্ডার লিস্ট আকারে দেখুন, কাস্টমারের বিস্তারিত যাচাই করুন, এক ক্লিকে অর্ডার স্ট্যাটাস আপডেট করুন এবং কুরিয়ারে ডেলিভারি পাঠান ঝামেলা ছাড়াই।',
    visualSummary: 'সাম্প্রতিক অর্ডার তালিকা (#IMS-10482), কাস্টমারের ঠিকানা যাচাই, স্ট্যাটাস আপডেট (নতুন → প্রস্তুত হচ্ছে → কুরিয়ারে পাঠানো হয়েছে) এবং এক ক্লিকে কুরিয়ার বুকিং।',
    transition: 'push',
  },
  {
    id: 'scene-08-custom',
    num: '08',
    titleBn: 'টেমপ্লেট নয় — ব্যবসা অনুযায়ী কাস্টম ডিজাইন',
    titleEn: 'Custom Brand Design, Landing Pages & Pixel Setup',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '08-custom.mp3')),
    gapAfter: 0.38,
    script: 'এটি কোনো কপি-পেস্ট টেমপ্লেট নয়। আপনার লোগো, ব্র্যান্ডের রঙ, পণ্যের ধরন, আনলিমিটেড ল্যান্ডিং পেজ ও ফেসবুক পিক্সেলসহ পুরো সাইট কাস্টমাইজ করা হয় আপনার ব্যবসার প্রয়োজন অনুযায়ী।',
    visualSummary: 'লাইভ ব্র্যান্ড থিম কাস্টমাইজার (লোগো, রঙ, ক্যাটাগরি পরিবর্তন), আনলিমিটেড ল্যান্ডিং পেজ, কুপন ও Facebook Pixel + Conversion API কার্ড।',
    transition: 'wipe',
  },
  {
    id: 'scene-09-offer',
    num: '09',
    titleBn: 'মূল অফার প্রকাশ — মাত্র ৩০০০ টাকা',
    titleEn: 'Hero Offer Reveal — 3000 BDT & Zero Advance',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '09-offer.mp3')),
    gapAfter: 0.34,
    script: 'আর এই পূর্ণাঙ্গ কাস্টম ওয়েবসাইট ও অ্যাডমিন প্যানেলের প্যাকেজ মূল্য—মাত্র ৩০০০ টাকা! কোনো অগ্রিম পেমেন্ট নেই। কাজ শেষে ওয়েবসাইট দেখে ডেলিভারির পর পেমেন্ট। সাথে থাকছে ৩০ দিনের ফ্রি সাপোর্ট।',
    visualSummary: 'ভয়েসওভারের প্রতিটি বাক্যের সাথে বিট-বাই-বিট প্রকাশ: ১) মাত্র ৩০০০ টাকা, ২) কোনো অগ্রিম পেমেন্ট নেই, ৩) ডেলিভারির পর পেমেন্ট, ৪) ৩০ দিনের ফ্রি সাপোর্ট।',
    transition: 'wipe',
  },
  {
    id: 'scene-10-trust',
    num: '10',
    titleBn: '৪১+ লাইভ ডেমো ও প্যাকেজের সম্পূর্ণ স্বচ্ছতা',
    titleEn: '41+ Live Demos & Package Scope Transparency',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '10-trust.mp3')),
    gapAfter: 0.34,
    script: 'শুরু করার আগেই আমাদের ৪১টিরও বেশি লাইভ ডেমো ও ডেলিভার করা ওয়েবসাইট নিজে ঘুরে দেখুন। ডোমেইন, হোস্টিং এবং প্রযোজ্য ক্ষেত্রে গেটওয়ে চার্জ বা বড় কাস্টম ফিচারের হিসাবও শুরুতেই পরিষ্কারভাবে জানানো হয়—কোনো লুকানো খরচ নেই।',
    visualSummary: '৪১+ লাইভ ডেমো ও ৬টি ডেলিভার করা প্রজেক্টের প্রুফ গ্রিড এবং ৩০০০ টাকার প্যাকেজে অন্তর্ভুক্ত বনাম আলাদা বার্ষিক খরচ (ডোমেইন, হোস্টিং, প্রযোজ্য চার্জ)-এর স্বচ্ছ তুলনা।',
    transition: 'push',
  },
  {
    id: 'scene-11-cta',
    num: '11',
    titleBn: 'চূড়ান্ত আহ্বান — এখনই WhatsApp করুন',
    titleEn: 'Final Call to Action — Contact on WhatsApp',
    pcm: decodeMonoF32(path.join(CLIP_DIR, '11-cta.mp3')),
    gapAfter: 1.55,
    script: 'আপনার ব্যবসার জন্য ওয়েবসাইট তৈরি করতে এখনই WhatsApp-এ যোগাযোগ করুন। আপনার পছন্দের ডেমো ও চাহিদা সরাসরি জানান—বাকি দায়িত্ব CodePixel Web-এর।',
    visualSummary: 'CodePixel Web ব্র্যান্ড লকআপ, লাইভ স্টোরফ্রন্ট প্রিভিউ এবং বড় মোবাইল-বান্ধব WhatsApp CTA বাটন (wa.me/8801876892958 · 01876892958)।',
    transition: 'fade',
  },
];

// Normalize clip loudness evenly to target RMS (-18.5 dBFS) with peak ceiling 0.86
const TARGET_RMS = Math.pow(10, -18.5 / 20);
const LEAD_IN = 0.14; // 140ms opening cue before first syllable

const assembledSegments = [];
let cursorSamples = Math.round(LEAD_IN * SR);
const timelineScenes = [];

for (let idx = 0; idx < SCENE_DEFS.length; idx++) {
  const def = SCENE_DEFS[idx];
  const ana = analyzePcm(def.pcm, -35);
  const rawLen = Math.max(1, ana.trimEnd - ana.trimStart);

  // Measure speech RMS for consistent vocal level across all 11 clips
  let sq = 0;
  let count = 0;
  for (let i = ana.trimStart; i < ana.trimEnd; i++) {
    const v = def.pcm[i];
    if (Math.abs(v) > 0.008) { sq += v * v; count++; }
  }
  const speechRms = count > 0 ? Math.sqrt(sq / count) : 0.08;
  let gain = TARGET_RMS / Math.max(0.02, speechRms);
  if (ana.peak * gain > 0.88) gain = 0.88 / ana.peak;

  const clean = sliceClean(def.pcm, ana.trimStart, ana.trimEnd, gain);
  const gapSamples = Math.round(def.gapAfter * SR);

  const sceneStartSample = idx === 0 ? 0 : cursorSamples - Math.round(0.08 * SR);
  const speechStart = cursorSamples / SR;
  const speechEnd = (cursorSamples + clean.length) / SR;
  const sceneEndSample = cursorSamples + clean.length + gapSamples - (idx < SCENE_DEFS.length - 1 ? Math.round(0.08 * SR) : 0);

  assembledSegments.push({ offset: cursorSamples, pcm: clean });

  timelineScenes.push({
    index: idx,
    id: def.id,
    num: def.num,
    titleBn: def.titleBn,
    titleEn: def.titleEn,
    transition: def.transition,
    start: +(sceneStartSample / SR).toFixed(4),
    end: +(sceneEndSample / SR).toFixed(4),
    duration: +((sceneEndSample - sceneStartSample) / SR).toFixed(4),
    speechStart: +speechStart.toFixed(4),
    speechEnd: +speechEnd.toFixed(4),
    pauses: ana.pauses.map((p) => ({
      rel: +((speechStart - sceneStartSample / SR) + p.mid).toFixed(3),
      abs: +(speechStart + p.mid).toFixed(3),
      durMs: p.durMs,
    })),
    script: def.script,
    visualSummary: def.visualSummary,
  });

  cursorSamples += clean.length + gapSamples;
}

const totalSamples = cursorSamples;
const totalDuration = totalSamples / SR;

// Build master mono voiceover buffer
const voMono = new Float32Array(totalSamples);
for (const seg of assembledSegments) {
  voMono.set(seg.pcm, seg.offset);
}

// Save raw clean voiceover WAV -> master via FFmpeg gentle broadcast vocal EQ
const rawVoWav = path.join(ROOT, 'assets', 'voiceover', 'voiceover-raw.wav');
writeWavStereo(rawVoWav, voMono, voMono);

const cleanVoWav = path.join(ROOT, 'assets', 'voiceover', 'codepixel-voiceover.wav');
const cleanVoMp3 = path.join(ROOT, 'assets', 'voiceover', 'codepixel-voiceover.mp3');
const defaultVoMp3 = path.join(ROOT, 'assets', 'voiceover', 'voiceover.mp3');

execFileSync(FFMPEG, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', rawVoWav,
  '-af', 'highpass=f=75,equalizer=f=185:t=q:w=1.2:g=1.4,equalizer=f=3600:t=q:w=1.4:g=1.6,alimiter=limit=0.92:level=disabled',
  '-ar', String(SR), '-ac', '2',
  cleanVoWav,
]);
execFileSync(FFMPEG, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', cleanVoWav,
  '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', String(SR),
  cleanVoMp3,
]);
fs.copyFileSync(cleanVoMp3, defaultVoMp3);
fs.rmSync(rawVoWav, { force: true });

// Read back EQ-mastered voiceover for exact sidechain envelope calculation
const masteredVoMono = decodeMonoF32(cleanVoWav);

/* ---------------------------------------------------------------------------
 * PROCEDURAL STUDIO MUSIC & CINEMATIC UI SOUND DESIGN (100% ORIGINAL & CLEAN)
 * ------------------------------------------------------------------------- */
const musicL = new Float32Array(totalSamples);
const musicR = new Float32Array(totalSamples);
const sfxL = new Float32Array(totalSamples);
const sfxR = new Float32Array(totalSamples);

const TWO_PI = Math.PI * 2;
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Warm modern digital-agency chord progression (4-bar loop = 10.0s at 96 BPM):
// Dm9 (D2, A2, F3, A3, C4, E4) -> Bbmaj7 -> Fmaj9 -> Cadd9
const CHORDS = [
  { bass: 38, notes: [53, 57, 60, 64], arp: [62, 64, 65, 69, 72, 69, 65, 64] }, // Dm9
  { bass: 34, notes: [50, 53, 57, 60], arp: [58, 62, 65, 69, 70, 69, 65, 62] }, // Bbmaj7
  { bass: 41, notes: [53, 57, 60, 67], arp: [60, 64, 67, 69, 72, 69, 67, 64] }, // Fmaj9
  { bass: 36, notes: [52, 55, 60, 62], arp: [60, 62, 64, 67, 72, 67, 64, 62] }, // Cadd9
];

const CHORD_LEN = 2.5; // 1 bar at 96 BPM = 2.5s

// Render warm stereo analog-style pads + gentle sub bass + soft muted pluck pulse
{
  const totalChords = Math.ceil(totalDuration / CHORD_LEN) + 1;
  for (let c = 0; c < totalChords; c++) {
    const chord = CHORDS[c % CHORDS.length];
    const startSec = Math.max(0, c * CHORD_LEN - 0.35);
    const endSec = Math.min(totalDuration, (c + 1) * CHORD_LEN + 0.45);
    const i0 = Math.floor(startSec * SR);
    const i1 = Math.min(totalSamples, Math.ceil(endSec * SR));
    const dur = (i1 - i0) / SR;
    if (i1 <= i0) continue;

    const bassHz = midiToHz(chord.bass);
    const noteHz = chord.notes.map(midiToHz);

    for (let i = i0; i < i1; i++) {
      const local = (i - i0) / SR;
      // Smooth crossfade envelope
      let env = 1.0;
      if (local < 0.45) env = 0.5 * (1 - Math.cos((Math.PI * local) / 0.45));
      else if (dur - local < 0.55) env = 0.5 * (1 - Math.cos((Math.PI * (dur - local)) / 0.55));

      const t = i / SR;
      // Warm sub-bass sine + subtle 2nd harmonic
      const sub = (Math.sin(TWO_PI * bassHz * t) * 0.78 + Math.sin(TWO_PI * bassHz * 2 * t) * 0.22) * 0.085;

      // Stereo detuned warm pad voices (pure low-harmonic synthesis -> zero harshness)
      let padL = 0;
      let padR = 0;
      for (let k = 0; k < noteHz.length; k++) {
        const f = noteHz[k];
        const lfo = 1 + 0.0018 * Math.sin(TWO_PI * (0.28 + k * 0.11) * t + k);
        const v1 = Math.sin(TWO_PI * f * lfo * t) + 0.28 * Math.sin(TWO_PI * f * 2 * t);
        const v2 = Math.sin(TWO_PI * f * (2 - lfo) * t + 0.7) + 0.28 * Math.sin(TWO_PI * f * 2 * t + 0.4);
        const pan = 0.28 + 0.44 * (k / (noteHz.length - 1));
        padL += v1 * (1 - pan * 0.55);
        padR += v2 * (0.45 + pan * 0.55);
      }
      musicL[i] += (sub + padL * 0.032) * env;
      musicR[i] += (sub + padR * 0.032) * env;
    }

    // Soft eighth-note muted glass pluck for forward commercial momentum
    const stepDur = CHORD_LEN / 8; // 0.3125s
    for (let s = 0; s < 8; s++) {
      const onset = c * CHORD_LEN + s * stepDur;
      if (onset >= totalDuration - 1.1) break; // clean chord ring-out at end
      const pHz = midiToHz(chord.arp[s % chord.arp.length]);
      const p0 = Math.floor(onset * SR);
      const pLen = Math.min(Math.round(0.28 * SR), totalSamples - p0);
      const pan = s % 2 === 0 ? 0.65 : 0.35;
      for (let k = 0; k < pLen; k++) {
        const lt = k / SR;
        const env = Math.min(1, lt / 0.008) * Math.exp(-lt * 11.5);
        const sig = (Math.sin(TWO_PI * pHz * lt) + 0.32 * Math.sin(TWO_PI * pHz * 2 * lt) * Math.exp(-lt * 18)) * 0.026 * env;
        musicL[p0 + k] += sig * pan;
        musicR[p0 + k] += sig * (1 - pan);
      }
    }
  }
}

// Helper SFX generators
function addWhoosh(atSec, durSec = 0.34, amp = 0.055) {
  const i0 = Math.max(0, Math.floor((atSec - durSec * 0.45) * SR));
  const len = Math.min(Math.round(durSec * SR), totalSamples - i0);
  let seed = (Math.round(atSec * 1000) * 2654435761) >>> 0;
  let lpL = 0, lpR = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const env = Math.sin(Math.PI * p) ** 1.6;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const nL = ((seed & 65535) / 32768) - 1;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const nR = ((seed & 65535) / 32768) - 1;
    const cutoff = 0.03 + 0.14 * Math.sin(Math.PI * p);
    lpL += cutoff * (nL - lpL);
    lpR += cutoff * (nR - lpR);
    const pan = 0.25 + 0.5 * p;
    sfxL[i0 + i] += lpL * amp * env * (1 - pan * 0.45);
    sfxR[i0 + i] += lpR * amp * env * (0.55 + pan * 0.45);
  }
}

function addUiClick(atSec, freq = 1320, amp = 0.05) {
  const i0 = Math.max(0, Math.floor(atSec * SR));
  const len = Math.min(Math.round(0.065 * SR), totalSamples - i0);
  for (let i = 0; i < len; i++) {
    const lt = i / SR;
    const env = Math.min(1, lt / 0.002) * Math.exp(-lt * 65);
    const sig = (Math.sin(TWO_PI * freq * lt) + 0.5 * Math.sin(TWO_PI * freq * 1.9 * lt)) * amp * env;
    sfxL[i0 + i] += sig;
    sfxR[i0 + i] += sig;
  }
}

function addShimmerChord(atSec, notesMidi = [65, 69, 72, 76, 79], durSec = 1.65, amp = 0.038) {
  const i0 = Math.max(0, Math.floor(atSec * SR));
  const len = Math.min(Math.round(durSec * SR), totalSamples - i0);
  const freqs = notesMidi.map(midiToHz);
  for (let i = 0; i < len; i++) {
    const lt = i / SR;
    const env = Math.min(1, lt / 0.035) * Math.exp(-lt * 2.35);
    let l = 0, r = 0;
    for (let k = 0; k < freqs.length; k++) {
      const delay = k * 0.028;
      if (lt < delay) continue;
      const dt = lt - delay;
      const ne = Math.min(1, dt / 0.015) * Math.exp(-dt * 2.6);
      const v = Math.sin(TWO_PI * freqs[k] * dt) + 0.25 * Math.sin(TWO_PI * freqs[k] * 2 * dt);
      l += v * ne * (k % 2 === 0 ? 0.72 : 0.35);
      r += v * ne * (k % 2 === 0 ? 0.35 : 0.72);
    }
    sfxL[i0 + i] += l * amp * env;
    sfxR[i0 + i] += r * amp * env;
  }
}

// Compute exact sub-beats per critical scene & place synced audio cues!
const s01 = timelineScenes[0];
const s02 = timelineScenes[1];
const s03 = timelineScenes[2];
const s04 = timelineScenes[3];
const s05 = timelineScenes[4];
const s06 = timelineScenes[5];
const s07 = timelineScenes[6];
const s08 = timelineScenes[7];
const s09 = timelineScenes[8];
const s10 = timelineScenes[9];
const s11 = timelineScenes[10];

// Opening cue + Hook beats (Scene 01)
addShimmerChord(0.03, [50, 57, 62, 65, 69], 1.2, 0.035);
const hookPriceBeat = s01.pauses.find((p) => p.rel > 2.2 && p.rel < 3.4)?.abs || (s01.speechStart + 2.65);
const hookZeroAdvBeat = s01.pauses.find((p) => p.rel > 4.1 && p.rel < 5.4)?.abs || (s01.speechStart + 4.65);
s01.beats = {
  revealStorefront: +(s01.start + 1.55).toFixed(3),
  priceDrop: +hookPriceBeat.toFixed(3),
  zeroAdvance: +hookZeroAdvBeat.toFixed(3),
};
addWhoosh(s01.beats.revealStorefront, 0.36, 0.06);
addShimmerChord(s01.beats.priceDrop, [62, 65, 69, 74], 1.1, 0.042);
addUiClick(s01.beats.zeroAdvance, 1480, 0.045);

// Scene transitions
for (let i = 1; i < timelineScenes.length; i++) {
  addWhoosh(timelineScenes[i].start, 0.32, 0.048);
}

// Scene 02 category showcase ticks
const s02Split = s02.pauses.find((p) => p.rel > 6.5 && p.rel < 9.0)?.abs || (s02.start + 7.8);
s02.beats = { carouselStart: +s02Split.toFixed(3) };
for (let k = 0; k < 5; k++) addUiClick(s02Split + 0.5 + k * 1.45, 1180 + k * 70, 0.026);

// Scene 03 filter + card clicks
s03.beats = { searchFocus: +(s03.start + 2.6).toFixed(3), detailFocus: +(s03.start + 7.3).toFixed(3) };
addUiClick(s03.beats.searchFocus, 1320, 0.032);
addUiClick(s03.beats.detailFocus, 1520, 0.032);

// Scene 04 size select -> add to cart -> checkout confirmed
const s04Checkout = s04.pauses.find((p) => p.rel > 4.4 && p.rel < 6.4)?.abs || (s04.start + 5.2);
s04.beats = {
  selectSize: +(s04.start + 2.1).toFixed(3),
  addToCart: +(s04.start + 3.7).toFixed(3),
  checkoutSlide: +s04Checkout.toFixed(3),
  orderConfirmed: +(s04.end - 2.3).toFixed(3),
};
addUiClick(s04.beats.selectSize, 1260, 0.035);
addUiClick(s04.beats.addToCart, 1560, 0.042);
addWhoosh(s04.beats.checkoutSlide, 0.26, 0.04);
addShimmerChord(s04.beats.orderConfirmed, [65, 69, 72, 77], 0.9, 0.035);

// Scene 05 Admin Panel reveal chime
addShimmerChord(s05.start + 0.12, [53, 60, 65, 69, 72], 1.25, 0.034);
s05.beats = { chartHighlight: +(s05.start + 5.1).toFixed(3) };

// Scene 06 Product add & save toast
s06.beats = {
  uploadPhoto: +(s06.start + 2.3).toFixed(3),
  priceStock: +(s06.start + 4.7).toFixed(3),
  saveProduct: +(s06.end - 2.2).toFixed(3),
};
addUiClick(s06.beats.uploadPhoto, 1340, 0.032);
addUiClick(s06.beats.saveProduct, 1620, 0.042);

// Scene 07 Order status & courier dispatch
s07.beats = {
  inspectOrder: +(s07.start + 2.9).toFixed(3),
  statusUpdate: +(s07.start + 5.6).toFixed(3),
  courierSent: +(s07.end - 2.4).toFixed(3),
};
addUiClick(s07.beats.inspectOrder, 1280, 0.03);
addUiClick(s07.beats.statusUpdate, 1480, 0.036);
addShimmerChord(s07.beats.courierSent, [60, 64, 67, 72], 0.85, 0.03);

// Scene 08 Brand customization switches
s08.beats = {
  theme1: +(s08.start + 2.3).toFixed(3),
  theme2: +(s08.start + 5.2).toFixed(3),
  pixelAndLanding: +(s08.start + 8.0).toFixed(3),
};
addUiClick(s08.beats.theme1, 1300, 0.03);
addUiClick(s08.beats.theme2, 1440, 0.03);

// Scene 09 — EXACT SENTENCE-LOCKED 4 OFFER BEATS!
{
  const p = s09.pauses;
  const b1 = p.find((x) => x.rel > 3.5 && x.rel < 4.9)?.abs || (s09.speechStart + 4.05);
  const b2 = p.find((x) => x.rel > 5.3 && x.rel < 6.6)?.abs || (s09.speechStart + 5.95);
  const b3 = p.find((x) => x.rel > 6.9 && x.rel < 8.4)?.abs || (s09.speechStart + 7.45);
  const b4 = p.find((x) => x.rel > 10.1 && x.rel < 11.7)?.abs || (s09.speechStart + 10.8);
  s09.beats = {
    price3000: +b1.toFixed(3),
    noAdvance: +b2.toFixed(3),
    payAfterDelivery: +b3.toFixed(3),
    freeSupport30d: +b4.toFixed(3),
  };
  addShimmerChord(b1, [62, 65, 69, 74, 77], 1.8, 0.05);
  addShimmerChord(b2, [65, 69, 72, 77], 1.0, 0.036);
  addUiClick(b3, 1520, 0.04);
  addShimmerChord(b4, [67, 72, 76, 79], 1.2, 0.038);
}

// Scene 10 — Demo showcase -> Scope transparency split
{
  const bScope = s10.pauses.find((x) => x.rel > 5.8 && x.rel < 7.8)?.abs || (s10.start + 6.6);
  s10.beats = { transparencyCards: +bScope.toFixed(3) };
  addUiClick(bScope, 1380, 0.034);
}

// Scene 11 — Final CTA button glow + warm ending chord
{
  const bDirect = s11.pauses.find((x) => x.rel > 3.5 && x.rel < 5.3)?.abs || (s11.start + 4.3);
  s11.beats = { whatsappPulse: +(s11.start + 1.6).toFixed(3), closingTagline: +bDirect.toFixed(3) };
  addUiClick(s11.beats.whatsappPulse, 1540, 0.04);
  addShimmerChord(s11.speechEnd - 0.15, [53, 60, 65, 69, 72, 76], 2.0, 0.048);
}

// Smooth master fade-in (0.2s) and clean warm ending fade-out over final 0.55s
for (let i = 0; i < totalSamples; i++) {
  const t = i / SR;
  let mEnv = 1.0;
  if (t < 0.25) mEnv = t / 0.25;
  else if (totalDuration - t < 0.55) mEnv = Math.max(0, (totalDuration - t) / 0.55);
  musicL[i] *= mEnv;
  musicR[i] *= mEnv;
}

// Export standalone Music + SFX stem (`assets/audio/codepixel-music-sfx.mp3`)
const stemL = new Float32Array(totalSamples);
const stemR = new Float32Array(totalSamples);
for (let i = 0; i < totalSamples; i++) {
  stemL[i] = musicL[i] + sfxL[i];
  stemR[i] = musicR[i] + sfxR[i];
}
const rawStemWav = path.join(ROOT, 'assets', 'audio', 'music-sfx-raw.wav');
const stemMp3 = path.join(ROOT, 'assets', 'audio', 'codepixel-music-sfx.mp3');
writeWavStereo(rawStemWav, stemL, stemR);
execFileSync(FFMPEG, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', rawStemWav,
  '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', String(SR),
  stemMp3,
]);
fs.rmSync(rawStemWav, { force: true });

// Envelope-follower sidechain ducking + final broadcast mix
const mixL = new Float32Array(totalSamples);
const mixR = new Float32Array(totalSamples);
let envFollow = 0;
const attack = Math.exp(-1 / (SR * 0.018));  // fast 18ms duck attack when voice starts
const release = Math.exp(-1 / (SR * 0.280)); // smooth 280ms bloom when voice pauses

let maxPeak = 0;
for (let i = 0; i < totalSamples; i++) {
  const v = i < masteredVoMono.length ? masteredVoMono[i] : 0;
  const av = Math.abs(v);
  envFollow = av > envFollow ? attack * envFollow + (1 - attack) * av : release * envFollow + (1 - release) * av;

  // Duck music cleanly from 1.0 down to 0.36 whenever voice is speaking
  const speaking = Math.min(1, envFollow / 0.045);
  const musicDuck = 1.0 - 0.64 * speaking;
  const sfxDuck = 1.0 - 0.22 * speaking;

  let l = v * 0.96 + musicL[i] * musicDuck + sfxL[i] * sfxDuck;
  let r = v * 0.96 + musicR[i] * musicDuck + sfxR[i] * sfxDuck;

  // Soft transparent ceiling protection at +/-0.89 (-1.0 dBFS) — zero clipping
  const softLimit = (x) => (Math.abs(x) > 0.82 ? Math.sign(x) * (0.82 + 0.07 * Math.tanh((Math.abs(x) - 0.82) / 0.07)) : x);
  l = softLimit(l);
  r = softLimit(r);
  mixL[i] = l;
  mixR[i] = r;
  maxPeak = Math.max(maxPeak, Math.abs(l), Math.abs(r));
}

const finalMixWav = path.join(ROOT, 'assets', 'audio', 'codepixel-final-mix.wav');
const finalMixM4a = path.join(ROOT, 'assets', 'audio', 'codepixel-final-audio.m4a');
const finalMixMp3 = path.join(ROOT, 'assets', 'audio', 'codepixel-final-audio.mp3');
writeWavStereo(finalMixWav, mixL, mixR);

execFileSync(FFMPEG, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', finalMixWav,
  '-c:a', 'aac', '-b:a', '256k', '-ar', String(SR),
  finalMixM4a,
]);
execFileSync(FFMPEG, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', finalMixWav,
  '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', String(SR),
  finalMixMp3,
]);
fs.rmSync(finalMixWav, { force: true });

// Measure volume stats on final master audio
const volLog = execFileSync('bash', ['-c', `"${FFMPEG}" -hide_banner -i "${finalMixM4a}" -af volumedetect -f null - 2>&1`], { encoding: 'utf8' });
const meanVol = /mean_volume:\s*([-\d.]+)\s*dB/.exec(volLog)?.[1];
const maxVol = /max_volume:\s*([-\d.]+)\s*dB/.exec(volLog)?.[1];

const syncPayload = {
  generatedAt: new Date().toISOString(),
  sampleRate: SR,
  totalSamples,
  totalDuration: +totalDuration.toFixed(4),
  fps: 30,
  totalFrames: Math.ceil(totalDuration * 30),
  audioStats: {
    meanDb: Number(meanVol),
    maxDb: Number(maxVol),
    peakLinear: +maxPeak.toFixed(4),
  },
  scenes: timelineScenes,
};

// Write ES module for Node & Browser renderer + JSON for Web UI
const syncMjs = `// Auto-generated millisecond-exact voiceover synchronization manifest\nexport const AD_SYNC = ${JSON.stringify(syncPayload, null, 2)};\n`;
fs.writeFileSync(path.join(ROOT, 'src', 'scenes', 'syncData.mjs'), syncMjs);
fs.mkdirSync(path.join(ROOT, 'public', 'media'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public', 'media', 'timeline.json'), JSON.stringify(syncPayload, null, 2));
fs.copyFileSync(cleanVoMp3, path.join(ROOT, 'public', 'media', 'codepixel-voiceover.mp3'));
fs.copyFileSync(stemMp3, path.join(ROOT, 'public', 'media', 'codepixel-music-sfx.mp3'));

console.log(JSON.stringify({
  status: 'OK',
  totalDuration: syncPayload.totalDuration,
  totalFrames: syncPayload.totalFrames,
  audioStats: syncPayload.audioStats,
  scenes: timelineScenes.map((s) => ({
    num: s.num,
    id: s.id,
    start: s.start,
    end: s.end,
    dur: s.duration,
    beats: s.beats,
  })),
}, null, 2));
