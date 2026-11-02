# Product-image scripts (website images, 2000×2000)

These are the scripts used for job **Set A / 01 FIYOTA (Silver)** on 2026-11-03. Reuse them as templates.
Rules: `creative/PRODUCT-IMAGES-GUIDE.md`. Pipeline notes: `production/RUNBOOK.md §9`.

| File | What it does | What to change per photo |
|---|---|---|
| `segment.py` | GrabCut seeded by preview-scale polygons, guided-filter edge refinement, colour decontamination against an inpainted local background. Writes an RGBA cutout. | `S` (full-res ÷ preview width), crop window, `outer` and `core_*` polygons. Read them off a 1176-px preview with a 100-px grid. |
| `retouch.py` | Cleans the bracelet only; the case and crown are protected by a polygon. Steps: chroma → 12% (reflections become neutral silver), remove camera-lens spots (round dark blobs, eroded so touching dots separate, Telea inpaint r=5), slight shadow lift, unsharp. | `case_poly` and `crown_poly` |
| `compose.py` | The 5 images. Includes the exposure fix (levels ÷0.84, gamma 0.8, S-curve on metal only, bracelet floor lift 0.24), the radial Blush Mist background, shadows, fades, and the on-wrist composite. | Key points (`CASE_C`, `CASE_TOP`, `CASE_BOT`, `TOP_END`), scales and angles, plate paths, wrist x |
| `chip.mjs` | The primary-image chip: circular real-photo inset + Bengali label in one pill (`node chip.mjs "<label>" inset.png out.png women\|men\|couple`). Fonts load from `miqa/brand/fonts`. | — |

Setup: `python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy pillow scipy opencv-python-headless pymatting`. Also run `npm install` in the repo root (for `@napi-rs/canvas`).
Paths inside the scripts point to `/tmp/job/…`. Copy the client photos there, or edit the paths.
Pillow has no raqm, so **all Bengali text goes through `chip.mjs` (Skia)**.

## On-wrist recipe
1. Make the AI plate with `generate_image`: a close-up top-down shot, forearm horizontal, wrist bare, about half the frame height.
2. Crop it about 680 px around the wrist and upscale ×2.94 with Lanczos + unsharp.
3. Skin mask = Lab `b*−128 ≥ 17`. This separates warm skin from the pink set and its cast shadow.
4. Run each column inside the mask to find the wrist band.
5. Size the case at 0.58 × the skin width.
6. Keep the bracelet visible only inside the band: 24 px fade, plus edge shading 0.45→1 over 110 px.
7. Mask the shadows to the band.
