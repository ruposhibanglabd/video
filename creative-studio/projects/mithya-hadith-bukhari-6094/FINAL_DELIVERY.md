# FINAL DELIVERY — mithya-hadith-bukhari-6094

**Status:** ✅ QC PASSED — **v2** (2026-11-17): persistent avatar+name brand watermark (bottom-right, one fixed place) per user request. Awaiting user's final-production approval before Drive upload.

## Primary deliverables (in this repo)

| Deliverable | Location | Verified |
|---|---|---|
| **Final MP4** (92.84s, 1080×1920@30, H.264 + AAC 192k, 38.5 MB) | `output/Mithya-Hadith-Bukhari-6094-Final.mp4` | ✔ |
| **Thumbnail** (1080×1920 PNG) | `assets/thumbnail.png` | ✔ |
| **Subtitles** (26 cues, phrase-accurate) | `output/Mithya-Hadith-Bukhari-6094.srt` | ✔ |

## Source assets (reproducible pipeline)

| Deliverable | Location | Verified |
|---|---|---|
| 8 AI backgrounds | `assets/bg-s1..s8.jpg` | ✔ (incl. bg-s2 regenerate) |
| 8 VO clips (voice-00) | `assets/vo-s1..s8.mp3`, `vo-s4-arabic.mp3` | ✔ |
| Arabic fonts (OFL) | `creative-studio/assets/fonts/amiri/` | ✔ |
| Renderer (config + engine) | `render/config.mjs`, `render/render.mjs` | ✔ |

## QC summary

- **Video:** h264 1080×1920, 30 fps, +faststart — ffprobe verified.
- **Audio:** integrated −12.0 LUFS, true peak −0.9 dBTP, no clipping; ambient pad
  split around S4 (no pad/instruments under Arabic recitation); SFX synced to
  on-screen beats (chimes per path-node, sub-swells, page texture, heartbeat).
- **Content:** Arabic matn = RESEARCH.md verbatim (Sahih al-Bukhari 6094);
  on-screen Bengali = VO wording; references card সহীহ বুখারী ৬০৯৪ / সহীহ মুসলিম ২৬০৭.
- **Brand:** signature "Abdur Rahman Nayeem" bottom-right in final seconds,
  low prominence, mobile-safe margins respected throughout.
- **Frames:** 13 checkpoint frames pulled from the *encoded* file across all 8
  scenes + transitions + signature — all verified visually.

## Drive delivery (pending final approval)

- Root folder created: **«Abdur Rahman Nayeem - Creative Studio»** — ID
  `1reCNUTWBI_h9MVvSv5iT7Dqmd4gYSIud`
  (https://drive.google.com/drive/folders/1reCNUTWBI_h9MVvSv5iT7Dqmd4gYSIud)
- Subfolders (`09 - Final Videos/Hadith`, `10 - Thumbnails`, `11 - Subtitles`):
  blocked by intermittent connector parameter-drop; retry after approval.
- Upload rule honored: **no unapproved final video uploaded.**

| Deliverable | Drive target | Link | Verified |
|---|---|---|---|
| Final MP4 | `09 - Final Videos/Hadith/` | pending approval | ⬜ |
| Thumbnail | `10 - Thumbnails/` | pending approval | ⬜ |
| Subtitles (.srt) | `11 - Subtitles/` | pending approval | ⬜ |
