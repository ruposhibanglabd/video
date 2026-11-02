# MIQA / SEIKO VIP — customer-focused five-appearance campaign

Produced/revised 2026-11-02. Current edit follows user authorization, five confirmed VIP finish combinations, confirmed **BDT 1,750**, selected **voice-03**, the missing-opening-voice correction, and the latest request to critically review and improve the video from an online buyer's perspective.

See `CUSTOMER-REVIEW.md` for specific problems and implemented changes. This is an editorial usability revision, not a measured conversion experiment.

## Deliverables

- `downloads/MIQA-SEIKO-VIP-4K.mp4`: vertical UHD 2160×3840, 30 fps, 52 seconds / 1,560 frames.
- `downloads/MIQA-SEIKO-VIP-Facebook-1080p.mp4`: 1080×1920 social version.
- `downloads/MIQA-SEIKO-VIP-Production-Assets.zip`: 12 generated photographic sources (seven new production images, four retained appearance sources, one retained clean wrist image), ten selected-narrator WAVs, source manifest, storyboard, transcript, social caption and editorial notes.
- `downloads/MIQA-SEIKO-VIP-QA.md`: final measured media/decoding/audio checks and hashes.

## What is improved in this edit

- Price and prominent product name visible at the beginning; no need to wait until 34 s to learn the price.
- Larger individual-watch views using aspect-preserving background crops, with clear ০১–০৫ look labels.
- Generated wrist-wearing context at 34–39 s, replacing a repeated studio pose.
- All five looks together on the final card, not just a single white/gold watch.
- Larger Bengali feature/guarantee typography.
- Larger, higher-placed, high-contrast website plus a specific instruction to visit it to order. No unsupported contact, delivery or payment channel.
- All ten existing approved voice clips retained, including the previously missing hook.

## Confirmed claims and limits

**Stainless-steel bracelet**, **one-year warranty**, **color guarantee**, **seven-day replacement guarantee**, **waterproof**, **butterfly clasp**, **৳১,৭৫০**. No guarantee-period invention, refund promise, case alloy, glass/coating type, movement, origin/authenticity/authorization, official model number, pressure/depth rating or tested immersion claim. No free battery, bracelet cutter, box, discount, scarcity, shipping/COD or inherited campaign offer.

MIQA's future commitment is to spend **5% of NET PROFIT** toward employment opportunities for street children: not revenue, not completed spending/jobs, and not SEIKO's program. No fabricated beneficiaries, child-labor footage or testimonials. MIQA is the retailer; dial markings do not certify manufacturer authorization.

## Five authorized appearances

1. Royal-blue dial, all-gold-tone case/bracelet.
2. Royal-blue dial, silver case/crown, gold bezel, silver-dominant bracelet with narrow gold center.
3. Aqua/turquoise dial, all-gold-tone case/bracelet.
4. Silver/grey dial, silver case/crown, gold bezel, silver-dominant bracelet with narrow gold center.
5. White/silver dial, all-gold-tone case/crown/bracelet.

First four appearances reuse clean generated `source-main.webp` assets from completed photo sets. Rejected silver auditions and the older textured-dial black/white SEIKO design are excluded. Fifth is a generated matching image based on the three supplied white/gold references. Wrist shot reuses the clean generated `downloads/seiko-blue-gold/02-wrist.webp`; no customer photo/cutout, baked lock inset or storefront annotation is used as film imagery. Editorial look numbers are not manufacturer SKUs.

## Current 16-scene timeline

- 0–2.2: macro; prominent native SEIKO VIP title and ৳১,৭৫০ card.
- 2.2–4.4: laid-down side-angle; same visible price.
- 4.4–7.4: upright crown-side angle; same visible price.
- 7.4–11.5: steel-chain macro, native color-guarantee badge.
- 11.5–15.8: labeled illustrative butterfly-clasp close-up.
- 15.8–18.1: transparent surface droplets, no immersion/pressure test.
- 18.1–20.9: one-year warranty.
- 20.9–24: seven-day replacement guarantee, not refund.
- 24–34: five full-screen appearance cards, 2 s each, larger watches and numbered labels.
- 34–39: generated wrist context with price; existing price narration.
- 39–46.5: MIQA future commitment / net profit / 5% / employment for street children.
- 46.5–52: five-look comparison, ৳১,৭৫০, explicit website-order CTA and warranty/replacement reminder.

All ten original selected-voice clips remain. Hook 0.12–6.241333 s; steel begins at 7.55 s; exact words/times in `narration.json`. Color guarantee is on-screen, not separately voiced. No speech regeneration or narrator change in this customer-focused revision. Voice IDs are session-scoped.

## Resolution / motion / sound honesty

UHD typography/graphics are native 2160×3840. New production photos are a 1024×1024 macro and six 768×1376 vertical images; retained sources have their stored native dimensions. Photos are upscaled. Opening macro crops 500×889 source pixels. All other crops preserve aspect ratio; product views keep the visible case/crown/bracelet, cropping background rather than stretching watches. Generated wrist context is not a verified scale/fit measurement or real-customer endorsement.

Motion is controlled multi-angle AI-photo framing/roll, not filmed true 360°, new documentary camera footage, an invisible caseback or an authenticated operating mechanism. Fine date/hand-angle/marking variations across AI sources remain possible; no pixel-identical inventory reconstruction guarantee.

Original procedural harmonic music and gentle accents, speech ducking and AAC stereo. No third-party song or voice impersonation. Measured final loudness/peak is reported in QA, not inferred from the normalization filter target. Facebook may recompress; no platform upload/playback guarantee.

## Reproduce / inspect

Install existing npm dependencies and Python Pillow/numpy/scipy. Extract ZIP `generated/` and `audio/` into `.tmp/seiko-vip/`; existing fonts are in `assets/fonts/`. Do not delete approved WAVs.

```
.venv/bin/python media/seiko-vip-video-2026/prepare.py
.venv/bin/python media/seiko-vip-video-2026/audio.py
node media/seiko-vip-video-2026/export.mjs
node media/seiko-vip-video-2026/qa.mjs
.venv/bin/python media/seiko-vip-video-2026/customer-qa.py
```

`render.mjs <index> --still` creates a UHD midpoint preflight without encoding. `export.mjs <index>` resumes only with complete earlier segments; index16 joins/exports existing scenes. One process per scene, bounded FFmpeg threads/lookahead; UHD segments joined by stream-copy; social downscaled once with Lanczos. `revise-audio.mjs` is the historical opening-voice correction tool, not required for a full new export.

Full final-file decode/frame count/black scan/loudness checks, opening-voice presence, ten cue windows, unchanged source WAVs, phone-size frame review and remote-byte hashes must pass before delivery. No website/frontend/backend/database/config/deploy or other campaign changes.
