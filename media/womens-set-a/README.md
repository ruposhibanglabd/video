# Women's Set A — complete three-style photo set

User reconfirmed on 2026-11-03: even a single watch reference requires **three distinct styles**, not just one hero. The earlier single-image delivery was incomplete. This correction retains the selected main and adds the selected wrist and detail photographs.

## Final files

`downloads/womens-set-a/`:

- `01-main.png` / `01-main.webp`: full-product hero; native Bengali **বাটারফ্লাই লক** label only on this image.
- `02-wrist.png` / `02-wrist.webp`: natural adult wrist view, pink sleeve/background, no extra writing/inset.
- `03-detail.png` / `03-detail.webp`: glass/dial/crown/bracelet close-up, no extra writing/inset.
- `product-copy.md`: proposed non-official display name, short/detailed Bengali copy, confirmed benefits and production caveats.

`downloads/MIQA-Womens-Set-A-Three-Styles.zip`: all three lossless website copies, three PNG masters, product copy, source/byte manifest and this README.

Main option 2 was selected earlier. For the corrective completion, wrist option 2 and detail option 1 were selected. No rejected/unselected audition is shipped. All three styles have been separately visually reviewed. Main PNG is unchanged from prior approved delivery.

## Fidelity / limitations

Soft blush/pink theme; silver-tone watch, cushion/rounded-rectangular case, light pinstriped dial, four decorative cardinal indices, exactly three primary hands, right crown and narrow multi-row bracelet. Recognizable phone/person reflections removed; polished-metal and transparent-glass highlights retained. Wrist anatomy/fit reviewed; detail deliberately distinct from full hero. No added text outside product markings on wrist/detail. No invented hidden clasp, gemstone/material grade, water depth, price or 4K claim.

Images are reference-based AI commercial styling, not documentary product captures, authenticated branding or a real customer testimonial. Original dial lettering is blurred and its reconstructed spelling is not verified. Fine generated geometry/hand-angle/marking differences may remain; no claim of exact frozen time, physical measurements or pixel-identical inventory reconstruction.

Confirmed copy: **water resistant**, butterfly clasp, bracelet-color guarantee (duration unspecified), seven-day replacement (not refund), **six-month warranty** (not a color-guarantee duration). No prior campaign terms inherited.

## Native resolution and lossless compression

Native PNG dimensions retained: main 1024×1536; wrist 848×1264; detail 1280×1920. No enlargement, reduction, palette quantization or fake native-4K export. `optimize.py` compares lossless WebP against optimized full-color PNG and delivers the smaller pixel-identical format. WebP won for all three. Each decoded RGBA raster equals its canonical PNG master byte-for-byte; original ICC presence/content is preserved. See `set-manifest.json` for exact bytes, reduction percentages and SHA-256. The old `manifest.json` remains valid metadata for the unchanged main PNG only.

To reproduce website copies: Python with Pillow, run `python media/womens-set-a/optimize.py`. `compose.mjs` regenerates the main Bengali label from its selected source using the existing Bengali font and @napi-rs/canvas. Original reference and selected source files are retained in this directory; do not regenerate a selected image merely to change the export format.

Standing three-style completion gate is recorded at the top of `MIQA-PHOTO-WORKFLOW.md`. No app, backend, frontend, website or deployment changes.
