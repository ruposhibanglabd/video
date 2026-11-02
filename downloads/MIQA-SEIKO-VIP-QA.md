# SEIKO VIP — corrected opening-voice QA (2026-11-02)

## Measured exports

| File | Resolution | Video frames | Duration | Integrated loudness | True peak |
|---|---:|---:|---:|---:|---:|
| MIQA-SEIKO-VIP-4K.mp4 | 2160×3840 | 1560 | 52.000000 s | -15.8 LUFS | -3.1 dBTP |
| MIQA-SEIKO-VIP-Facebook-1080p.mp4 | 1080×1920 | 1560 | 52.000000 s | -15.8 LUFS | -3.1 dBTP |

Both files: H.264, yuv420p, 30 fps; AAC stereo, 48 kHz; fast-start MP4. Both video and audio streams have exactly 52.000000 seconds. One continuous 52-second audio mix; no speech restart at shot boundaries. Final AAC measurement is −15.8 LUFS / −3.1 dBTP, rather than claiming the −15 LUFS filter target as the measured result.

## Checks completed

- Full-file FFprobe counted all 1,560 video frames in each output.
- Full-file decode to null passed for both outputs (exit 0); no detected decoding errors.
- Black scan at pixel threshold 0.03, 98% picture threshold, minimum 0.05 s: no detected black intervals in either output.
- Native-UHD midpoint preflight for all 16 scenes inspected. All seven new photo assets separately visually inspected.
- Final encoded 1080p output sampled twice per second: 104 frames across the entire timeline, reviewed in seven saved contact sheets. All five looks appear, and retailer footer, guarantee/replacement badges, price and future net-profit commitment remain within the composition.
- Price/final cards use dark-emerald ৳১,৭৫০ on opaque warm ivory, rather than low-contrast gold over a gold bracelet. White/gold appearance crop preserves product aspect ratio.
- Ten narration clips have positive durations, do not overlap and fit their intended feature/price/commitment/CTA windows. Exact spoken text and timing recorded in narration.json. Opening narration now begins at 0.12 s and ends at 6.241333 s; steel narration remains at 7.55 s. Color guarantee is a native-screen badge, not a separate spoken sentence.
- WAV/ZIP inputs packaged and ZIP CRC-tested. Source manifest provides SHA-256 for all 11 photographic assets and ten narrator WAVs. Generated assets plus retained generated appearance sources are used, not customer-photo cutouts.
- Source/scene review: exactly three primary hands, appropriate finish/bracelet combinations, no fake fourth hand or invented caseback scene. Fine photographic/date/hand-angle variations across AI shots remain possible; no documentary-identity guarantee.
- No free gifts, refund promise, scarcity, completed charitable impact, water rating or unconfirmed price. MIQA's spending commitment is 5% of net profit, prospective, and separate from manufacturer identity.

## Scope / limitations

UHD canvas and graphics are native 2160×3840. Photographic inputs are lower-resolution generated images upscaled into that canvas; this is not native-4K photographed footage. Motion is multi-angle still-photo framing/roll, not verified true 360° footage. Lock mechanism and water droplets are illustrative, not a manufacturing inspection or water-resistance test. QA is technical decoding, loudness/peak measurement, scene/cue alignment and visual frame review; it is not third-party product certification or a platform upload/transcode test. Facebook can recompress the video.

## Missing opening voice — fixed

User reported missing opening narration in the first export. Fresh voice-03 hook now speaks: “স্টাইলের নতুন পরিচয়, সিকো ভি আই পি। আপনার স্টাইলের সঙ্গী, মিকা।” Its trimmed duration is 6.121333 seconds; cue 0.120000–6.241333 seconds fits inside the opening 0–7.4 seconds with no overlap with steel narration at 7.55 seconds. All original nine narration clips remain included. Music is ducked under the new hook.

Both revised videos were decoded again in full; 1,560 frames / 52 seconds, no detected black intervals or decode errors. Opening 7.4 seconds from each encoded AAC stream were decoded and correlated against the revised narrated mix: >0.98 for both (see opening-audio-check.json). This verifies that the final files contain the new opening mix, rather than merely adding a WAV to the source archive. Compressed video-packet SHA-256 was checked before/after and is identical for each resolution (opening-fix-video-integrity.json); pictures, timing, price and the previously reviewed frames are unchanged. Final measured loudness/peak values above are from the revised exports, not the original delivery.

## Final SHA-256

- `MIQA-SEIKO-VIP-4K.mp4` — 23,645,031 bytes
  `88b0cee18db5d09ebfa6547577fc16bf251f5348ad0256480363345cd3d6226c`
- `MIQA-SEIKO-VIP-Facebook-1080p.mp4` — 13,352,398 bytes
  `df2eb38fe502d78313db2f1d363e43cd293b8fafc4c7be23013d32017a369e3d`
- `MIQA-SEIKO-VIP-Production-Assets.zip` — 21,274,091 bytes
  `a08199df186d6ec1a5b071afa14c58f9913f19c003e390883e4a80a71bab59e0`
