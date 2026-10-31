# LONGINES / MIQA — leather and chain campaign

48-second Bengali vertical advertisement. User confirmed the supplied 17 reference photographs are the complete input set. All final imagery is generated; no original photograph/cutout is composited.

## Approved product facts

- Leather: 100% leather strap, waterproof, **৳১,৫০০**.
- Chain: butterfly clasp, chain-color guarantee (no invented term), waterproof, one-year warranty, **৳১,৭৯৯**.
- Both variants: **free battery and free bracelet pin-remover**. No battery model, compatibility, replacement/installation service or other benefit claimed.
- LONGINES is the dial name; MIQA is the retailer. No authenticity, origin, authorization or specific model-number marketing claim.
- Warranty and chain-color guarantee are explicitly scoped to the chain version, not the leather version.

## Deliverables

- `downloads/MIQA-LONGINES-4K.mp4` — UHD vertical master, 2160×3840.
- `downloads/MIQA-LONGINES-Facebook-1080p.mp4` — social export, 1080×1920.
- `downloads/MIQA-LONGINES-Additional-Assets.zip` — five additional generated photographs and nine new narration clips.
- `downloads/MIQA-LONGINES-QA.md` — final file checks and hashes.

The first ten generated source photographs are already stored under `downloads/longines-batch-01/` and in `downloads/MIQA-LONGINES-Batch-01-Images.zip`.

## Production

Nineteen scenes at 30 fps total 1,440 frames. The opening features a slow photographic pull-back; native-UHD type and restrained emerald/champagne design follow the reusable MIQA guide. Leather/chain prices have separate full-product scenes and are repeated together on the final comparison card. New feature-matched water, warranty, lifestyle and free-accessory photos complement the first batch. A generic ivory warranty information card is typeset in compositing, not portrayed as an official manufacturer's certificate. Water visuals show surface droplets, not a rated immersion test.

Nine fresh Bengali narration recordings use the previously selected `voice-01`. The water phrase is deliberately reused for each variant's matching water scene; no narration from earlier products is reused. Procedurally composed original instrumental music is smoothly ducked below speech. CTA starts when the dual-price card appears.

## Reproduce

Install existing npm dependencies and Python numpy/scipy/Pillow in `.venv`. Extract the additional ZIP's `generated/` and `audio/` into `.tmp/longines/`. The first ten images remain in their tracked `downloads/longines-batch-01/` paths. Create `.tmp/longines/render/`, `review/`, and `qa/`.

```
.venv/bin/python media/longines-2026/prepare.py
.venv/bin/python media/longines-2026/audio.py
node media/longines-2026/export.mjs
node media/longines-2026/qa.mjs
```

One process per scene, bounded photo loading, two encoder threads and explicit GC limit UHD memory. Segments join with video stream-copy; social video is downscaled once with Lanczos. AAC audio is copied from the master to the social export.

Source AI photographs are 768×1376 and upscaled; graphics/type are native 2160×3840. This is not native-4K camera footage. AI fine details can differ from inventory; inspect physical stock before publishing. Facebook may recompress; no platform playback guarantee is made.

No application, backend, production configuration or deployment changes.
