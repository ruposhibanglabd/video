# SEIKO / MIQA — Bengali vertical campaign

40 seconds, 30 fps. Confirmed price BDT 1,750. SEIKO dial branding; MIQA is the retailer, not the watch manufacturer. Grey/silver, black, blue and white dials share the gold-center / silver-outer bracelet design.

## Deliverables

- `downloads/MIQA-SEIKO-Reel-4K.mp4`: 2160 × 3840 master.
- `downloads/MIQA-SEIKO-Reel-Facebook-1080p.mp4`: 1080 × 1920 social export.
- `downloads/MIQA-SEIKO-Production-Assets.zip`: selected generated photographs and selected Bengali narration inputs.
- `downloads/MIQA-SEIKO-QA.md`: export and verification notes.

AI photographs are generated at 768 × 1376 and upscaled for the 4K master. Text and vector graphics are composed at 2160 × 3840. This is not native-4K camera footage; fine details of AI-generated images may vary from physical inventory. Original user photographs are generation references only, never composited into the finished ad. Verify physical inventory before selling.

## Confirmed claims only

Butterfly clasp, chain-color guarantee (no invented term), waterproof (no depth/pressure rating or immersion demonstration), one-year warranty. Gift packaging is illustrative and captioned accordingly. No authenticity/origin/model-number claims, discounts, charity claims, fabricated reviews or delivery promises.

## Reproduce

From repository root, install existing npm dependencies and Python Pillow/numpy/scipy in a venv. Extract `generated/` and `audio/` from the asset ZIP into `.tmp/seiko/`; create `.tmp/seiko/render/` and `.tmp/seiko/review/`.

```
.venv/bin/python media/seiko-2026/audio.py
node media/seiko-2026/export.mjs
node media/seiko-2026/qa.mjs
```

`storyboard.json` is the scene/caption source. One renderer process per scene bounds memory. Final video concatenation is stream-copy; the social export is downscaled once with Lanczos. Speech uses the user's selected Bengali narrator; instrumental underscore is composed procedurally by `audio.py`, not a third-party music recording. Two FFmpeg threads and explicit garbage collection keep UHD rendering within this workspace's memory budget.

Source WebPs are not included in the production archive. No website, deployment or application configuration has been modified.
