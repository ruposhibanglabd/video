# MIQA Set A — delivery and quality-control record

Date: 2026-10-30

## Finished asset

- File: `MIQA-Butterfly-Lock-Set-A-Reel.mp4`
- Duration: 40.000 seconds
- Video: H.264 High, 1080 × 1920, progressive, 30 FPS, yuv420p
- Video frames: 1,200, confirmed by full frame count
- Audio: AAC-LC stereo, 48 kHz, approximately 196 kb/s
- File size: 10,633,386 bytes
- SHA-256: `57adf74d6f0249b662f162a4e14faccca106b6d109f001323f5f5a41e4b72a4b`
- Fast-start MP4: moov atom moved to beginning for streaming

## Checks performed

- Decoded the entire final video and audio with FFmpeg: success, no decoding errors.
- Ran black-frame detection over the full video: no black intervals reported.
- Inspected visual contact sheets sampled once per second across the complete 40-second timeline, plus larger scene/feature samples.
- Bengali text rendered with the repository's licensed Noto Sans Bengali fonts, not generated inside AI images.
- Measured longer subtitle/CTA lines to check central safe-area fit.
- Full-program EBU R128 audio measurement: -15.2 LUFS integrated, 4.5 LU loudness range, -2.3 dBFS true peak; no clipping.
- Narration positioned separately at each scene boundary and time-fitted with modest tempo adjustment, without pitch shifting. Feature captions and sounds share their visual timeline.

## Supplied photographs inspected

All ten attachments were inspected, including both original shop photographs:

1. IMG-20261030-WA0015.jpg
2. IMG-20261030-WA0016.jpg
3. IMG-20261030-WA0007.jpg
4. IMG-20261030-WA0006.jpg
5. IMG-20261030-WA0005.jpg
6. IMG-20261030-WA0014(1).jpg
7. IMG-20261030-WA0013.jpg
8. e48c77fd-2e22-4131-8716-f2d19291fc5e.webp
9. IMG20261029134012.jpg
10. IMG20261029133741.jpg

## Product and creative controls

- Product pixels are cutouts/crops of the supplied photographs, including the real lock and wrist photograph. AI backgrounds do not replace the watch.
- Observed chain finishes: gold and silver–gold two-tone. Supplied black, white/silver, blue and champagne/gold dial appearances are shown without inventing additional chain finishes.
- Five supplied complete-watch photographic appearances are presented sequentially in the color section. Their original camera perspectives are retained rather than fabricating matching 3D angles.
- No strap version, price, discount, review, scarcity, delivery offer, waterproof rating, warranty extension, beneficiary image or completed charitable-project claim was added.
- Water resistance, chain-color guarantee, one-year warranty and future net-profit commitment are seller-provided claims; this production did not independently test/certify them.
- MIQA is explicitly identified as the retailer/supplier. No MIQA marking was applied to the product.
- The website content was inspected. Official logo artwork could not be retrieved; the user explicitly selected permission to use a typographic MIQA wordmark instead.
- Three AI-generated environment plates: emerald product studio, office and gift display. These are composited photographic animation scenes, not generated 3D product footage or a simulated mechanical lock operation.
- Lifestyle office/formal shots animate the actual supplied wrist photograph; they are not newly filmed/generated human-motion footage.
- Gift presentation is illustrative, marked on-screen; no included packaging benefit is claimed.
- Original electronic score and effects were synthesized specifically for this advertisement; no third-party music samples were used.
- Bengali masculine commercial voice was auditioned and selected by the user.

## Repository isolation

Only the final MP4 and this quality-control record are added. Existing website/frontend/backend, rendering app, dependencies and production configuration are unchanged. No deployment was requested or initiated.

This session's fixed working branch is `arena/297d3995-video`; no other branch was created or used.
