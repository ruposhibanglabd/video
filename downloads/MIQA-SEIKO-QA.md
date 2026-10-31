# MIQA / SEIKO — export QA

Date: 2026-10-31. Duration: 40 seconds. Price: **৳১,৭৫০**.

## Verified exports

| File | Size (bytes) | SHA-256 |
|---|---:|---|
| `MIQA-SEIKO-Reel-4K.mp4` | 24,362,541 | `e5189d9d7637e450e22782d3f95d4194b254cd7109c7dbfdb47c7368e6635ca1` |
| `MIQA-SEIKO-Reel-Facebook-1080p.mp4` | 13,871,484 | `794ec397fc3a08345f50c15cf75e656795a769c8bb09f7ff161a4dded2fe5620` |
| `MIQA-SEIKO-Production-Assets.zip` | 28,598,327 | `ec489e2950a0ae707f041ab431d1d2a5bf1f8d26aef511c8055ba21caf2854bf` |

## Technical checks

- Master: 2160 × 3840; social: 1080 × 1920; both H.264 High, yuv420p, 30 fps, exactly 1,200 decoded frames / 40.000 seconds.
- Both files fully decoded successfully; no decoding errors or detected black intervals (98% black-pixel threshold; minimum interval 0.05 seconds).
- AAC stereo, 48 kHz, target 256 kbit/s; fast-start MP4. Social export copies the master audio without an extra audio encode.
- Measured audio: **−14.9 LUFS integrated**, **2.6 LU loudness range**, **−2.8 dBFS true peak** in both exports.
- All 15 composited scene midpoints and 80 half-second timeline samples visually reviewed. No unfinished frames or clipped final price/CTA found.
- Each scene rendered in a separate bounded-memory process. Segment frame counts sum to 1,200; final master joins segments without a lossy video re-encode.

## Content checks

- New SEIKO campaign, not a renamed Patek export. Four dial colors: silver/grey, black, blue and white. Gold-center / silver-outer two-tone bracelet.
- All 15 product/lifestyle images newly AI-generated from the supplied visual references. Source WebPs and cutouts are not used in the finished timeline.
- User-selected Bengali narrator throughout; new BDT 1,750 price and MIQA CTA voiced. Separate dial-color clips align with the matching images.
- Butterfly clasp, chain-color guarantee, waterproof presentation and one-year warranty each have dedicated matching scenes.
- Water concept shows surface droplets, not a rated pressure/immersion test. No unconfirmed depth rating, authenticity/Japan claim or model number.
- Gift box is illustrative and identified on screen as scene styling, not an included accessory.
- No inherited BDT 1,650 price, five-chain-color claim or unconfirmed social/charity statement.
- Instrumental background is an original procedural composition, mixed underneath the narration.

## Honest resolution / platform notes

- Source AI photographs: 768 × 1376, upscaled in the UHD composition. Typography and graphics rendered at native 2160 × 3840. This is not native-4K photographic footage.
- AI imagery may vary in fine product details; do not treat generated pictures as documentary authentication of inventory.
- Facebook-oriented export uses high-quality Lanczos scaling and H.264 CRF 18. Facebook can still recompress it; no Facebook upload/playback test or 4K playback guarantee is claimed.

## Reproduction

See `media/seiko-2026/README.md`, storyboard and production scripts. ZIP contains the 15 selected generated PNGs and 13 used narration WAVs. Original customer reference photos are excluded.

No app, backend, deployment or production configuration changes.
