# PRODUCTION PLAN — masjid-shishu-bukhari-516

**Version:** 1.0 (2026-11-17) · **Status:** Awaiting approval

## Pipeline (proven from mithya-hadith-bukhari-6094)
1. 9 AI backgrounds (768×1376, storyboard table) — Islamic-content review after generation.
2. VO: voice-00 (V1 docu-male, user-approved & reused) — 9 clips (S5 = Arabic, `language: ar`).
3. Renderer: reuse `render.mjs` engine from previous project (config-driven); project config + 9 scene painters (mostly reusable: hook, quote-card, Arabic reveal, promise cards, close).
4. Audio mix: VO + pad (split around S5) + SFX; loudnorm ≈ −14 LUFS, alimiter; post-master verify.
5. QC: stills per scene → encoded-file frame checks → loudness/TP → SRT.
6. Deliverables: MP4 1080×1920@30 (H.264+AAC, faststart), thumbnail (avatar+name logo), SRT, caption (FB/YT + short).

## Rules carried over
- No music under Arabic recitation (S5).
- নবী ﷺ অচিত্রিত — S6 সম্পূর্ণ প্রতীকী (জায়নামাজ + ছোট স্যান্ডেল + আলো)।
- Watermark bottom-right persistent (avatar + "Abdur Rahman Nayeem"), 62% opacity.
- Hadith numbers/gradings shown on screen: বুখারী ৫১৬ · নাসাঈ ১১৪১ (সহীহ) · বুখারী ৬৬০/মুসলিম ১০৩১।
- Verify before claiming; no unapproved upload to Drive.

## Estimates
- VO total ≈ 76s speech + Arabic ~17s → final ≈ 102s.
- Render ≈ 155s (30fps × ~3060 frames).
