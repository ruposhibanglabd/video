# Video Technical Standards

## 1. Primary delivery format

| Property | Standard |
|---|---|
| Aspect | **Vertical 9:16**, designed natively (never cropped from horizontal) |
| Resolution | **1080 × 1920 minimum** (2160 × 3840 4K master when justified — repo precedent exists) |
| Frame rate | 30 fps; 60 fps when motion benefits |
| Container / codec | MP4 · H.264 (high profile) or H.265 |
| Audio | High-quality AAC, 48 kHz; loudness ≈ −14 LUFS integrated |
| Subtitles | Embedded Bengali subtitles + sidecar `.srt` |
| Composition | Mobile-safe typography and subjects (see §2) |

## 2. Mobile-safe areas (1080×1920 canvas)

- Keep critical text/subjects inside the central safe zone; avoid the top ~250 px and
  bottom ~320 px platform-UI bands and the right-edge action rail (~120 px).
- The creator signature sits inside the safe area (bottom-right preferred) and never
  collides with subtitles — see `../personal-brand/SIGNATURE_GUIDELINES.md`.

## 3. In-repo production toolchain (verified 2026-11-17)

- **Node 22** renderer: `src/render/` (CLI, deterministic, frame-accurate),
  `@napi-rs/canvas` for raster, `mp4-muxer` + WebCodecs for encoding; browser pipeline
  in `public/` + `src/browser/`.
- **ffmpeg/ffprobe:** via `@ffmpeg-installer/ffmpeg` after `npm install`
  (no system ffmpeg installed).
- **Python 3.11** available; media packages (moviepy, Pillow, numpy, pydub) installable
  from PyPI when a project needs them.
- **ImageMagick** (`convert`) available for image ops.
- Bengali + Latin fonts on disk — see `TYPOGRAPHY_GUIDELINES.md` §5.
- Frame-QA precedent: `tools/qa-frames.mjs` (contact sheets).

## 4. File naming

Meaningful, hyphenated, descriptive: `Bengal-Tiger-Premium-Reel-Final.mp4`,
`Ayatul-Kursi-Educational-Animation-Final.mp4`, `Sabr-Islamic-Story-Reel-Final.mp4`.
