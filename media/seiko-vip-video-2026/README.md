# MIQA / SEIKO VIP — five-appearance video campaign

Produced 2026-11-02 following user inventory approval, missing white/gold references, explicit permission and confirmed **BDT 1,750**. This is a new VIP campaign, not the earlier textured-dial SEIKO video or the TISSOT ad.

## Deliverables

- `downloads/MIQA-SEIKO-VIP-4K.mp4`: vertical UHD 2160×3840, 30 fps, 52 seconds / 1,560 frames.
- `downloads/MIQA-SEIKO-VIP-Facebook-1080p.mp4`: 1080×1920 social version.
- `downloads/MIQA-SEIKO-VIP-Production-Assets.zip`: seven new generated photo assets, four retained generated unannotated appearance sources, ten new selected-narrator WAVs, transcript and source notes.
- `downloads/MIQA-SEIKO-VIP-QA.md`: measured final metadata/decoding/audio review and final-file hashes.

## Confirmed claims and limits

**Stainless-steel bracelet**, **one-year warranty**, **color guarantee**, **seven-day replacement guarantee**, **waterproof**, **butterfly clasp**, **৳১,৭৫০**. Color-guarantee duration, replacement conditions, refund rights and water rating are not specified and are not invented. Steel claim applies to the bracelet; no unverified case alloy, glass/coating type, movement, origin/authenticity/authorization or official model number is claimed.

User reconfirmed MIQA's commitment to spend **5% of NET PROFIT** on employment opportunities for street children. This is MIQA's future commitment, not sales/revenue, not a manufacturer program and not an assertion that money has already been spent or jobs created. Dedicated native-graphic scene and fresh narration state the commitment. No fabricated beneficiary images, children at work, completed-program footage or testimonials.

No free box, battery, bracelet cutter, discount, delivery, scarcity or old campaign offer is imported. The lock image shows the clasp, not a chain-removal tool. MIQA is the retailer; SEIKO/VIP are dial markings, not proof of manufacturer authorization.

## Appearance inventory

Five color/finish combinations (not invented separate official models):

1. Royal-blue dial, all-gold-tone case/bracelet.
2. Royal-blue dial, silver case/crown, gold bezel, silver-dominant bracelet with narrow gold center.
3. Aqua/turquoise dial, all-gold-tone case/bracelet.
4. Silver/grey dial, silver case/crown, gold bezel, silver-dominant bracelet with narrow gold center.
5. White/silver dial, all-gold-tone case/crown/bracelet.

First four reuse generated, unannotated `source-main.webp` files from completed photo sets; rejected silver-dial auditions are excluded. Fifth uses a new matching photo generated from the three supplied gold/white references. Original customer photographs/cutouts are never displayed. Prior framed main photos with baked lock labels are not used as full-screen film imagery.

## Creative and timeline

16 scenes / 52 seconds, intentionally allowing readable coverage and an unhurried social-commitment line:

- 0–7.4: narrated macro → laid-down side-angle → upright crown-side reveal. Controlled animated camera framing/roll and original soft transition accents; product visible from the first frame.
- 7.4–11.5: steel-chain macro, clearly typeset color guarantee. Color guarantee is on-screen, not separately spoken.
- 11.5–15.8: illustrative open butterfly clasp, matching spoken lock phrase.
- 15.8–18.1: visible transparent surface water droplets; no immersion/pressure test.
- 18.1–20.9: one-year warranty native retailer card.
- 20.9–24: seven-day replacement native retailer card, not a refund claim.
- 24–34: five separately captioned appearance cards, two seconds each.
- 34–39: spoken/typeset ৳১,৭৫০, high-contrast warm-ivory price card.
- 39–46.5: MIQA future commitment: net profit / 5% / employment for street children.
- 46.5–52: price, retailer ordering CTA and website.

The opening is a **multi-angle AI-photo cinematic reveal with animated framing**, not a physically verified 360° video or newly captured camera footage. No invisible caseback/operating mechanism is invented to pretend a complete turntable capture. Butterfly view is an illustrative mechanism, captioned accordingly. Photos can have fine-detail variation; hand directions/date numeral shapes can differ between generated views, and tiny hand counterweights are not extra primary hands. Never describe these sources as documentary/pixel-identical inventory reconstruction.

Emerald/champagne grading, warm-white Bengali typography, mobile-safe central layout, clean manufacturer/retailer separation, correct transparent-glass highlights, frame-safe prices and subdued music. Ten fresh clips use **voice-03**, the newly selected audition after the user rejected the earlier pair. Voice IDs are session-scoped. Opening narration starts at 0.12 seconds and ends at 6.241333 seconds, ahead of the steel line at 7.55 seconds. Exact words/timings are in `narration.json`.

## Resolution and sound honesty

New photo sources: 1024×1024 opening asset, six 768×1376 vertical assets. Four retained generated appearance photos have their stored native dimensions. Photo pixels are upscaled; native UHD typography/graphics are rendered at 2160×3840. The first macro crops a 500×889 region of the new opening photo before UHD presentation, so it is not native-4K photographic detail. Contain/crop operations preserve aspect ratio and do not stretch the watches. Fifth appearance crop excludes only background margins, not the product.

Original procedural harmonic music and gentle transition accents; smooth speech ducking; final loudness normalization and AAC stereo. No third-party song or voice impersonation. Facebook may recompress; no upload/playback verification or universal 4K display guarantee is claimed.

## Reproduce

Use existing npm dependencies plus a Python environment with Pillow/numpy/scipy. Extract ZIP `generated/` and `audio/` into `.tmp/seiko-vip/`; make `render/`, `review/` and `qa/` subdirectories. Existing fonts are in `assets/fonts/`.

```
.venv/bin/python media/seiko-vip-video-2026/prepare.py
.venv/bin/python media/seiko-vip-video-2026/audio.py
node media/seiko-vip-video-2026/export.mjs
node media/seiko-vip-video-2026/qa.mjs
```

`render.mjs <index> --still` produces a native-UHD preflight frame without encoding. `export.mjs <index>` resumes at a scene only when earlier MP4s are complete; index16 joins/exports existing segments. One process per scene and bounded FFmpeg threads/lookahead keep memory bounded. UHD is joined by stream-copy; social is downscaled once with Lanczos. Full-file decode/frame count/black scan/loudness and final timeline samples must pass before delivery. Confirm remote bytes/hashes before sharing immutable GitHub Raw links.

No website/frontend/backend/database/config/deploy changes. Existing campaigns and photo sets remain untouched.

## Opening-voice correction

The first delivery omitted the opening narration. User reported the missing voice; this revision adds a fresh hook in the same selected voice-03: “স্টাইলের নতুন পরিচয়, সিকো ভি আই পি। আপনার স্টাইলের সঙ্গী, মিকা।” No visual scenes, price or existing narration wording were changed. `revise-audio.mjs` remuxes both resolutions with the new ducked/normalized ten-clip mix and verifies that compressed video-packet SHA-256 stays identical before replacing the final files. Both revised exports undergo full QA again.
