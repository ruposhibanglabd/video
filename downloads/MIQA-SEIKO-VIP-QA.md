# SEIKO VIP — customer-focused revision: final QA

2026-11-02. Supersedes the opening-voice-corrected `e845f03473bbb9573e2f069a7c49e59a193b4406` picture edit. User requested a critical online-buyer review followed by actual improvements. Detailed rationale and before/after specifics: `media/seiko-vip-video-2026/CUSTOMER-REVIEW.md`.

## Final measured outputs

| File | Resolution | Frames / rate | Video duration | Integrated loudness | True peak |
|---|---:|---:|---:|---:|---:|
| MIQA-SEIKO-VIP-4K.mp4 | 2160×3840 | 1560 / 30 fps | 52.000000 s | -15.8 LUFS | -3.1 dBTP |
| MIQA-SEIKO-VIP-Facebook-1080p.mp4 | 1080×1920 | 1560 / 30 fps | 52.000000 s | -15.8 LUFS | -3.1 dBTP |

Both H.264/yuv420p + AAC stereo at 48 kHz. Both audio streams also exactly 52.000000 s. Full-file FFprobe frame counting and full-file FFmpeg decoding passed (exit 0). Native MP4 box parsing confirmed `moov` precedes `mdat` in both final files for fast-start playback. Loudness/peak above are decoded final AAC measurements, not just a normalization target.

## Buyer-facing changes checked

- Opening 0–7.4 s now has a prominent product name and high-contrast **৳১,৭৫০** card. Previously the first price was at 34 s. Initial product visibility and multi-angle opening preserved.
- Larger aspect-preserving background crops for all five standalone appearance cards; Bengali numbered look labels rather than tiny dot-only indicators. No watch stretching or invented finish.
- 34–39 s now shows the existing generated blue/gold wrist view instead of repeating the upright studio shot. It is visual styling context, not a verified size/fit measurement or real-customer testimonial.
- Final 46.5–52 s simultaneously shows all five finishes, with short labels and matching editorial numbers; existing 2 s individual views retained. Numbers are not official model/SKU claims.
- Specific website-order instruction; native website font increased from 22 to 42 logical px. Website baseline moved 1750 → 1507 on the 1080×1920 design grid. At 360 px display width that is approximately 7.3 → 14 px nominal type and an 81 px upward move. No unsupported phone/Messenger/COD/delivery route.
- Native main Bengali headings 52 logical px, supporting lines 40; color guarantee 44, warranty/replacement badge type 76. Relevant price/card/website information stays readable without sound.
- All 16 native-UHD midpoint preflights inspected before encoding. Final encoded social output sampled at 2 fps: **104 frames**, all visually reviewed in seven saved contact sheets. Three actual final-video snapshots additionally reviewed at **360×640** phone size (`qa/customer-phone-check.jpg`). No detected off-frame essential text or product/CTA occlusion in those samples. Phone-safe layout cannot guarantee every app's overlays/caption length.

## Audio regression prevention — including the missing hook

- **Ten original selected voice-03 WAVs** and wording retained. Their SHA-256 values match the approved preceding delivery; no speech regeneration, new narrator, time stretching or altered claims.
- All ten cue windows checked for positive duration, proper feature/price/commitment/CTA alignment and no overlap. Hook **0.120000–6.241333 s**; steel still begins at **7.55 s**.
- Each actual final AAC stream was decoded, and all ten cue intervals were correlated against the corresponding approved spoken WAV after matching the original trim/resample. **20/20** checks passed (threshold >0.95); minimum measured correlation: **0.997738**. This independently checks the actual exported opening voice and all later cues, not just existence of a hook WAV or timing metadata. Evidence: `qa/customer-audio-check.json`.
- AAC compressed packet SHA-256 before/after this visual revision is **identical for each resolution**. The approved music/voice mix has not changed. Evidence: `qa/customer-audio-integrity.json`.
- No detected black interval in either full output at minimum duration 0.05 s / pixel threshold 0.03 / picture threshold 98%; no decoded errors. No automatic claim of a human listening test or platform upload test.

## Claim / source integrity

Confirmed: stainless-steel **bracelet**, one-year warranty, color guarantee without invented period, seven-day **replacement** (not refund), waterproof without rating/test claims, illustrative butterfly clasp and **৳১,৭৫০**. No free gifts, discount, scarcity, origin/authenticity/authorized-dealer claim, made-up case/movement spec or delivery/payment claim.

MIQA is retailer, separate from SEIKO. MIQA's commitment remains **5% of NET PROFIT**, future spending toward street children's employment, not sales/revenue or completed outcomes. No fabricated beneficiary/child-labor footage.

ZIP contains **12 generated photographic sources + 10 unchanged approved narrator WAVs**, plus six editorial/manifest/copy documents. CRC and all 22 source hashes checked. Newly included wrist source is byte-identical to the clean completed blue/gold wrist image. Rejected silver candidates, old textured-dial SEIKO models, customer cutouts and baked clasp-inset product mains are excluded.

## Limitations / history

Native 2160×3840 typography/graphics over upscaled lower-resolution AI photographic sources, not native-4K photographed footage. Controlled multi-angle still-photo motion, not verified true 360° footage. Mechanism/droplets are illustrative, not physical inspection or pressure tests. Fine generated date/hand/marking variation can remain. Exactly three primary hands checked in reviewed product sources; no documentary-inventory identity guarantee. No measured conversion uplift, consumer panel or manufacturer certification is claimed.

The old opening-fix proof JSON records have been moved to `qa/history/` and explicitly scoped to the preceding delivery; their old video-packet hashes do not describe this redesigned picture track. Current evidence is the `customer-*` QA set. Website/checkout/stock/terms were not modified or independently certified. Existing campaigns untouched.

## Final SHA-256

- `MIQA-SEIKO-VIP-4K.mp4` — 21,849,605 bytes
  `e63db9246624f1c84522629dd4d773c6a231663f168d33f5c7759539eb2c48ce`
- `MIQA-SEIKO-VIP-Facebook-1080p.mp4` — 13,182,091 bytes
  `f362b74bf4714cd334d2b0849153e44a9b20ba55f113f91474372489c7c3b9d5`
- `MIQA-SEIKO-VIP-Production-Assets.zip` — 24,390,966 bytes
  `56ea6a21b810a5b18d97f84dff695e7d0bacb1396d4e14b1a57223864614bd17`
