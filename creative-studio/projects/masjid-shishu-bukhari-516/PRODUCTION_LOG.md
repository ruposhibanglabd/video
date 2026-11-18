# PRODUCTION LOG — masjid-shishu-bukhari-516

**Current state:** `qc-passed — awaiting user review (v2, light theme)`

## 2026-11-17 — v3 production in progress (approved cinematic plan)

- User selected cinematic storytelling, previous voice, runtime as story demands; then approved production with “করো”. `SCRIPT_V3_PROPOSAL.md` and `SHOT_PLAN_V3_PROPOSAL.md` are the active v3 specs.
- All 10 available speech-generation clips made: Bengali S1–S8 + combined S9/S10, and separately spoken Arabic excerpt (S6); voice `voice-00`. Composite schedule ≈162.59 s including purposeful pauses; Arabic isolated from pad. Bengali S9/S10 audio splits at 15.75s, in the 15.318–16.197s detected silence.
- Image generator has a **10-call per-turn cap**. This turn generated 8 usable new photographic shot assets (`assets/v3/shot-01/02/03/04/05/06/07/14.jpg`); shot 01 was regenerated from v2's compact prayer-row reference after first attempt showed unacceptable row gaps. Missing **20 individual AI shots**: 08–13, 15–28 excluding 14. Do NOT label any fallback-only preview a final deliverable.
- New shot-based compositor `render/render-v3.mjs` created (28-shot manifest; source-image fallback permitted ONLY for internal draft/still QC). Light opaque paper card, deep-emerald ink, corrected Arabic/Bengali source labels, 0.32s shot transitions, continuous watermark with verified avatar pixel decode; stills S1/S5 inspected for legibility and row geometry. It hard-blocks a final render until all 28 new shot files exist.
- Audio build checked: **−14.0 LUFS / −3.7 dBTP** in draft WAV; isolated Arabic 5.09 s. `--plan`, `--still`, `--audio-only` work. Large intermediate WAV/stills removed after QC; regenerate when rendering.
- **Next:** generate the missing 20 `shot-NN.jpg` across subsequent turns (limit resets per turn), inspect each for continuity/row accuracy and Prophet non-depiction; replace poor images. Then full v3 render → encoded-frame text/transition/audio QC → deliver v3 independently, leaving v2 untouched. No Drive upload before review.

## 2026-11-17 — v2 (LIGHT THEME, user-requested)

- User feedback on v1: scenes too dark → **all 9 backgrounds regenerated in a
  bright light palette**; S1 prayer image fixed — **compact shoulder-to-shoulder
  rows (no gaps)**, white mosque interior, children at the back.
- Renderer switched to light theme: base text deep-emerald ink `#16382A`,
  highlights gold-ink `#8A6A1F`, white-gold glow, paper veils/plates behind text
  (S7 top band + node plates + footer pills + S9 veil), footer pills, boundary
  fades now ivory (final fade stays black), watermark ink + white shadow.
- Re-render: 2441 frames → 81.367s, 38.8MB; post-master re-applied →
  **−12.1 LUFS / −0.9 dBTP** ✔; encoded 3×3 tile QC ✔ (watermark all scenes);
  thumbnail re-rendered (light theme, text clear of subject).
- State: `qc-passed — awaiting user review (v2)`.

## 2026-11-17 — Phase 2 (production) — v1 delivered

- 9 AI backgrounds generated (768×1376, center-cropped) + 9 VO clips (voice-00;
  S5 Arabic `language: ar`, 9.22s recitation).
- Renderer adapted from mithya engine: 9 new painters, RTL Arabic reveal (3 lines),
  S2→S3 hard cut, ember quote card, S7 promise-node graph with dark label plates,
  reference footers bottom-left; persistent brand watermark bottom-right.
- **Fixes during QC stills:** (1) napi-rs `Image.width` is readable before pixel
  decode — flat waits flaky → avatar now drawn in a **pixel-verified retry loop**
  (center-pixel sample, growing backoff); (2) S7 sky too bright → top dark band +
  node label plates; (3) S7 footer shortened (watermark collision); (4) missing
  `panel()` helper re-added; (5) S2 'রাগী' hi → ember.
- Full render: 2441 frames @ ~19.5fps → **81.367s, 1080×1920, h264+aac, 35.8MB**.
- Post-master: `volume=-2.5dB,alimiter=limit=0.79` (re-render produced −11.6 LUFS)
  → final **−12.1 LUFS, TP −0.9 dBTP** ✔. Encoded-file 3×3 tile QC ✔ (watermark
  in all scenes). Thumbnail rendered (+contrast plate). SRT written.
- Watch page: port 8081 (`/tmp/serve-watch-masjid.mjs`). Awaiting user review;
  Drive upload pending approval.

## 2026-11-17 — Phase 1

- Topic (user, Bengali): মসজিদে শিশুদের নামাজ/দৌড়াদৌড়িতে ধমক না দেওয়া; মুরুব্বিদের
  ভুল → শিশুর নামাজ/মসজিদ-বিমুখতা; আল্লাহ ও রাসূল ﷺ-এর বিধান — বিস্তারিত ভিডিও।
- Verified sources (sunnah.com + ihadis.com): **Bukhari 516** (উমামা কাঁধে, সহীহ),
  **Nasa'i 1141** (সিজদা দীর্ঘ, সহীহ — Darussalam), **Bukhari 660/Muslim 1031**
  (সাত শ্রেণি — আরশের ছায়া, মুত্তাফাক আলাইহি)। Abu Dawud 495 যাচাইকৃত কিন্তু
  সুযোগ-বিচারে বাদ (১০-বছর শাস্তি-ধারা স্কোপের বাইরে)।
- Title: «সে আর মসজিদে আসে না»। 9 scenes, ≈102s (actual 81.4s), S5 = Arabic-only
  (no music)।
- নবী ﷺ অচিত্রিত রাখার সিদ্ধান্ত; S6 প্রতীকী।
- Voice: V1 (voice-00) — user approved reuse (2026-11-17)।
- Plan + script approved by user 2026-11-17 → Phase 2।
