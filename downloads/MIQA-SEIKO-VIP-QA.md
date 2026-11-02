# SEIKO VIP — final QA (2026-11-02)

## Measured exports

| File | Resolution | Video frames | Duration | Integrated loudness | True peak |
|---|---:|---:|---:|---:|---:|
| MIQA-SEIKO-VIP-4K.mp4 | 2160×3840 | 1560 | 52.000000 s | -14.7 LUFS | -2.0 dBTP |
| MIQA-SEIKO-VIP-Facebook-1080p.mp4 | 1080×1920 | 1560 | 52.000000 s | -14.7 LUFS | -2.0 dBTP |

Both files: H.264, yuv420p, 30 fps; AAC stereo, 48 kHz; fast-start MP4. Both video and audio streams have exactly 52.000000 seconds. One continuous 52-second audio mix; no speech restart at shot boundaries. Final AAC measurement is −14.7 LUFS / −2.0 dBTP, rather than claiming the −15 LUFS filter target as the measured result.

## Checks completed

- Full-file FFprobe counted all 1,560 video frames in each output.
- Full-file decode to null passed for both outputs (exit 0); no detected decoding errors.
- Black scan at pixel threshold 0.03, 98% picture threshold, minimum 0.05 s: no detected black intervals in either output.
- Native-UHD midpoint preflight for all 16 scenes inspected. All seven new photo assets separately visually inspected.
- Final encoded 1080p output sampled twice per second: 104 frames across the entire timeline, reviewed in seven saved contact sheets. All five looks appear, and retailer footer, guarantee/replacement badges, price and future net-profit commitment remain within the composition.
- Price/final cards use dark-emerald ৳১,৭৫০ on opaque warm ivory, rather than low-contrast gold over a gold bracelet. White/gold appearance crop preserves product aspect ratio.
- Nine narration clips have positive durations, do not overlap and fit their intended feature/price/commitment/CTA windows. Exact spoken text and timing recorded in narration.json. First narration begins 7.55 s; initial 7.4 s is an instrumental product reveal. Color guarantee is a native-screen badge, not a separate spoken sentence.
- WAV/ZIP inputs packaged and ZIP CRC-tested. Source manifest provides SHA-256 for all 11 photographic assets and nine narrator WAVs. Generated assets plus retained generated appearance sources are used, not customer-photo cutouts.
- Source/scene review: exactly three primary hands, appropriate finish/bracelet combinations, no fake fourth hand or invented caseback scene. Fine photographic/date/hand-angle variations across AI shots remain possible; no documentary-identity guarantee.
- No free gifts, refund promise, scarcity, completed charitable impact, water rating or unconfirmed price. MIQA's spending commitment is 5% of net profit, prospective, and separate from manufacturer identity.

## Scope / limitations

UHD canvas and graphics are native 2160×3840. Photographic inputs are lower-resolution generated images upscaled into that canvas; this is not native-4K photographed footage. Motion is multi-angle still-photo framing/roll, not verified true 360° footage. Lock mechanism and water droplets are illustrative, not a manufacturing inspection or water-resistance test. QA is technical decoding, loudness/peak measurement, scene/cue alignment and visual frame review; it is not third-party product certification or a platform upload/transcode test. Facebook can recompress the video.

## Final SHA-256

- `MIQA-SEIKO-VIP-4K.mp4` — 23,662,321 bytes
  `83a5eaa024a1ef424a9efbb3e669981e8a6fc1d4de59b61b128fd32fd7085e3e`
- `MIQA-SEIKO-VIP-Facebook-1080p.mp4` — 13,369,688 bytes
  `5b1f78ce0791af4547bea1b3d2e18e0db64e52c69fe7bc4823c42ec41efd3abe`
- `MIQA-SEIKO-VIP-Production-Assets.zip` — 21,028,912 bytes
  `fce4ae7df57bb72806517e633f6bbdab3d63c615d631b7c09682b0561ab5e7ee`
