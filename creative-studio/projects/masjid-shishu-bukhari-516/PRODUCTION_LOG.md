# PRODUCTION LOG — masjid-shishu-bukhari-516

**Current state:** `qc-passed — awaiting user review`

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
