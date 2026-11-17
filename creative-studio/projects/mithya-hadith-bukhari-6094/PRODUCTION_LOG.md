# PRODUCTION LOG — mithya-hadith-bukhari-6094

**Current state:** `qc-passed-awaiting-final-approval`

## 2026-11-17 — Phase 1

- Topic received (Bengali): "মিথ্যা সম্পর্কে একটা হাদিস বের করো সেটা নিয়ে কাজ করো"
- Researched & selected **Sahih al-Bukhari 6094 / Sahih Muslim 2607** (Abdullah ibn
  Mas'ud RA; grading: Sahih, agreed upon). Sources: sunnah.com, hadithbd.com
  (Tawheed), ihadis.com, tohed.com. Alternatives logged in RESEARCH.md.
- Creative concept: «তোমার নামের পাশে কী লেখা হচ্ছে?» — the two recorded names.
- Wrote SCRIPT.md (v1.0), STORYBOARD.md (8 scenes), TIMELINE.md (≈90s plan),
  PRODUCTION_PLAN.md, VOICE_SETTINGS.md, ASSET_MANIFEST.md.
- Presented plan + voice options to user. **Waiting for: voice choice + approval.**
- Note: Drive uploads still blocked (connector parameter issue) — delivery via Git
  links fallback, Drive retry at delivery time.

## 2026-11-17 — Phase 2 (production)

- **User approval received** — plan approved; voice **V1 documentary male** chosen
  (`voice-00`).
- `npm install` (ffmpeg/ffprobe toolchain); Amiri fonts cloned (OFL) into
  `creative-studio/assets/fonts/amiri/` for Arabic calligraphy.
- Generated 8 AI backgrounds (`assets/bg-s1..s8.jpg`, 768×1376). bg-s2 regenerated
  once: first output carried a cross-like ornament (Islamic-content violation) —
  fixed via negative prompt, verified clean.
- Generated 8 VO clips with voice-00 (≈84.2s speech total) incl. Arabic recitation
  test `vo-s4-arabic.mp3` (22.1s) — text matches RESEARCH.md matn verbatim.
- Wrote project renderer `render/config.mjs` + `render/render.mjs`
  (Skia canvas → rawvideo → ffmpeg; schedule built from actual VO durations).
- QA stills → fixes: absolute-vs-local time bug (text missing S2+), double-drawn
  words, S2 text moved off bright book, S3 header 44px, S5 landing word dark plate,
  S7 label alignment, S8 text moved below horizon, S3 card text = VO wording.
- Audio chain fixes for 2018 ffmpeg build: `aevalsrc exprs`, amix without
  `normalize` (+compensating gain), `aformat` layout pinning, mono downmix.
- **Full render:** `output/Mithya-Hadith-Bukhari-6094-Final.mp4` — 92.84s,
  1080×1920@30, H.264 CRF19, AAC 192k, 38.5 MB, faststart. Render time 151s.
- QC: 13 checkpoint frames from the encoded file verified (all 8 scenes,
  transitions, signature). Audio post-master −2.5 dB → integrated −12.0 LUFS,
  TP −0.9 dBTP, no clipping. No audio under Arabic recitation except VO (pad
  split around S4). SRT sidecar: 26 cues.
- Thumbnail rendered: `assets/thumbnail.png` (1080×1920, split-frame design).
- Drive: connector bridge parameter-drop bug recurred — root folder
  «Abdur Rahman Nayeem - Creative Studio» created (ID `1reCNUTWBI_h9MVvSv5iT7Dqmd4gYSIud`);
  subfolder creation blocked. Uploads deferred until final approval + stable bridge.

## 2026-11-17 — v2 revision (brand watermark)

- User change request: replace final-only signature with a **persistent, small
  logo-style watermark** (creator photo + name) in one fixed place, bottom-right.
- Brand assets: `creative-studio/assets/brand/creator-photo.jpg` (user-provided) →
  circular gold-ring avatar `avatar-ring.png` (256px, generated in renderer).
- Renderer: `drawWatermark()` — avatar 72px + italic name, 62% opacity, fade-in at
  start, fades with final fade-out; drawn on every frame after scene transitions.
  Old final `drawSignature` removed (single consistent brand element).
- Bug found & fixed: napi-rs Image decodes async — drawing immediately after
  setting `src` produced blank output (affected avatar build; fixed with a
  post-load settle wait).
- S4 footer moved from bottom-center to bottom-left to avoid touching the
  watermark; thumbnail now carries the avatar+name logo (bottom-right).
- **v2 render:** same spec (92.84s, 1080×1920@30, H.264 + AAC), audio post-master
  re-applied (−12.0 LUFS, TP −0.9 dBTP). QC: watermark verified in 4 encoded
  frames across scenes; thumbnail re-checked (corner-clean).
