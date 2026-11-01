# TISSOT / MIQA — rectangular leather-watch advertisement

New campaign created 2026-11-01 from the user's 18 supplied reference photographs. **This is not a renamed LONGINES/SEIKO campaign.**

## Confirmed product brief

- Name from dial: **TISSOT**. Preserve `1853` and `Le Locle` markings as pictured; do not infer official model, Swiss origin, authenticity, automatic movement or authorization.
- Price for the advertised appearances: **৳১,৫০০ / BDT 1,500**.
- **Waterproof**, **one-year warranty**, **100% leather strap**.
- **Free premium box and battery**. User explicitly excludes a bracelet pin-remover/chain cutter because this is a strap watch.
- Seven supplied looks: silver/white/black strap; silver/dark/black strap; gold/black/black strap; silver/white/brown strap; gold/white/brown strap; black/black/black strap; silver/blue/black strap.
- Exact tall rectangular case, right-hand crown, two hands, thin baton indices and actual case/dial/strap colors; no date, seconds hand or invented complications.
- MIQA is the retailer, not the watch manufacturer. Previously approved emerald/champagne theme and selected Bengali narrator `voice-01` retained.

## Deliverables

- `downloads/MIQA-TISSOT-4K.mp4`: 2160×3840 UHD master, 40 seconds, 30 fps.
- `downloads/MIQA-TISSOT-Facebook-1080p.mp4`: 1080×1920 social export.
- `downloads/MIQA-TISSOT-Production-Assets.zip`: ten newly generated PNGs and eight newly generated Bengali narration WAVs.
- `downloads/MIQA-TISSOT-QA.md`: full-file decoding, visual timeline review, audio measurements and hashes.

## Creative and claims discipline

The product is immediately visible in a close cinematic opening, followed by a full hero, black leather texture, matching surface-water imagery, native-type one-year warranty information, seven appearance cards, price, free gifts and a final ordering card. The original customer photographs and cutouts are never displayed; all ten final photographic sources are newly generated. The material macro emphasizes the black front strap. A localized neutral grade removes excessive green cast on the water-shot strap while leaving the case/dial geometry unchanged.

The premium box is an unbranded illustrative presentation, with on-screen design clarification; it is not claimed to be official TISSOT packaging. The generic unbranded battery has no invented code, chemistry, installation or compatibility claim. No chain guarantee, butterfly clasp, chain cutter, alternative price, charity statement, discount, delivery/scarcity promise or testimonial is inherited from previous products. Water droplets do not represent a verified depth/pressure/immersion test.

Eight fresh Bengali voice clips use the selected narrator, with timing mapped to the corresponding features. The wording is recorded in `narration.json`. The original procedural instrumental underscore has smoothly ducked speech regions and fuller instrumental-only passages.

## Reproduce

Install existing npm dependencies and Python Pillow/numpy/scipy in `.venv`. Extract the production ZIP's `generated/` and `audio/` to `.tmp/tissot/`, then create `.tmp/tissot/render/`, `.tmp/tissot/review/` and `.tmp/tissot/qa/`.

```
.venv/bin/python media/tissot-2026/prepare.py
.venv/bin/python media/tissot-2026/audio.py
node media/tissot-2026/export.mjs
node media/tissot-2026/qa.mjs
```

The 15-scene manifest totals 1,200 frames. One renderer process per scene, two FFmpeg threads, bounded photo loading and explicit GC keep UHD memory bounded. Optional `export.mjs <index>` resumes at a scene index only when all earlier scene MP4s are already complete. The 4K master joins scene video without lossy re-encoding; the social export is downscaled once using Lanczos. Native canvas graphics and Bengali/Inter typography are rendered at 2160×3840.

All generated source photos are **768×1376 and upscaled**; this is not native-4K photographic footage. Fine generated details may vary from physical inventory. Facebook may recompress uploaded media; no platform-upload/playback test or 4K playback guarantee is claimed.

`reference-map.json` retains factual reference filename mapping, not the uploaded images. No website/app/backend/configuration/deployment changes.
