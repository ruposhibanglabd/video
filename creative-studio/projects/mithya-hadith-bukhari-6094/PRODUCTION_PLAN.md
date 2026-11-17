# PRODUCTION PLAN — «তোমার নামের পাশে কী লেখা হচ্ছে?»

**Project:** mithya-hadith-bukhari-6094 · **Date:** 2026-11-17
**Status:** ⏳ AWAITING USER APPROVAL · **Category:** B — Hadith & Sunnah

## Creative concept

- **Working title:** «তোমার নামের পাশে কী লেখা হচ্ছে?»
- **Core metaphor:** "দুটি খাতা" — প্রতিটি উচ্চারিত শব্দ আল্লাহর কাছে একটি পরিচয় লিখছে:
  **সিদ্দীক** নাকি **কায্যাব**।
- **Hook:** the question itself — asked against a golden ink-stroke writing itself in the dark.
- **Arc:** curiosity → reverence (Arabic) → two mirrored paths → climax (two names) → hope.
- **Tone:** solemn, premium, intimate — warning balanced with hope.

## Direction decisions (studio-chosen)

| Element | Decision |
|---|---|
| Visual style | Cinematic AI backgrounds + 2D motion-graphics infographic layer; symbolic only — **no depiction of the Prophet ﷺ or any person as a religious figure** |
| Color grade | Islamic education direction: emerald + champagne gold + warm ivory + controlled dark; ember accents on the dark path only |
| Typography | Bengali: Noto Sans Bengali ExtraBold (titles) + Tiro Bangla (meaning lines); Arabic: **Amiri / Noto Naskh Arabic** (to be fetched at production — not yet in repo); Latin: Inter |
| Motion language | Self-writing ink, word-by-word calligraphy, 3-node path infographic (mirrored), light trails, mask reveals, particle dust |
| Audio approach | Vocals-only ambient pad (no instruments) + soft SFX (ink, page, sub swells, heartbeat); **no music under the Arabic recitation**; target ≈ −14 LUFS |
| Signature | *Abdur Rahman Nayeem* handwritten-style, bottom-right, final 4s |

## Resources required

1. **8 AI-generated backgrounds** (1080×1920, prompt-locked to storyboard)
2. **Voiceover:** Bengali narration + Arabic recitation test — after user's voice selection
3. **Arabic font:** Amiri or Noto Naskh Arabic (download from GitHub, OFL)
4. **Audio:** ambient vocal pad (generated/licensed), SFX set, loudness normalize
5. **Render:** existing Node pipeline (1080×1920@30, H.264+AAC); ffmpeg via `npm install`
6. **Thumbnail:** 1080×1920 — split gold/ember «সিদ্দীক / কায্যাব» + hook question
7. **Subtitles:** Bengali .srt from VO word-timing

## Pipeline

`npm install` (ffmpeg/canvas) → assets → VO → word-timing → scene renders →
composite/grade → QC (`production/QUALITY_CONTROL.md` + frame contact-sheet) →
final MP4 `Mithya-Hadith-Bukhari-6094-Final.mp4`.

## Delivery plan

- Drive target: `09 - Final Videos/Hadith/` (+ docs to `04/05`, SRT to `11`, thumb to `10`,
  VO to `08`) — **currently blocked** by the Drive connector parameter issue
  (`system/GOOGLE_DRIVE_MAP.md`); fallback: Git one-click download links + Drive
  upload when the connector is fixed, with verification.

## Approvals

- [ ] Voice selection (user)
- [ ] Plan approval (user)
- [ ] QC pass (studio)
